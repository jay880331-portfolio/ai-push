import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { Campaign } from '@/models/Campaign';
import { aiPatternService } from '@/data/services/AIPatternService';

export async function POST(request: NextRequest) {
  try {
    // API 키 인증
    const authContext = await authenticateApiKey(request);
    await connectToDatabase();
    
    const body = await request.json();
    const { 
      recommendationId,
      patternId,
      customMessage,
      scheduleType = 'immediate', // 'immediate' | 'scheduled'
      scheduledTime,
      appId
    } = body;

    // 필수 필드 검증
    if (!patternId) {
      return NextResponse.json(
        { error: 'patternId is required' },
        { status: 400 }
      );
    }

    console.log('🤖 AI 기반 캠페인 생성 시작:', {
      companyId: authContext.companyId,
      patternId,
      appId
    });

    // 패턴에 해당하는 타겟 사용자 조회
    const targetUserIds = await aiPatternService.getPatternTargetUsers(
      patternId,
      authContext.companyId,
      appId
    );

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: '해당 패턴에 맞는 타겟 사용자가 없습니다' },
        { status: 400 }
      );
    }

    // AI 추천 다시 생성하여 메시지 가져오기
    const recommendations = await aiPatternService.analyzePatterns(
      authContext.companyId,
      appId
    );
    
    const recommendation = recommendations.find(r => r.rule.id === patternId);
    const finalMessage = customMessage || recommendation?.generatedMessage || '안녕하세요!';

    // sendAt 시간 설정
    const sendAtTime = scheduleType === 'scheduled' && scheduledTime 
      ? new Date(scheduledTime)
      : new Date(); // 즉시 발송인 경우 현재 시간

    // 캠페인 생성
    const campaign = new Campaign({
      companyId: authContext.companyId,
      appId: appId || null,
      title: `AI 추천: ${recommendation?.rule.name || '자동 생성 캠페인'}`,
      message: finalMessage,
      target: {
        platform: 'all',
        userIds: targetUserIds,
        appIds: appId ? [appId] : []
      },
      sendAt: sendAtTime,
      status: scheduleType === 'immediate' ? 'draft' : 'scheduled',
      metadata: {
        aiGenerated: true,
        patternId,
        recommendationId,
        targetedUserCount: targetUserIds.length,
        confidence: recommendation?.confidence || 0,
        reasoning: recommendation?.reasoning || '',
        createdBy: 'AI_PATTERN_ANALYSIS'
      }
    });

    await campaign.save();

    console.log('✅ AI 캠페인 생성 완료:', {
      campaignId: campaign._id,
      targetUsers: targetUserIds.length,
      pattern: recommendation?.rule.name
    });

    return NextResponse.json({
      success: true,
      message: 'AI 기반 캠페인이 성공적으로 생성되었습니다',
      campaign: {
        id: campaign._id,
        title: campaign.title,
        message: campaign.message,
        targetUserCount: targetUserIds.length,
        status: campaign.status,
        aiInsight: {
          patternName: recommendation?.rule.name,
          confidence: recommendation?.confidence,
          expectedImpact: recommendation?.rule.expectedImpact,
          reasoning: recommendation?.reasoning
        }
      }
    });

  } catch (error: any) {
    console.error('❌ AI 캠페인 생성 오류:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'AI 캠페인 생성에 실패했습니다',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}