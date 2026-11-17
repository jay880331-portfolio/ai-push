'use client';

import { useState, useEffect } from 'react';

interface AIRecommendation {
  id: string;
  rule: {
    id: string;
    name: string;
    description: string;
    expectedImpact: string;
    category: 'retention' | 'conversion' | 'engagement';
  };
  targetUserCount: number;
  confidence: number;
  generatedMessage: string;
  reasoning: string;
  createdAt: string;
}

interface AIRecommendationsProps {
  companyId: string;
  onCampaignCreated?: () => void;
}

export default function AIRecommendations({ companyId, onCampaignCreated }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI 추천 불러오기
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/recommendations', {
        headers: {
          'X-API-Key': 'api-key-1', // API 키 추가
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error || '추천을 불러오는데 실패했습니다');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
      console.error('AI 추천 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 추천 기반 캠페인 생성
  const createCampaignFromRecommendation = async (recommendation: AIRecommendation) => {
    setCreating(recommendation.id);
    
    try {
      const response = await fetch('/api/campaigns/create-from-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key-1', // API 키 추가
        },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          patternId: recommendation.rule.id,
          customMessage: recommendation.generatedMessage,
          scheduleType: 'immediate'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ AI 캠페인이 생성되었습니다!\n\n📊 ${data.campaign.targetUserCount}명에게 발송 예정\n🎯 예상 효과: ${recommendation.rule.expectedImpact}`);
        
        // 추천 목록에서 제거 (이미 생성됨)
        setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
        
        // 상위 컴포넌트에 알림
        onCampaignCreated?.();
      } else {
        alert(`❌ 캠페인 생성 실패: ${data.error}`);
      }
    } catch (err) {
      alert('❌ 네트워크 오류가 발생했습니다');
      console.error('AI 캠페인 생성 오류:', err);
    } finally {
      setCreating(null);
    }
  };

  // 캠페인 생성 및 즉시 발송
  const createAndSendCampaign = async (recommendation: AIRecommendation) => {
    setCreating(recommendation.id);
    
    try {
      // 1단계: 캠페인 생성
      const createResponse = await fetch('/api/campaigns/create-from-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key-1',
        },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          patternId: recommendation.rule.id,
          customMessage: recommendation.generatedMessage,
          scheduleType: 'immediate'
        }),
      });

      const createData = await createResponse.json();
      
      if (!createData.success) {
        alert(`❌ 캠페인 생성 실패: ${createData.error}`);
        return;
      }

      // 2단계: 즉시 발송 (Expo Push)
      const sendResponse = await fetch('/api/campaigns/send-expo-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key-1',
        },
        body: JSON.stringify({
          campaignId: createData.campaign.id
        }),
      });

      const sendData = await sendResponse.json();
      
      if (sendData.success) {
        alert(`🚀 AI 캠페인이 즉시 발송되었습니다!\n\n📊 ${createData.campaign.targetUserCount}명에게 발송 완료\n✅ 발송 성공: ${sendData.sent}건\n🎯 예상 효과: ${recommendation.rule.expectedImpact}`);
        
        // 추천 목록에서 제거
        setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
        
        // 상위 컴포넌트에 알림
        onCampaignCreated?.();
      } else {
        alert(`❌ 발송 실패: ${sendData.error}\n\n캠페인은 생성되었으니 수동으로 발송해주세요.`);
      }
    } catch (err) {
      alert('❌ 네트워크 오류가 발생했습니다');
      console.error('AI 캠페인 생성 및 발송 오류:', err);
    } finally {
      setCreating(null);
    }
  };

  // 신뢰도에 따른 색상 결정
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // 카테고리별 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'retention': return '🔄';
      case 'conversion': return '💰';
      case 'engagement': return '📈';
      default: return '🎯';
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">🤖 AI가 패턴을 분석하고 있습니다...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          🤖 AI 추천 캠페인
          {recommendations.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {recommendations.length}개 추천
            </span>
          )}
        </h3>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          🔄 새로고침
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {recommendations.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-lg font-medium mb-2">분석할 데이터가 부족합니다</p>
          <p className="text-sm">사용자들의 이벤트 데이터가 쌓이면 AI가 패턴을 분석하여 추천해드립니다.</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <p className="text-sm font-medium text-blue-800 mb-2">🎬 데모 테스트 방법:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>위의 "데모 시뮬레이션" 섹션에서 "🚀 자동 시뮬레이션" 클릭</li>
              <li>시뮬레이션 완료 후 이 페이지에서 "🔄 새로고침" 클릭</li>
              <li>AI가 분석한 패턴 기반 추천 캠페인들이 나타남</li>
              <li>"🚀 즉시발송" 버튼으로 원클릭 발송 테스트</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getCategoryIcon(rec.rule.category)}</span>
                    <h4 className="text-lg font-semibold text-gray-800">{rec.rule.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                      신뢰도 {rec.confidence}%
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{rec.rule.description}</p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600">🤖</span>
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          AI 생성 메시지
                        </p>
                        <p className="text-blue-700 text-sm font-medium">{rec.generatedMessage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>🎯 타겟: {rec.targetUserCount.toLocaleString()}명</span>
                    <span>📈 {rec.rule.expectedImpact}</span>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    💡 {rec.reasoning}
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => createAndSendCampaign(rec)}
                    disabled={creating === rec.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {creating === rec.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        발송 중...
                      </>
                    ) : (
                      <>
                        🚀 즉시발송
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => createCampaignFromRecommendation(rec)}
                    disabled={creating === rec.id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {creating === rec.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        생성 중...
                      </>
                    ) : (
                      <>
                        📝 캠페인만 생성
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setRecommendations(prev => prev.filter(r => r.id !== rec.id))}
                    className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1"
                  >
                    ❌ 무시
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">💡 AI 추천 시스템 안내</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• AI가 사용자 행동 패턴을 분석하여 최적의 타이밍과 메시지를 추천합니다</li>
            <li>• 신뢰도가 높을수록 더 정확한 예측을 의미합니다</li>
            <li>• 추천을 수락하면 자동으로 캠페인이 생성되어 대상 사용자들에게 발송됩니다</li>
          </ul>
        </div>
      )}
    </div>
  );
}