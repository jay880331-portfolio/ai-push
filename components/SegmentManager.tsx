'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ISegment, SegmentRule, SegmentOperator, CreateSegmentRequest, SegmentPreview } from '@/types';

export default function SegmentManager() {
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // 새 세그먼트 폼 상태
  const [newSegment, setNewSegment] = useState<CreateSegmentRequest>({
    name: '',
    description: '',
    rules: []
  });
  const [preview, setPreview] = useState<SegmentPreview | null>(null);
  const [creating, setCreating] = useState(false);

  const { apiKey } = useAuthStore();

  useEffect(() => {
    if (apiKey) {
      fetchSegments();
    }
  }, [apiKey]);

  const fetchSegments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/segments', {
        headers: {
          'X-API-Key': apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error('세그먼트 목록을 가져오는데 실패했습니다');
      }

      const data = await response.json();
      setSegments(data.segments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    const newRule: SegmentRule = {
      field: 'platform',
      operator: 'equals',
      value: 'android'
    };
    setNewSegment(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const updateRule = (index: number, updates: Partial<SegmentRule>) => {
    setNewSegment(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => 
        i === index ? { ...rule, ...updates } : rule
      )
    }));
  };

  const removeRule = (index: number) => {
    setNewSegment(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const previewSegment = async () => {
    if (newSegment.rules.length === 0) return;

    try {
      const response = await fetch('/api/segments/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey!,
        },
        body: JSON.stringify({ rules: newSegment.rules }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data.preview);
      }
    } catch (err) {
      console.error('Preview error:', err);
    }
  };

  const createSegment = async () => {
    if (!newSegment.name.trim() || newSegment.rules.length === 0) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey!,
        },
        body: JSON.stringify(newSegment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '세그먼트 생성에 실패했습니다');
      }

      const data = await response.json();
      setSegments(prev => [data.segment, ...prev]);
      
      // 폼 리셋
      setNewSegment({ name: '', description: '', rules: [] });
      setPreview(null);
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading && segments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">사용자 세그먼트 관리</h2>
            <p className="text-sm text-gray-600 mt-1">타겟 사용자 그룹을 정의하고 관리하세요</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            {showCreateForm ? '✕ 취소' : '+ 세그먼트 생성'}
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
            <span className="text-xl mr-3">⚠️</span>
            <div>
              <p className="font-medium">오류</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">🎯</span>
              새 세그먼트 생성
            </h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    세그먼트 이름
                  </label>
                  <input
                    type="text"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="VIP 고객"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    설명 (선택사항)
                  </label>
                  <input
                    type="text"
                    value={newSegment.description}
                    onChange={(e) => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="프리미엄 플랜 구독자"
                  />
                </div>
              </div>

              {/* 규칙 설정 섹션은 다음에 계속... */}
              <div className="border-t pt-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-800">타겟팅 규칙</h4>
                  <button
                    onClick={addRule}
                    className="text-sm bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    + 규칙 추가
                  </button>
                </div>

                {newSegment.rules.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700 flex items-center">
                      <span className="text-lg mr-2">💡</span>
                      규칙을 추가하여 타겟 사용자를 정의하세요.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newSegment.rules.map((rule, index) => (
                      <RuleEditor
                        key={index}
                        rule={rule}
                        onUpdate={(updates) => updateRule(index, updates)}
                        onRemove={() => removeRule(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 미리보기 */}
              {newSegment.rules.length > 0 && (
                <div className="border-t pt-5">
                  <div className="flex gap-3">
                    <button
                      onClick={previewSegment}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      🔍 미리보기
                    </button>
                    
                    <button
                      onClick={createSegment}
                      disabled={creating || !newSegment.name.trim()}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      {creating ? '생성 중...' : '🎯 세그먼트 생성'}
                    </button>
                  </div>

                  {preview && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        <strong>예상 타겟 사용자:</strong> {preview.userCount}명
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 기존 세그먼트 목록 */}
        {segments.length === 0 && !showCreateForm ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">세그먼트가 없습니다</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              첫 번째 사용자 세그먼트를 생성하여 타겟 마케팅을 시작해보세요.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🎯 첫 번째 세그먼트 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {segments.map((segment) => (
              <SegmentCard key={segment._id} segment={segment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 규칙 에디터 컴포넌트
function RuleEditor({ 
  rule, 
  onUpdate, 
  onRemove 
}: { 
  rule: SegmentRule; 
  onUpdate: (updates: Partial<SegmentRule>) => void; 
  onRemove: () => void; 
}) {
  const fieldOptions = [
    // 기존 필드들
    { value: 'platform', label: '플랫폼' },
    { value: 'tags', label: '사용자 태그' },
    { value: 'lastActiveAt', label: '최근 활동' },
    { value: 'appId', label: '앱' },
    
    // Phase 1: 새로운 핵심 필드들
    { value: 'attributes.age', label: '나이' },
    { value: 'attributes.gender', label: '성별' },
    { value: 'attributes.region', label: '지역' },
    { value: 'attributes.purchaseAmount', label: '총 구매금액' },
    { value: 'attributes.membershipTier', label: '멤버십 등급' }
  ];

  const operatorOptions: { value: SegmentOperator; label: string }[] = [
    { value: 'equals', label: '같음' },
    { value: 'not_equals', label: '같지 않음' },
    { value: 'contains', label: '포함' },
    { value: 'within_days', label: 'N일 이내' },
    { value: 'older_than_days', label: 'N일 이전' },
    
    // Phase 1: 수치형 데이터 처리 연산자
    { value: 'greater_than', label: '보다 큼' },
    { value: 'less_than', label: '보다 작음' },
    { value: 'greater_than_or_equal', label: '이상' },
    { value: 'less_than_or_equal', label: '이하' },
    { value: 'between', label: '범위 내' },
    { value: 'starts_with', label: '시작함' },
    { value: 'ends_with', label: '끝남' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
      <select
        value={rule.field}
        onChange={(e) => onUpdate({ field: e.target.value })}
        className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
      >
        {fieldOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={rule.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as SegmentOperator })}
        className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
      >
        {operatorOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={rule.value}
        onChange={(e) => onUpdate({ value: e.target.value })}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500"
        placeholder="값 입력"
      />

      <button
        onClick={onRemove}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        ✕
      </button>
    </div>
  );
}

// 세그먼트 카드 컴포넌트
function SegmentCard({ segment }: { segment: ISegment }) {
  return (
    <div className="bg-gradient-to-r from-white to-orange-50/50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{segment.name}</h3>
          {segment.description && (
            <p className="text-gray-600 text-sm mb-3">{segment.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📊 {segment.userCount || 0}명</span>
            <span>📅 생성일: {new Date(segment.createdAt!).toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              segment.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {segment.isActive ? '🟢 활성' : '🔴 비활성'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}