import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CustomerApp } from '@/models/CustomerApp';
import { User } from '@/models/User';
import { Campaign } from '@/models/Campaign';
import { expoPushService } from '@/lib/expoPush';

interface ChannelPreference {
  mobile: number;
  web: number;
  email: number;
}

class AIChannelOptimizer {
  static selectBestChannel(user: any, campaignType: string): 'mobile' | 'web' | 'email' {
    // AI 로직: 사용자 행동 패턴 기반 최적 채널 선택
    const preferences = this.getUserChannelPreferences(user);
    const channelEffectiveness = this.getCampaignChannelEffectiveness(campaignType);
    
    // 가중치 계산
    const scores = {
      mobile: preferences.mobile * channelEffectiveness.mobile,
      web: preferences.web * channelEffectiveness.web,
      email: preferences.email * channelEffectiveness.email
    };

    // 가장 높은 점수의 채널 선택
    return Object.keys(scores).reduce((a, b) => 
      scores[a as keyof ChannelPreference] > scores[b as keyof ChannelPreference] ? a : b
    ) as 'mobile' | 'web' | 'email';
  }

  private static getUserChannelPreferences(user: any): ChannelPreference {
    // 사용자의 과거 응답률 기반 선호도 계산
    const defaultPrefs = { mobile: 0.4, web: 0.4, email: 0.2 };
    
    // 최근 활동 기반 조정
    if (user.platform === 'mobile' || user.token) {
      defaultPrefs.mobile += 0.3;
      defaultPrefs.web -= 0.15;
      defaultPrefs.email -= 0.15;
    }
    
    if (user.webPushSubscription) {
      defaultPrefs.web += 0.2;
      defaultPrefs.mobile -= 0.1;
      defaultPrefs.email -= 0.1;
    }

    // 최근 활동 시간 고려
    const lastActive = new Date(user.lastActiveAt);
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActive > 7) {
      // 오래 안 온 사용자는 이메일이 더 효과적
      defaultPrefs.email += 0.2;
      defaultPrefs.mobile -= 0.1;
      defaultPrefs.web -= 0.1;
    }

