import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { Event } from '@/models/Event';
import { Campaign } from '@/models/Campaign';

export async function DELETE(request: NextRequest) {
  try {
    // API 키 인증
    const authContext = await authenticateApiKey(request);
    await connectToDatabase();

    console.log('🗑️ 데모 데이터 초기화 시작:', {
      companyId: authContext.companyId
    });

    // 시뮬레이션 관련 이벤트 삭제 (simulatedAt 속성이 있는 것들)
    const deletedEvents = await Event.deleteMany({
      companyId: authContext.companyId,
      'properties.simulatedAt': { $exists: true }
    });

    // AI 생성 캠페인 삭제 (metadata.aiGenerated가 true인 것들)
    const deletedCampaigns = await Campaign.deleteMany({
      companyId: authContext.companyId,
      'metadata.aiGenerated': true
    });

    console.log('✅ 데모 데이터 초기화 완료:', {
      deletedEvents: deletedEvents.deletedCount,
      deletedCampaigns: deletedCampaigns.deletedCount
    });

    return NextResponse.json({
      success: true,
      message: '데모 데이터가 성공적으로 초기화되었습니다',
      deleted: {
        events: deletedEvents.deletedCount,
        campaigns: deletedCampaigns.deletedCount
      }
    });

  } catch (error: any) {
    console.error('❌ 데모 데이터 초기화 오류:', error);
    
    return NextResponse.json(
      { 
        error: error.message || '데모 데이터 초기화에 실패했습니다',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}