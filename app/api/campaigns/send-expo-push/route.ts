import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { expoPushService } from '@/lib/expoPush';
import { Campaign } from '@/models/Campaign';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // API 키 인증
    const authContext = await authenticateApiKey(request);
    await connectToDatabase();
    
    const body = await request.json();
    const { campaignId, testMode = false } = body;

    // 필수 필드 검증
    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaignId는 필수입니다' },
        { status: 400 }
      );
    }

    // 캠페인 조회
    const campaign = await Campaign.findOne({
      _id: campaignId,
      companyId: authContext.companyId
    });

    if (!campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 타겟 사용자 조회 (Expo Push Token이 있는 사용자만)
    let targetUsers;
    
    if (testMode) {
      // 테스트 모드: 현재 회사의 모든 Expo 토큰 사용자
      targetUsers = await User.find({
        companyId: authContext.companyId,
        pushToken: { $regex: /^ExponentPushToken\[/ }, // Expo 토큰 패턴
        isActive: true
      }).select('pushToken userIdInClientApp attributes');
    } else {
      // 실제 모드: 캠페인의 타겟 조건에 맞는 사용자
      const userIds = campaign.target.userIds || [];
      if (userIds.length === 0) {
        return NextResponse.json(
          { error: '타겟 사용자가 없습니다' },
          { status: 400 }
        );
      }

      targetUsers = await User.find({
        companyId: authContext.companyId,
        userIdInClientApp: { $in: userIds },
        pushToken: { $regex: /^ExponentPushToken\[/ }, // Expo 토큰 패턴
        isActive: true
      }).select('pushToken userIdInClientApp attributes');
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: 'Expo Push Token을 가진 타겟 사용자가 없습니다' },
        { status: 400 }
      );
    }

    // 푸시 메시지 생성
    const pushMessages = targetUsers.map(user => 
      expoPushService.createCampaignMessage({
        to: user.pushToken,
        campaign: {
          title: campaign.title,
          message: campaign.message,
          landingUrl: campaign.landingUrl
        },
        campaignId: campaign._id.toString()
      })
    );

    // 배치 발송
    const tickets = await expoPushService.sendBatchMessages(pushMessages);

    // 캠페인 상태 업데이트
    await Campaign.findByIdAndUpdate(campaignId, {
      status: 'sent',
      sentCount: targetUsers.length,
      $set: {
        'metadata.expoPushSentAt': new Date(),
        'metadata.expoPushTickets': tickets
      }
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: `${targetUsers.length}명에게 Expo Push 알림이 발송되었습니다`,
      sent: tickets.length, // AI 추천에서 사용하는 필드
      campaign: {
        id: campaign._id,
        title: campaign.title,
        message: campaign.message
      },
      results: {
        targetUserCount: targetUsers.length,
        sentCount: tickets.length,
        tickets: tickets.slice(0, 5), // 처음 5개만 반환
        sentAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ 캠페인 Expo Push 발송 오류:', error);
    
    return NextResponse.json(
      { 
        error: error.message || '캠페인 Expo Push 발송에 실패했습니다',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}