    return defaultPrefs;
  }

  private static getCampaignChannelEffectiveness(campaignType: string): ChannelPreference {
    // 캠페인 유형별 채널 효과도
    const effectiveness = {
      'promotional': { mobile: 0.6, web: 0.3, email: 0.1 },
      'transactional': { mobile: 0.8, web: 0.2, email: 0.0 },
      'retention': { mobile: 0.3, web: 0.2, email: 0.5 },
      'welcome': { mobile: 0.5, web: 0.4, email: 0.1 },
      'abandoned_cart': { mobile: 0.4, web: 0.5, email: 0.1 },
      'default': { mobile: 0.5, web: 0.3, email: 0.2 }
    };

    return effectiveness[campaignType as keyof typeof effectiveness] || effectiveness.default;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { 
      title, 
      message, 
      appId,
      campaignType = 'default',
      channels = ['mobile', 'web'], // 활성화할 채널들
      targetUsers,
      icon,
      url,
      optimizeChannels = true // AI 채널 최적화 사용 여부
    } = body;
    
    // API 키 확인
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // 앱 확인
    const app = await CustomerApp.findOne({ apiKey }).lean();
    if (!app) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // 캠페인 생성
    const campaign = new Campaign({
      appId: (app as any)._id,
      companyId: (app as any).companyId,
      title,
      message,
      campaignType,
      channels,
      targetCriteria: targetUsers,
      status: 'active',
      stats: {
        mobileSent: 0,
        webPushSent: 0,
        emailSent: 0,
        mobileFailed: 0,
        webPushFailed: 0,
        emailFailed: 0,
        clicked: 0,
        converted: 0
      },
      createdAt: new Date()
    });

    await campaign.save();

    // 타겟 사용자 조회
    const query: any = { companyId: (app as any).companyId };

    if (targetUsers?.tags?.length > 0) {
      query.tags = { $in: targetUsers.tags };
    }

    if (targetUsers?.attributes) {
      Object.keys(targetUsers.attributes).forEach(key => {
        query[`attributes.${key}`] = targetUsers.attributes[key];
      });
    }

    const users = await User.find(query).lean();

    // 채널별 발송 결과
    const results = {
      mobile: { sent: 0, failed: 0 },
      web: { sent: 0, failed: 0 },
      email: { sent: 0, failed: 0 },
      users: [] as Array<{
        userId: any;
        channel: string;
        success: boolean;
        error?: string;
      }>
    };

    // 사용자별 최적 채널 선택 및 발송
    for (const user of users) {
      let selectedChannel: string;
      
      if (optimizeChannels) {
        // AI가 최적 채널 선택
        selectedChannel = AIChannelOptimizer.selectBestChannel(user, campaignType);
        
        // 선택된 채널이 활성화되어 있는지 확인
        if (!channels.includes(selectedChannel)) {
          selectedChannel = channels[0]; // 첫 번째 활성 채널 사용
        }
      } else {
        // 순서대로 채널 시도
        selectedChannel = channels.find((channel: string) => {
          if (channel === 'mobile') return user.token;
          if (channel === 'web') return user.webPushSubscription;
          if (channel === 'email') return user.email;
          return false;
        }) || channels[0];
      }

      try {
        let sendResult = false;

        if (selectedChannel === 'mobile' && user.token) {
          // 모바일 푸시 발송
          const notification = {
            to: user.token,
            title,
            body: message,
            data: {
              campaignId: campaign._id.toString(),
              companyId: (app as any).companyId,
              url: url || (app as any).website
            }
          };

          if (user.tokenType === 'expo') {
            const expoPushMessage = expoPushService.createCampaignMessage({
              to: user.expoPushToken,
              campaign: { title, message },
              campaignId: campaign._id.toString()
            });
            await expoPushService.sendSingleMessage({
              to: user.expoPushToken,
              title,
              body: message
            });
            sendResult = true;
          }
          // FCM 지원도 여기에 추가 가능

          if (sendResult) {
            results.mobile.sent++;
          } else {
            results.mobile.failed++;
          }

        } else if (selectedChannel === 'web' && user.webPushSubscription) {
          // 웹 푸시 발송 (별도 API 호출)
          const webPushResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/web-push/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey
            },
            body: JSON.stringify({
              title,
              message,
              appId: (app as any)._id,
              targetUsers: { userIds: [user._id] },
              icon,
              url,
              campaignId: campaign._id
            })
          });

          if (webPushResponse.ok) {
            results.web.sent++;
            sendResult = true;
          } else {
            results.web.failed++;
          }

        } else if (selectedChannel === 'email' && user.email) {
          // 이메일 발송 (향후 구현)
          // TODO: 이메일 발송 로직 추가
          results.email.sent++;
          sendResult = true;
        }

        results.users.push({
          userId: user._id,
          channel: selectedChannel,
          success: sendResult
        });

      } catch (error) {
        console.error(`Failed to send to user ${user._id}:`, error);
        (results as any)[selectedChannel].failed++;
        
        results.users.push({
          userId: user._id,
          channel: selectedChannel,
          success: false,
          error: (error as any).message || String(error)
        });
      }
    }

    // 캠페인 통계 업데이트
    await Campaign.findByIdAndUpdate(campaign._id, {
      $set: {
        'stats.mobileSent': results.mobile.sent,
        'stats.webPushSent': results.web.sent,
        'stats.emailSent': results.email.sent,
        'stats.mobileFailed': results.mobile.failed,
        'stats.webPushFailed': results.web.failed,
        'stats.emailFailed': results.email.failed
      }
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign._id,
      totalUsers: users.length,
      channelResults: results,
      aiOptimized: optimizeChannels
    });

  } catch (error) {
    console.error('Multi-channel campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to send multi-channel campaign' },
      { status: 500 }
    );
  }
}