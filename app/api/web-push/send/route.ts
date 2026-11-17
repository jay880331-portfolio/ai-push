import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { User } from '@/models/User';
import { Campaign } from '@/models/Campaign';
import { CustomerApp } from '@/models/CustomerApp';

// VAPID 키 설정 (환경변수에서 가져와야 함)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BPKMf1tx4rjAb1jmZN7Z_QxJEA5DK3Rr3H4_DH4j5FJjV8N2QrF5kL1D3J8Hf2Qw6P7mA9jV5zX1rL2qF9mN4pK8',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key'
};

// VAPID 키가 유효한 경우에만 설정
if (vapidKeys.publicKey && vapidKeys.privateKey && 
    vapidKeys.publicKey.length > 60 && vapidKeys.privateKey.length > 30) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:support@ridge-it.site',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  } catch {
    console.warn('VAPID keys not properly configured for web push');
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check if this is a demo request (no API key required)
    const userAgent = request.headers.get('User-Agent') || '';
    const referer = request.headers.get('Referer') || '';
    const isDemoRequest = referer.includes('/demo/') || userAgent.includes('demo');
    
    const body = await request.json();
    const { 
      title, 
      message, 
      targetUsers, 
      icon, 
      badge, 
      url,
      campaignId 
    } = body;
    
    // API 키 확인 (데모 요청 제외)
    let authContext;
    let vapidConfig = {
      publicKey: process.env.VAPID_PUBLIC_KEY || '',
      privateKey: process.env.VAPID_PRIVATE_KEY || '',
      email: process.env.VAPID_EMAIL || 'mailto:support@ridge-it.site'
    };
    
    if (!isDemoRequest) {
      try {
        authContext = await authenticateApiKey(request);
        
        // 고객별 VAPID 키 조회
        const customerApp = await CustomerApp.findOne({ 
          companyId: authContext.companyId 
        }).lean();
        
        if (customerApp && 'vapidKeys' in customerApp && customerApp.vapidKeys?.publicKey) {
          // 고객 고유 VAPID 키 사용
          vapidConfig = {
            publicKey: customerApp.vapidKeys.publicKey,
            privateKey: customerApp.vapidKeys.privateKey,
            email: customerApp.vapidKeys.email
          };
        }
        
      } catch (error) {
        return NextResponse.json({ error: (error as any).message }, { status: 401 });
      }
    } else {
      // 데모 모드: 기본 앱 설정 사용
      authContext = {
        companyId: 'demo',
        apiKey: 'demo-key'
      };
    }
    
    // 동적 VAPID 설정
    webpush.setVapidDetails(
      vapidConfig.email,
      vapidConfig.publicKey,
      vapidConfig.privateKey
    );

    // 타겟 사용자 조회
    const query: any = { 
      companyId: authContext.companyId,
      webPushSubscription: { $exists: true }
    };

    if (targetUsers?.tags?.length > 0) {
      query.tags = { $in: targetUsers.tags };
    }

    if (targetUsers?.attributes) {
      Object.keys(targetUsers.attributes).forEach(key => {
        query[`attributes.${key}`] = targetUsers.attributes[key];
      });
    }

    const users = await User.find(query).lean();

    // 웹 푸시 페이로드 생성
    const payload = JSON.stringify({
      title,
      body: message,
      icon: icon || '/logo.svg',
      badge: badge || '/badge.svg',
      url: url || 'https://ai-push.ridge-it.site',
      data: {
        campaignId,
        companyId: authContext.companyId,
        timestamp: new Date().toISOString()
      }
    });

    // 배치 전송
    const sendPromises = users.map(async (user) => {
      try {
        if (!user.webPushSubscription) return { success: false, error: 'No subscription' };

        const subscription = {
          endpoint: user.webPushSubscription.endpoint,
          keys: user.webPushSubscription.keys
        };

        await webpush.sendNotification(subscription, payload);
        return { success: true, userId: user._id };
      } catch (error) {
        console.error(`Failed to send to user ${user._id}:`, error);
        return { success: false, userId: user._id, error: (error as any).message || String(error) };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // 캠페인 통계 업데이트
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: {
          'stats.webPushSent': successCount,
          'stats.webPushFailed': failureCount
        }
      });
    }

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      successCount,
      failureCount,
      results
    });

  } catch (error) {
    console.error('Web push send error:', error);
    return NextResponse.json(
      { error: 'Failed to send web push notifications' },
      { status: 500 }
    );
  }
}