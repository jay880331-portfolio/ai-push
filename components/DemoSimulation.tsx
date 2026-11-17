'use client';

import { useState } from 'react';

interface SimulatedUser {
  id: string;
  name: string;
  device: string;
  location: string;
}

interface SimulatedEvent {
  id: string;
  userId: string;
  userName: string;
  eventName: string;
  timestamp: string;
  properties: Record<string, any>;
}

const SAMPLE_USERS: SimulatedUser[] = [
  { id: 'user_001', name: '김지민', device: 'iPhone 15', location: '서울' },
  { id: 'user_002', name: '박현수', device: 'Galaxy S24', location: '부산' },
  { id: 'user_003', name: '이서연', device: 'iPhone 14', location: '대구' },
  { id: 'user_004', name: '최민호', device: 'Galaxy Note', location: '인천' },
  { id: 'user_005', name: '정수빈', device: 'iPhone 13', location: '광주' }
];

const EVENT_TEMPLATES = [
  {
    name: 'app_opened',
    label: '📱 앱 오픈',
    description: '사용자가 앱을 실행함',
    color: 'bg-blue-500',
    properties: {}
  },
  {
    name: 'product_viewed',
    label: '👀 상품 조회',
    description: '특정 상품 페이지를 조회함',
    color: 'bg-purple-500',
    properties: { productId: 'wireless_earbuds_pro', product_name: '무선 이어버드 프로', category: 'electronics', price: 299000 }
  },
  {
    name: 'add_to_cart',
    label: '🛍️ 장바구니 추가',
    description: '상품을 장바구니에 추가함',
    color: 'bg-orange-500',
    properties: { productId: 'wireless_earbuds_pro', product_name: '무선 이어버드 프로', price: 299000, quantity: 1 }
  },
  {
    name: 'purchase_completed',
    label: '🛒 구매 완료',
    description: '결제를 완료하고 구매함',
    color: 'bg-green-500',
    properties: { orderId: 'ORDER_001', productId: 'wireless_earbuds_pro', product_name: '무선 이어버드 프로', amount: 299000, paymentMethod: 'card' }
  },
  {
    name: 'review_submitted',
    label: '⭐ 리뷰 작성',
    description: '구매한 상품에 리뷰를 작성함',
    color: 'bg-yellow-500',
    properties: { productId: 'wireless_earbuds_pro', product_name: '무선 이어버드 프로', rating: 5, comment: '정말 좋은 상품이에요!' }
  }
];

interface DemoSimulationProps {
  onEventSent?: () => void;
}

