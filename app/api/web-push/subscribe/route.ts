import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CustomerApp } from '@/models/CustomerApp';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check if this is a demo request
    const userAgent = request.headers.get('User-Agent') || '';
    const referer = request.headers.get('Referer') || '';
    const isDemoRequest = referer.includes('/demo/') || userAgent.includes('demo');
    
    const body = await request.json();
    const { subscription, userIdInClientApp, url } = body;
    
    // API 키 확인 (데모 요청 제외)
    const apiKey = request.headers.get('X-API-Key');
    let app = null;
    
    if (!isDemoRequest) {
      if (!apiKey) {
        return NextResponse.json({ error: 'API key required' }, { status: 401 });
      }

      // 앱 확인
      app = await CustomerApp.findOne({ apiKey }).lean();
      if (!app) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else {
      // 데모 모드: 기본 앱 설정 사용
      app = {
        companyId: 'demo',
        _id: 'demo-app-id'
      };
    }

    // 웹 푸시 구독 정보 저장
    const webPushData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      userAgent: userAgent || '',
      subscriptionUrl: url || ''
    };

    // 사용자 찾기 또는 생성
    let user = await User.findOne({
      userIdInClientApp,
      companyId: (app as any).companyId
    });

    if (user) {
      // 기존 사용자 업데이트
      user.webPushSubscription = webPushData;
      user.lastActiveAt = new Date();
      await user.save();
    } else {
      // 새 사용자 생성
      user = new User({
        userIdInClientApp,
        companyId: (app as any).companyId,
        appId: (app as any)._id,
        platform: 'web',
        webPushSubscription: webPushData,
        deviceInfo: {
          userAgent: userAgent || '',
          url: url || ''
        },
        tags: ['web_user'],
        attributes: {},
        lastActiveAt: new Date()
      });
      await user.save();
    }

    return NextResponse.json({ 
      success: true, 
      userId: user._id,
      message: 'Web push subscription saved successfully' 
    });

  } catch (error) {
    console.error('Web push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to save web push subscription' },
      { status: 500 }
    );
  }
}