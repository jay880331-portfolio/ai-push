'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import VapidKeyManager from '@/components/VapidKeyManager';

interface WebPushManagerProps {
  companyId?: string;
}

export default function WebPushManager({ companyId }: WebPushManagerProps) {
  const { apiKey } = useAuthStore();
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    sentToday: 0,
    clickRate: 0
  });
  
  const [integrationCode, setIntegrationCode] = useState('');
  const [selectedDemo, setSelectedDemo] = useState('basic');

  useEffect(() => {
    generateIntegrationCode();
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateIntegrationCode = useCallback(() => {
    const currentApiKey = apiKey || 'YOUR_API_KEY'; // Use actual API key
    
    const codes = {
      basic: `<!-- 기본 설치 (가장 간단) -->
<script src="${window.location.origin}/js/ridge-ai-push.js" 
        data-api-key="${currentApiKey}"
        data-debug="true"></script>

<script>
  // 사용자가 페이지 방문 시 자동으로 권한 요청
  setTimeout(() => {
    RidgeAIPush.requestPermission()
      .then(() => console.log('✅ 웹 푸시 구독 완료!'))
      .catch(err => console.log('❌ 구독 실패:', err));
  }, 3000); // 3초 후 권한 요청
</script>`,

      ecommerce: `<!-- 이커머스 사이트용 고급 설정 -->
<script src="https://ai-push.ridge-it.site/js/ridge-ai-push-production.js"></script>

<script>
  // 초기화 (실제 고객은 자신의 API 키 사용)
  RidgeAIPush.init({
    apiKey: 'YOUR_REAL_API_KEY', // 실제 고객이 발급받은 API 키
    debug: false // 프로덕션에서는 false
  }).then(() => {
    console.log('Ridge AI Push 초기화 완료');
    
    // 장바구니에 상품 추가 시 이벤트 추적
    function trackAddToCart(productId, price) {
      RidgeAIPush.trackEvent('add_to_cart', {
        productId: productId,
        price: price,
        category: 'electronics'
      });
    }
    
    // 구매 완료 시 이벤트 추적
    function trackPurchase(orderId, amount) {
      RidgeAIPush.trackEvent('purchase_completed', {
        orderId: orderId,
        amount: amount
      });
      
      // 구매 고객에게 VIP 태그 추가
      RidgeAIPush.addTags(['vip_customer', 'purchased']);
    }
    
    // 사용자 정보 설정
    function setCustomerInfo(email, age, region) {
      RidgeAIPush.updateUserAttributes({
        email: email,
        age: age,
        region: region,
        membershipTier: 'gold'
      });
    }
    
    // 전역으로 함수 노출
    window.trackAddToCart = trackAddToCart;
    window.trackPurchase = trackPurchase;
    window.setCustomerInfo = setCustomerInfo;
  });
</script>`,

      blog: `<!-- 블로그/뉴스 사이트용 -->
<script src="https://ai-push.ridge-it.site/js/ridge-ai-push-production.js"></script>

<script>
  RidgeAIPush.init({
    apiKey: 'YOUR_REAL_API_KEY', // 실제 고객이 발급받은 API 키
    debug: false // 프로덕션에서는 false
  }).then(() => {
    // 글 읽기 완료 추적 (스크롤 80% 이상)
    let readingCompleted = false;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      if (!readingCompleted && scrollPercent > 80) {
        readingCompleted = true;
        RidgeAIPush.trackEvent('article_read_completed', {
          articleTitle: document.title,
          articleUrl: window.location.href,
          readingTime: Date.now() - pageStartTime
        });
        
        // 열심히 읽는 독자에게 태그 추가
        RidgeAIPush.addTags(['engaged_reader']);
      }
    });
    
    const pageStartTime = Date.now();
    
    // 댓글 작성 시 추적
    function trackComment() {
      RidgeAIPush.trackEvent('comment_posted');
      RidgeAIPush.addTags(['active_commenter']);
    }
    
    // 글 공유 시 추적
    function trackShare(platform) {
      RidgeAIPush.trackEvent('article_shared', {
        platform: platform,
        articleTitle: document.title
      });
      RidgeAIPush.addTags(['social_sharer']);
    }
    
    window.trackComment = trackComment;
    window.trackShare = trackShare;
  });
</script>`
    };

    setIntegrationCode(codes[selectedDemo as keyof typeof codes]);
  }, [apiKey, selectedDemo]);

  const loadStats = async () => {
    // 실제로는 API에서 통계 데이터를 가져와야 함
    setStats({
      totalSubscribers: 1247,
      activeSubscribers: 1156,
      sentToday: 342,
      clickRate: 12.5
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(integrationCode);
      alert('📋 코드가 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다. 코드를 수동으로 선택해서 복사해주세요.');
    }
  };

  const sendTestPush = async () => {
    try {
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || ''
        },
        body: JSON.stringify({
          title: '🧪 테스트 알림',
          message: 'Ridge AI Push 웹 푸시 테스트입니다!',
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: {} // 모든 구독자에게
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ 테스트 푸시 전송 완료!\n성공: ${data.successCount}명, 실패: ${data.failureCount}명`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert(`❌ 테스트 푸시 전송 실패: ${(error as any).message || String(error)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* VAPID 키 관리 */}
      <VapidKeyManager companyId={companyId} />
      
      {/* 통계 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSubscribers.toLocaleString()}</div>
            <div className="text-sm text-gray-800">총 구독자</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activeSubscribers.toLocaleString()}</div>
            <div className="text-sm text-gray-800">활성 구독자</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.sentToday.toLocaleString()}</div>
            <div className="text-sm text-gray-800">오늘 발송</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.clickRate}%</div>
            <div className="text-sm text-gray-800">클릭률</div>
          </CardContent>
        </Card>
      </div>

      {/* 통합 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-800">
            🌐 웹 푸시 통합 가이드
            <button
              onClick={sendTestPush}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              🧪 테스트 푸시 전송
            </button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 데모 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">사이트 유형 선택</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'basic', label: '🚀 기본', desc: '모든 웹사이트' },
                { value: 'ecommerce', label: '🛒 이커머스', desc: '쇼핑몰' },
                { value: 'blog', label: '📝 블로그', desc: '뉴스/블로그' }
              ].map(demo => (
                <button
                  key={demo.value}
                  onClick={() => {
                    setSelectedDemo(demo.value);
                    setTimeout(generateIntegrationCode, 100);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedDemo === demo.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {demo.label}
                  <div className="text-xs opacity-75">{demo.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 코드 표시 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-800">통합 코드</label>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                📋 복사
              </button>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{integrationCode}</code>
              </pre>
            </div>
          </div>

          {/* 설치 가이드 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">📋 설치 방법</h3>
            <ol className="text-sm text-gray-800 space-y-1 list-decimal list-inside">
              <li>위 코드를 복사합니다</li>
              <li>웹사이트의 <code>&lt;/body&gt;</code> 태그 직전에 붙여넣습니다</li>
              <li>웹사이트를 새로고침합니다</li>
              <li>브라우저에서 알림 권한을 허용합니다</li>
              <li>완료! 🎉</li>
            </ol>
          </div>

          {/* 고급 기능 안내 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">🚀 고급 기능</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-800">🎯 자동 세그멘테이션</div>
                <div className="text-gray-800">사용자 행동 기반 자동 태그 생성</div>
              </div>
              <div>
                <div className="font-medium text-gray-800">🤖 AI 타이밍 최적화</div>
                <div className="text-gray-800">사용자별 최적 발송 시간 학습</div>
              </div>
              <div>
                <div className="font-medium text-gray-800">📊 실시간 분석</div>
                <div className="text-gray-800">클릭률, 전환율 실시간 추적</div>
              </div>
              <div>
                <div className="font-medium text-gray-800">🔄 자동 재타겟팅</div>
                <div className="text-gray-800">이탈 사용자 자동 재방문 유도</div>
              </div>
            </div>
          </div>

          {/* 데모 사이트 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">🧪 라이브 데모</h3>
            <p className="text-sm text-gray-800 mb-3">
              실제 작동하는 웹 푸시를 체험해보세요:
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="/demo/test"
                target="_blank"
                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                🧪 SDK 테스트
              </a>
              <a
                href="/demo/ecommerce"
                target="_blank"
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                🛒 이커머스 데모
              </a>
              <a
                href="/demo/blog"
                target="_blank"
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                📝 블로그 데모
              </a>
              <a
                href="/demo/news"
                target="_blank"
                className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                📰 뉴스 데모
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}