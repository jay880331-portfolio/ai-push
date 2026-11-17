import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/auth';
import { expoPushService } from '@/lib/expoPush';

export async function POST(request: NextRequest) {
  try {
    // API 키 인증
    const authContext = await authenticateApiKey(request);
    
    const body = await request.json();
    const { 
      expoPushToken, 
      title, 
      message, 
      data,
      campaignId 
    } = body;

    // 필수 필드 검증
    if (!expoPushToken || !title || !message) {
      return NextResponse.json(
        { error: 'expoPushToken, title, message는 필수입니다' },
        { status: 400 }
      );
    }

    // Expo Push Token 유효성 검증
    if (!expoPushService.isValidExpoPushToken(expoPushToken)) {
      return NextResponse.json(
        { error: '유효하지 않은 Expo Push Token입니다' },
        { status: 400 }
      );
    }

    // 푸시 알림 발송
    const tickets = await expoPushService.sendSingleMessage({
      to: expoPushToken,
      title,
      body: message,
      data: {
        ...data,
        companyId: authContext.companyId,
        campaignId: campaignId || 'test',
        timestamp: new Date().toISOString(),
      }
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: 'Expo Push 알림이 성공적으로 발송되었습니다',
      tickets,
      details: {
        to: expoPushToken,
        title,
        body: message,
        sentAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('❌ Expo Push 발송 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Expo Push 발송에 실패했습니다',
        details: error.details || null
      },
      { status: error.message?.includes('Invalid') ? 400 : 500 }
    );
  }
}