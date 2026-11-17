'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

export default function WebPushDemo() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionState, setPermissionState] = useState('default');

  useEffect(() => {
    // Permission state 체크
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const handleSDKLoad = () => {
    setIsSDKLoaded(true);
    console.log('Ridge AI Push SDK 로드 완료');
  };

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && window.RidgeAIPush) {
      try {
        await window.RidgeAIPush.requestPermission();
        setIsSubscribed(true);
        setPermissionState('granted');
        alert('✅ 웹 푸시 구독이 완료되었습니다!');
      } catch (error) {
        console.error('권한 요청 실패:', error);
        alert('❌ 권한 요청이 실패했습니다.');
      }
    }
  };

  const sendTestPush = async () => {
    try {
      // For demo purposes, we'll call the API without authentication
      // In production, the frontend would authenticate via session/JWT
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '🎉 축하합니다!',
          message: 'Ridge AI Push 웹 알림이 성공적으로 작동하고 있습니다!',
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: {} // 모든 구독자에게
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ 테스트 푸시가 전송되었습니다!\n성공: ${data.successCount}명`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert(`❌ 푸시 전송 실패: ${(error as any).message || String(error)}`);
    }
  };

  const trackEvent = (eventName: string, properties = {}) => {
    if (typeof window !== 'undefined' && window.RidgeAIPush) {
      window.RidgeAIPush.trackEvent(eventName, properties);
      console.log(`이벤트 추적: ${eventName}`, properties);
    }
  };

  return (
    <>
      {/* Ridge AI Push SDK 로드 */}
      <Script 
        src="/js/ridge-ai-push.js"
        data-demo="true"
        data-debug="true"
        onLoad={handleSDKLoad}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🌐 웹 푸시 라이브 데모
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              실제 웹 푸시 알림을 체험해보세요. SDK 설치부터 알림 발송까지 전체 과정을 확인할 수 있습니다.
            </p>
          </div>

          {/* 상태 표시 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${isSDKLoaded ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div>
                  <div className="font-medium">SDK 상태</div>
                  <div className="text-sm text-gray-600">
                    {isSDKLoaded ? '✅ 로드됨' : '⏳ 로딩 중...'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  permissionState === 'granted' ? 'bg-green-500' : 
                  permissionState === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <div className="font-medium">권한 상태</div>
                  <div className="text-sm text-gray-600">
                    {permissionState === 'granted' ? '✅ 허용됨' : 
                     permissionState === 'denied' ? '❌ 거부됨' : '⏳ 대기 중'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${isSubscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div>
                  <div className="font-medium">구독 상태</div>
                  <div className="text-sm text-gray-600">
                    {isSubscribed ? '✅ 구독됨' : '⏳ 미구독'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 컨트롤 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">🚀 웹 푸시 체험하기</h2>
            
            <div className="space-y-6">
              {/* 1단계: 권한 요청 */}
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="font-semibold text-lg mb-2">1단계: 알림 권한 요청</h3>
                <p className="text-gray-600 mb-4">
                  웹 푸시 알림을 받기 위해 브라우저 권한을 허용해주세요.
                </p>
                <button
                  onClick={requestPermission}
                  disabled={!isSDKLoaded || permissionState === 'granted'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {permissionState === 'granted' ? '✅ 권한 허용됨' : '🔔 알림 권한 요청'}
                </button>
              </div>

              {/* 2단계: 테스트 푸시 */}
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="font-semibold text-lg mb-2">2단계: 테스트 푸시 발송</h3>
                <p className="text-gray-600 mb-4">
                  실제 푸시 알림을 발송해서 작동을 확인해보세요.
                </p>
                <button
                  onClick={sendTestPush}
                  disabled={!isSubscribed}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  📤 테스트 푸시 발송
                </button>
              </div>

              {/* 3단계: 이벤트 추적 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="font-semibold text-lg mb-2">3단계: 사용자 이벤트 추적</h3>
                <p className="text-gray-600 mb-4">
                  다양한 이벤트를 발생시켜서 AI 분석 데이터를 생성해보세요.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => trackEvent('product_view', { productId: 'demo_product_1', category: 'electronics' })}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                  >
                    👀 상품 조회
                  </button>
                  <button
                    onClick={() => trackEvent('add_to_cart', { productId: 'demo_product_1', price: 99.99 })}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm"
                  >
                    🛒 장바구니 추가
                  </button>
                  <button
                    onClick={() => trackEvent('checkout_start', { totalAmount: 199.98 })}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    💳 결제 시작
                  </button>
                  <button
                    onClick={() => trackEvent('purchase_completed', { orderId: 'ORDER_' + Date.now(), amount: 199.98 })}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    ✅ 구매 완료
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 통합 코드 예시 */}
          <div className="bg-gray-900 text-green-400 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-white">💻 통합 코드 예시</h3>
            <pre className="text-sm overflow-x-auto">
{`<!-- 웹사이트에 추가할 코드 -->
<script src="https://ai-push.ridge-it.site/js/ridge-ai-push.js" 
        data-api-key="your-api-key"
        data-debug="true"></script>

<script>
  // 페이지 로드 후 자동 초기화
  RidgeAIPush.requestPermission()
    .then(() => console.log('구독 성공!'))
    .catch(err => console.log('구독 실패:', err));
    
  // 사용자 이벤트 추적
  function trackPurchase(orderId, amount) {
    RidgeAIPush.trackEvent('purchase_completed', {
      orderId: orderId,
      amount: amount
    });
  }
</script>`}
            </pre>
          </div>

          {/* 실시간 로그 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📊 실시간 로그</h3>
            <div className="bg-gray-50 rounded-lg p-4 h-32 overflow-y-auto text-sm font-mono">
              <div className="text-green-600">✅ Ridge AI Push SDK 초기화 완료</div>
              <div className="text-blue-600">📊 페이지 방문 이벤트 추적됨</div>
              <div className="text-purple-600">🤖 AI 패턴 분석 시작</div>
              <div className="text-gray-600">💡 브라우저 콘솔을 열어서 더 자세한 로그를 확인하세요</div>
            </div>
          </div>

          {/* 뒤로 가기 */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← 메인 대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// TypeScript 타입 확장
declare global {
  interface Window {
    RidgeAIPush: any;
  }
}