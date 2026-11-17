import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { CustomerApp } from '@/models/CustomerApp';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check if this is a demo request
    const userAgent = request.headers.get('User-Agent') || '';
    const referer = request.headers.get('Referer') || '';
    const isDemoRequest = referer.includes('/demo/') || userAgent.includes('demo');
    
    if (isDemoRequest) {
      // 데모 모드: 공통 VAPID 키 반환
      return NextResponse.json({
        publicKey: process.env.VAPID_PUBLIC_KEY,
        success: true
      });
    }

    // API 키 인증
    const authContext = await authenticateApiKey(request);
    
    // 고객별 VAPID 키 조회
    const customerApp = await CustomerApp.findOne({ 
      companyId: authContext.companyId 
    }).lean();

    if (!customerApp) {
      return NextResponse.json(
        { error: 'Customer app not found' },
        { status: 404 }
      );
    }

    // 고객이 VAPID 키를 설정했는지 확인
    if (customerApp && 'vapidKeys' in customerApp && customerApp.vapidKeys?.publicKey) {
      // 고객 고유 VAPID 키 반환
      return NextResponse.json({
        publicKey: customerApp.vapidKeys.publicKey,
        email: customerApp.vapidKeys.email,
        success: true
      });
    } else {
      // VAPID 키가 없으면 기본 키 사용 (또는 에러)
      return NextResponse.json({
        publicKey: process.env.VAPID_PUBLIC_KEY,
        email: process.env.VAPID_EMAIL,
        success: true,
        usingDefault: true
      });
    }

  } catch (error) {
    console.error('VAPID keys API error:', error);
    return NextResponse.json(
      { error: 'Failed to get VAPID keys' },
      { status: 500 }
    );
  }
}