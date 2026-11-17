'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Script from 'next/script';

declare global {
  interface Window {
    RidgeAIPush: any;
  }
}

export default function EcommerceDemo() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ridgeAIPushReady, setRidgeAIPushReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Ridge AI Push 초기화 확인
    const checkRidgeAIPush = () => {
      if (window.RidgeAIPush) {
        addLog('🚀 Ridge AI Push SDK 발견, 초기화 시작...');
        
        window.RidgeAIPush.init({
          apiKey: 'api-key-1',
          debug: true
        }).then(() => {
          addLog('✅ Ridge AI Push 초기화 완료');
          setRidgeAIPushReady(true);
          
          // 기존 구독 확인
          if (window.RidgeAIPush.isSubscribed()) {
            setIsSubscribed(true);
            addLog('✅ 기존 구독 발견');
          }
        }).catch((error: any) => {
          addLog(`❌ Ridge AI Push 초기화 실패: ${error.message}`);
        });
      } else {
        addLog('⏳ Ridge AI Push SDK 로딩 대기 중...');
      }
    };

    // SDK 로드 대기
    if (document.readyState === 'complete') {
      setTimeout(checkRidgeAIPush, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkRidgeAIPush, 100);
      });
    }
  }, []);

  const subscribeToPush = async () => {
    if (!ridgeAIPushReady) {
      addLog('❌ Ridge AI Push SDK가 아직 준비되지 않았습니다');
      return;
    }

    try {
      addLog('🔔 푸시 알림 권한 요청 중...');
      await window.RidgeAIPush.requestPermission();
      
      // 이커머스 특화 태그 및 속성 추가
      await window.RidgeAIPush.addTags(['ecommerce', 'demo', 'shopper']);
      await window.RidgeAIPush.updateUserAttributes({
        platform: 'web',
        demoType: 'ecommerce',
        membershipTier: 'Bronze'
      });
      
      setIsSubscribed(true);
      addLog('✅ 푸시 알림 구독 완료!');
      addLog('🏷️ 이커머스 태그 및 속성 설정 완료');
    } catch (error: any) {
      addLog(`❌ 구독 실패: ${error.message}`);
    }
  };

  const addToCart = (productName: string, price: number) => {
    if (!ridgeAIPushReady) {
      addLog('❌ Ridge AI Push SDK가 준비되지 않았습니다');
      return;
    }

    // Ridge AI Push SDK로 이벤트 추적
    window.RidgeAIPush.trackEvent('add_to_cart', {
      productName: productName,
      price: price,
      category: 'fashion',
      currency: 'KRW'
    });

    setCartItems(prev => prev + 1);
    addLog(`🛒 장바구니 추가: ${productName} (₩${price.toLocaleString()})`);
    addLog('📊 add_to_cart 이벤트 전송됨');
  };

  const viewProduct = (productName: string) => {
    if (!ridgeAIPushReady) return;

    window.RidgeAIPush.trackEvent('product_view', {
      productName: productName,
      category: 'fashion',
      viewTime: new Date().toISOString()
    });

    addLog(`👀 상품 조회: ${productName}`);
    addLog('📊 product_view 이벤트 전송됨');
  };

  const sendAbandonedCartPush = async () => {
    if (!isSubscribed) {
      addLog('❌ 먼저 푸시 알림을 구독해주세요');
      return;
    }

    try {
      addLog('🧪 장바구니 이탈 방지 푸시 전송 시도...');
      
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key-1'
        },
        body: JSON.stringify({
          title: '🛒 장바구니에 상품이 남아있어요!',
          message: `${cartItems}개 상품이 기다리고 있습니다. 지금 구매하면 10% 할인! 🎉`,
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: { tags: ['ecommerce'] }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ 장바구니 이탈 방지 푸시 전송 완료! 성공: ${data.successCount}명`);
      } else {
        addLog(`❌ 푸시 전송 실패: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`❌ 푸시 전송 중 오류: ${error.message}`);
    }
  };

  const sendSalePush = async () => {
    if (!isSubscribed) {
      addLog('❌ 먼저 푸시 알림을 구독해주세요');
      return;
    }

    try {
      addLog('🧪 특가 세일 푸시 전송 시도...');
      
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key-1'
        },
        body: JSON.stringify({
          title: '🎉 특가 세일 시작!',
          message: '지금 구매하면 50% 할인! 놓치지 마세요!',
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: { tags: ['ecommerce'] }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ 특가 세일 푸시 전송 완료! 성공: ${data.successCount}명`);
      } else {
        addLog(`❌ 푸시 전송 실패: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`❌ 푸시 전송 중 오류: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🛒 이커머스 웹 푸시 데모</h1>
          <p className="text-gray-700">실제 쇼핑몰에서 사용되는 Ridge AI Push SDK를 체험해보세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 쇼핑몰 UI */}
          <div className="space-y-6">
            {/* SDK 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">🚀 Ridge AI Push SDK 상태</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl mb-2 ${ridgeAIPushReady ? 'text-green-600' : 'text-yellow-600'}`}>
                      {ridgeAIPushReady ? '✅' : '⏳'}
                    </div>
                    <div className="text-sm text-gray-800">SDK 초기화</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl mb-2 ${isSubscribed ? 'text-green-600' : 'text-gray-400'}`}>
                      {isSubscribed ? '✅' : '❌'}
                    </div>
                    <div className="text-sm text-gray-800">푸시 구독</div>
                  </div>
                </div>
                
                {!isSubscribed && (
                  <button
                    onClick={subscribeToPush}
                    disabled={!ridgeAIPushReady}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    🔔 푸시 알림 구독하기
                  </button>
                )}
              </CardContent>
            </Card>

            {/* 장바구니 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">🛒 장바구니 ({cartItems}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🛍️</div>
                  <p className="text-gray-600">장바구니에 {cartItems}개 상품이 있습니다</p>
                </div>
              </CardContent>
            </Card>

            {/* 상품 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => viewProduct('프리미엄 티셔츠')}>
                <CardContent className="p-6">
                  <div className="text-6xl text-center mb-4">👕</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">프리미엄 티셔츠</h3>
                  <p className="text-gray-700 mb-4">편안하고 스타일리시한 고급 티셔츠</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">₩29,900</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart('프리미엄 티셔츠', 29900);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      장바구니 담기
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => viewProduct('러닝 스니커즈')}>
                <CardContent className="p-6">
                  <div className="text-6xl text-center mb-4">👟</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">러닝 스니커즈</h3>
                  <p className="text-gray-700 mb-4">경량화 소재의 프리미엄 운동화</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">₩89,900</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart('러닝 스니커즈', 89900);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      장바구니 담기
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 푸시 테스트 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">🧪 푸시 알림 테스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={sendAbandonedCartPush}
                    disabled={!isSubscribed}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    🛒 장바구니 이탈 방지 알림
                  </button>
                  <button
                    onClick={sendSalePush}
                    disabled={!isSubscribed}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    🎉 특가 세일 알림
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 실시간 로그 */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-gray-800">📋 실시간 로그</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">로그가 여기에 표시됩니다...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="mt-2 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  로그 지우기
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 뒤로가기 */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Ridge AI Push 메인으로 돌아가기
          </Link>
        </div>
      </div>

      {/* Ridge AI Push SDK 로드 */}
      <Script
        src="/js/ridge-ai-push.js"
        data-api-key="api-key-1"
        data-debug="true"
        strategy="afterInteractive"
        onLoad={() => addLog('🔄 Ridge AI Push SDK 스크립트 로드됨')}
      />
    </div>
  );
}