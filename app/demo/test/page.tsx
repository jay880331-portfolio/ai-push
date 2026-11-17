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

export default function TestDemo() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ridgeAIPushReady, setRidgeAIPushReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Ridge AI Push 초기화
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

  const testSubscription = async () => {
    if (!ridgeAIPushReady) {
      addLog('❌ Ridge AI Push SDK가 아직 준비되지 않았습니다');
      return;
    }

    try {
      addLog('🔔 푸시 알림 권한 요청 중...');
      await window.RidgeAIPush.requestPermission();
      setIsSubscribed(true);
      addLog('✅ 푸시 알림 구독 완료!');
    } catch (error: any) {
      addLog(`❌ 구독 실패: ${error.message}`);
    }
  };

  const testEvent = () => {
    if (!ridgeAIPushReady) {
      addLog('❌ Ridge AI Push SDK가 아직 준비되지 않았습니다');
      return;
    }

    window.RidgeAIPush.trackEvent('test_button_click', {
      buttonName: 'test-event',
      timestamp: new Date().toISOString()
    });
    addLog('📊 테스트 이벤트 전송됨');
  };

  const testPushFromDashboard = async () => {
    addLog('🧪 대시보드에서 테스트 푸시 전송 시도...');
    
    try {
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key-1'
        },
        body: JSON.stringify({
          title: '🧪 Ridge AI Push 테스트',
          message: 'SDK 통합이 정상적으로 작동하고 있습니다!',
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: {} // 모든 구독자에게
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ 테스트 푸시 전송 완료! 성공: ${data.successCount}명, 실패: ${data.failureCount}명`);
      } else {
        addLog(`❌ 테스트 푸시 전송 실패: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`❌ 테스트 푸시 전송 중 오류: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🧪 Ridge AI Push SDK 테스트</h1>
          <p className="text-gray-700">Ridge AI Push SDK의 실제 동작을 테스트하는 페이지입니다</p>
        </div>

        {/* SDK 상태 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-800">🚀 SDK 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <div className="text-center">
                <div className="text-2xl mb-2 text-blue-600">🧪</div>
                <div className="text-sm text-gray-800">테스트 모드</div>
              </div>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
              <pre>{`// 실제 사용법
RidgeAIPush.init({
  apiKey: 'api-key-1',
  debug: true
}).then(() => {
  console.log('초기화 완료');
  
  // 권한 요청
  return RidgeAIPush.requestPermission();
}).then(() => {
  console.log('구독 완료');
  
  // 이벤트 추적
  RidgeAIPush.trackEvent('user_action', {
    action: 'button_click'
  });
});`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* 테스트 액션 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-800">🧪 테스트 액션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={testSubscription}
                disabled={!ridgeAIPushReady || isSubscribed}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                🔔 구독 테스트
              </button>
              <button
                onClick={testEvent}
                disabled={!ridgeAIPushReady}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                📊 이벤트 테스트
              </button>
              <button
                onClick={testPushFromDashboard}
                disabled={!isSubscribed}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                📱 푸시 테스트
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 로그 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-800">📋 실시간 로그</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
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

        {/* 시나리오 설명 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-800">📖 테스트 시나리오</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-800">
              <div>
                <h3 className="font-semibold mb-2">1. SDK 로드 및 초기화</h3>
                <p className="text-sm">페이지 로드 시 Ridge AI Push SDK가 자동으로 로드되고 초기화됩니다.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. 푸시 알림 구독</h3>
                <p className="text-sm">"구독 테스트" 버튼을 클릭하여 브라우저 푸시 알림 권한을 요청하고 구독을 생성합니다.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. 이벤트 추적</h3>
                <p className="text-sm">"이벤트 테스트" 버튼을 클릭하여 사용자 행동을 추적하는 이벤트를 전송합니다.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. 푸시 알림 수신</h3>
                <p className="text-sm">"푸시 테스트" 버튼을 클릭하여 실제 푸시 알림을 받아볼 수 있습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 뒤로가기 */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Ridge AI Push 메인으로 뎼아가기
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