export default function DemoSimulation({ onEventSent }: DemoSimulationProps) {
  const [events, setEvents] = useState<SimulatedEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SimulatedUser>(SAMPLE_USERS[0]);
  const [isAutoMode, setIsAutoMode] = useState(false);

  // 개별 이벤트 전송 (선택된 사용자용)
  const sendEvent = async (eventTemplate: typeof EVENT_TEMPLATES[0]) => {
    return await sendEventForUser(eventTemplate, selectedUser);
  };

  // 특정 사용자용 이벤트 전송
  const sendEventForUser = async (eventTemplate: typeof EVENT_TEMPLATES[0], user: SimulatedUser) => {
    setIsSimulating(true);

    try {
      const eventData = {
        appId: 'demo_app_' + Date.now(),
        userIdInClientApp: user.id,
        eventName: eventTemplate.name,
        properties: {
          ...eventTemplate.properties,
          simulatedAt: new Date().toISOString(),
          demoUser: user.name,
          demoDevice: user.device,
          demoLocation: user.location
        },
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/events/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key-1',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const newEvent: SimulatedEvent = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          eventName: eventTemplate.name,
          timestamp: new Date().toLocaleTimeString(),
          properties: eventData.properties
        };

        setEvents(prev => [newEvent, ...prev.slice(0, 9)]); // 최근 10개만 유지
        if (!isAutoMode) {
          onEventSent?.(); // 수동 모드에서만 즉시 새로고침
        }
      } else {
        throw new Error('이벤트 전송 실패');
      }
    } catch (error) {
      console.error('시뮬레이션 이벤트 전송 오류:', error);
      if (!isAutoMode) {
        alert('❌ 이벤트 전송에 실패했습니다');
      }
    } finally {
      if (!isAutoMode) {
        setIsSimulating(false);
      }
    }
  };

  // 자동 시뮬레이션 (사용자 여정) - 5명 자동 실행
  const runAutoSimulation = async () => {
    setIsAutoMode(true);
    setEvents([]);

    const scenarios = [
      // 장바구니 이탈 패턴 (2명)
      { user: SAMPLE_USERS[0], events: ['app_opened', 'product_viewed', 'add_to_cart'] },
      { user: SAMPLE_USERS[4], events: ['app_opened', 'product_viewed', 'add_to_cart'] },
      
      // 구매 후 리뷰 미작성 패턴 (1명)
      { user: SAMPLE_USERS[1], events: ['app_opened', 'product_viewed', 'add_to_cart', 'purchase_completed'] },
      
      // 상품 조회 후 무반응 패턴 (1명)
      { user: SAMPLE_USERS[2], events: ['app_opened', 'product_viewed'] },
      
      // 완전한 여정 (비교 대조용, 1명)
      { user: SAMPLE_USERS[3], events: ['app_opened', 'product_viewed', 'add_to_cart', 'purchase_completed', 'review_submitted'] }
    ];

    for (const scenario of scenarios) {
      for (const eventName of scenario.events) {
        const eventTemplate = EVENT_TEMPLATES.find(t => t.name === eventName);
        if (eventTemplate) {
          // 각 시나리오별로 사용자 자동 설정
          await sendEventForUser(eventTemplate, scenario.user);
          await new Promise(resolve => setTimeout(resolve, 800)); // 0.8초 대기
        }
      }
      await new Promise(resolve => setTimeout(resolve, 300)); // 사용자 간 0.3초 대기
    }

    setIsAutoMode(false);
    
    // 짧은 딜레이 후 AI 추천 새로고침
    setTimeout(() => {
      onEventSent?.();
    }, 1000);
    
    alert('🎬 자동 시뮬레이션이 완료되었습니다!\n\n📊 5명의 사용자가 다양한 여정을 완료했습니다:\n• 장바구니 이탈: 2명\n• 구매 후 리뷰 미작성: 1명\n• 상품 조회 후 무반응: 1명\n• 완전한 여정: 1명\n\n📍 아래 "🤖 AI 추천 캠페인" 섹션에서 "🔄 새로고침"을 눌러 AI 분석 결과를 확인해보세요!');
  };

  // 데이터 초기화 (실제 DB에서 삭제)
  const clearData = async () => {
    if (!confirm('모든 시뮬레이션 데이터를 초기화하시겠습니까?\n\n⚠️ 이 작업은 다음을 삭제합니다:\n• 시뮬레이션으로 생성된 모든 이벤트\n• AI가 생성한 모든 캠페인')) {
      return;
    }

    try {
      const response = await fetch('/api/demo/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key-1',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setEvents([]);
        onEventSent?.(); // AI 추천 새로고침
        alert(`✅ 데모 데이터가 초기화되었습니다!\n\n📊 삭제된 데이터:\n• 이벤트: ${data.deleted.events}개\n• 캠페인: ${data.deleted.campaigns}개`);
      } else {
        alert(`❌ 초기화 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('데이터 초기화 오류:', error);
      alert('❌ 네트워크 오류가 발생했습니다');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🎬 데모 시뮬레이션</h3>
            <p className="text-indigo-100 text-sm">
              실제 SDK 없이 사용자 이벤트를 시뮬레이션하여 AI 추천 시스템을 체험해보세요
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-sm opacity-75">이벤트: {events.length}</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 컨트롤 패널 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-6 items-center">
              <button
                onClick={runAutoSimulation}
                disabled={isAutoMode || isSimulating}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 shadow-md"
              >
                {isAutoMode ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    시뮬레이션 중...
                  </>
                ) : (
                  <>🚀 5명 자동 시뮬레이션</>
                )}
              </button>

              <div className="text-sm text-gray-600">
                <strong>자동 시나리오:</strong> 5명의 사용자가 각각 다른 여정을 거쳐 다양한 AI 추천 패턴을 생성합니다
              </div>
            </div>

            <button
              onClick={clearData}
              disabled={isAutoMode || isSimulating}
              className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg border border-gray-300 hover:border-red-300 text-sm font-medium"
            >
              🗑️ 전체 초기화
            </button>
          </div>

          {/* 개별 이벤트 테스트용 사용자 선택 */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-3">개별 이벤트 테스트</h5>
            <div className="flex items-center gap-4 mb-3">
              <label className="text-sm text-gray-600">사용자 선택:</label>
              <select
                value={selectedUser.id}
                onChange={(e) => setSelectedUser(SAMPLE_USERS.find(u => u.id === e.target.value) || SAMPLE_USERS[0])}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isAutoMode}
              >
                {SAMPLE_USERS.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.device}, {user.location})
                  </option>
                ))}
              </select>
            </div>

            {/* 개별 이벤트 버튼들 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {EVENT_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => sendEvent(template)}
                  disabled={isSimulating || isAutoMode}
                  className={`${template.color} text-white p-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-center`}
                >
                  <div className="text-lg mb-1">{template.label.split(' ')[0]}</div>
                  <div className="text-xs">{template.label.split(' ').slice(1).join(' ')}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 이벤트 히스토리 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📋 실시간 이벤트 로그
            {events.length > 0 && (
              <span className="text-sm text-gray-500">
                (최근 {events.length}개)
              </span>
            )}
          </h4>

          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-lg font-medium mb-2">이벤트를 전송해보세요</p>
              <p className="text-sm">
                위의 버튼들을 클릭하거나 "자동 시뮬레이션"을 실행하여 사용자 이벤트를 시뮬레이션하세요
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      EVENT_TEMPLATES.find(t => t.name === event.eventName)?.color || 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {EVENT_TEMPLATES.find(t => t.name === event.eventName)?.label || event.eventName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.userName} • {event.timestamp}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">
                    {Object.keys(event.properties).length > 0 && 
                      `속성: ${Object.keys(event.properties).slice(0, 2).join(', ')}${Object.keys(event.properties).length > 2 ? '...' : ''}`
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 시뮬레이션 가이드</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>개별 이벤트:</strong> 특정 사용자의 개별 행동을 시뮬레이션</li>
            <li>• <strong>자동 시뮬레이션:</strong> 5명의 사용자가 다양한 여정을 거치는 시나리오</li>
            <li>• <strong>AI 추천:</strong> 이벤트 전송 후 아래 AI 추천 섹션에서 패턴 분석 결과 확인</li>
            <li>• <strong>즉시발송:</strong> AI 추천에서 생성된 캠페인을 바로 테스트 가능</li>
          </ul>
        </div>
      </div>
    </div>
  );
}