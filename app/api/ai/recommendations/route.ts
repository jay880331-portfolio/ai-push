import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { aiPatternService } from '@/data/services/AIPatternService';

export async function GET(request: NextRequest) {
  try {
    // API 키 인증
    const authContext = await authenticateApiKey(request);
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId') || undefined;

    console.log('🤖 AI 패턴 분석 시작:', {
      companyId: authContext.companyId,
      appId
    });

    // AI 패턴 분석 실행
    const recommendations = await aiPatternService.analyzePatterns(
      authContext.companyId,
      appId
    );

    console.log('✅ AI 분석 완료:', {
      recommendationCount: recommendations.length,
      topRecommendations: recommendations.slice(0, 3).map(r => ({
        name: r.rule.name,
        targetUsers: r.targetUserCount,
        confidence: r.confidence
      }))
    });

    return NextResponse.json({
      success: true,
      recommendations,
      metadata: {
        analyzedAt: new Date().toISOString(),
        companyId: authContext.companyId,
        appId: appId || 'all'
      }
    });

  } catch (error: any) {
    console.error('❌ AI 추천 분석 오류:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'AI 추천 분석에 실패했습니다',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}