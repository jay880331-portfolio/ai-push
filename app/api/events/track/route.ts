import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { Event } from '@/models/Event';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check if this is a demo request
    const userAgent = request.headers.get('User-Agent') || '';
    const referer = request.headers.get('Referer') || '';
    const isDemoRequest = referer.includes('/demo/') || userAgent.includes('demo');
    
    const body = await request.json();
    const { 
      appId, 
      userIdInClientApp, 
      eventName, 
      properties = {},
      timestamp 
    } = body;

    // API 키 인증 (데모 요청 제외)
    let authContext;
    
    if (!isDemoRequest) {
      try {
        authContext = await authenticateApiKey(request);
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

    // 필수 필드 검증 (데모에서는 appId 선택사항)
    if (!userIdInClientApp || !eventName) {
      return NextResponse.json(
        { error: 'userIdInClientApp, eventName are required' },
        { status: 400 }
      );
    }

    const finalAppId = appId || 'demo-app-id';

    // 이벤트 생성
    const event = new Event({
      companyId: authContext.companyId,
      appId: finalAppId,
      userIdInClientApp,
      eventName,
      properties,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await event.save();

    console.log('📊 Event tracked:', {
      companyId: authContext.companyId,
      appId: finalAppId,
      userIdInClientApp,
      eventName,
      properties
    });

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      event: {
        id: event._id,
        eventName: event.eventName,
        timestamp: event.timestamp
      }
    });

  } catch (error: any) {
    console.error('❌ Event tracking error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to track event',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}