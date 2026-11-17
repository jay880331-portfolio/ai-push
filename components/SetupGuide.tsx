'use client';

import { useState } from 'react';
import { ICustomerApp } from '@/types';
import TestTokenManager from './TestTokenManager';
import TestPushSender from './TestPushSender';

interface SetupGuideProps {
  app: ICustomerApp;
}

export default function SetupGuide({ app }: SetupGuideProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  const androidSetupSteps = [
    {
      title: "1. AI Push SDK 설치",
      content: `AI Push React Native SDK를 설치하세요:

npm install @aipush/react-native
# 또는
yarn add @aipush/react-native

Expo 프로젝트의 경우:
npx expo install @aipush/react-native`
    },
    {
      title: "2. SDK 초기화",
      content: `App.js 또는 App.tsx에서 SDK를 초기화하세요:

import AIPush from '@aipush/react-native';

export default function App() {
  useEffect(() => {
    const initializeAIPush = async () => {
      try {
        await AIPush.initialize({
          apiKey: 'YOUR_API_KEY',
          baseUrl: 'YOUR_API_ENDPOINT',
          userId: 'unique_user_id',
          debug: true, // 개발 모드에서 활성화
        });
        
        console.log('AI Push SDK 초기화 성공');
      } catch (error) {
        console.error('SDK 초기화 실패:', error);
      }
    };

    initializeAIPush();
  }, []);

  // 앱 컨텐츠
  return (
    // 앱 JSX
  );
}`
    },
    {
      title: "3. 🤖 이벤트 추적으로 AI 타겟팅 활성화",
      content: `사용자 행동을 추적하면 AI가 자동으로 패턴을 분석하여 캠페인을 추천합니다:

// 🛒 구매 완료 이벤트
await AIPush.trackEvent('purchase_completed', {
  productId: 'SKU_001',
  amount: 99.99,
  category: 'electronics'
});

// 🛍️ 장바구니 추가 이벤트  
await AIPush.trackEvent('add_to_cart', {
  productId: 'SKU_002',
  price: 29.99
});

// 📱 앱 오픈 이벤트
await AIPush.trackEvent('app_opened');

// ⭐ 리뷰 작성 이벤트
await AIPush.trackEvent('review_submitted', {
  productId: 'SKU_001',
  rating: 5
});

// 👀 상품 조회 이벤트
await AIPush.trackEvent('product_viewed', {
  productId: 'SKU_003',
  category: 'fashion'
});`
    },
    {
      title: "4. 사용자 속성 설정 (선택사항)",
      content: `추가적인 타겟팅을 위해 사용자 속성을 설정할 수 있습니다:

// 사용자 속성 업데이트
await AIPush.updateUserAttributes({
  age: 25,
  gender: 'male',
  region: 'Seoul',
  membershipTier: 'gold'
});

// 태그 추가
await AIPush.addTags(['premium_user', 'mobile_app']);`
    },
    {
      title: "5. 푸시 알림 처리",
      content: `SDK가 자동으로 처리하는 기능들:
• 푸시 토큰 등록 (Expo/FCM 자동 감지)
• 권한 요청
• 알림 클릭 추적
• 딥링크 처리 (landingUrl 제공 시)

추가 코드가 필요하지 않습니다! 🎉

커스텀 알림 처리:
// SDK가 자동으로 딥링크 핸들러를 호출합니다
// 사용자가 landingUrl이 있는 알림을 탭할 때`
    }
  ];

  const iosSetupSteps = [
    {
      title: "1. AI Push SDK 설치",
      content: `AI Push React Native SDK를 설치하세요:

npm install @aipush/react-native
# 또는
yarn add @aipush/react-native

Expo 프로젝트의 경우:
npx expo install @aipush/react-native`
    },
    {
      title: "2. SDK 초기화",
      content: `App.js 또는 App.tsx에서 SDK를 초기화하세요:

import AIPush from '@aipush/react-native';

export default function App() {
  useEffect(() => {
    const initializeAIPush = async () => {
      try {
        await AIPush.initialize({
          apiKey: 'YOUR_API_KEY',
          baseUrl: 'YOUR_API_ENDPOINT',
          userId: 'unique_user_id',
          debug: true, // 개발 모드에서 활성화
        });
        
        console.log('AI Push SDK 초기화 성공');
      } catch (error) {
        console.error('SDK 초기화 실패:', error);
      }
    };

    initializeAIPush();
  }, []);

  // 앱 컨텐츠
  return (
    // 앱 JSX
  );
}`
    },
    {
      title: "3. 🤖 이벤트 추적으로 AI 타겟팅 활성화",
      content: `사용자 행동을 추적하면 AI가 자동으로 패턴을 분석하여 캠페인을 추천합니다:

// 🛒 구매 완료 이벤트
await AIPush.trackEvent('purchase_completed', {
  productId: 'SKU_001',
  amount: 99.99,
  category: 'electronics'
});

// 🛍️ 장바구니 추가 이벤트  
await AIPush.trackEvent('add_to_cart', {
  productId: 'SKU_002',
  price: 29.99
});

// 📱 앱 오픈 이벤트
await AIPush.trackEvent('app_opened');

// ⭐ 리뷰 작성 이벤트
await AIPush.trackEvent('review_submitted', {
  productId: 'SKU_001',
  rating: 5
});

// 👀 상품 조회 이벤트
await AIPush.trackEvent('product_viewed', {
  productId: 'SKU_003',
  category: 'fashion'
});`
    },
    {
      title: "4. 사용자 속성 설정 (선택사항)",
      content: `추가적인 타겟팅을 위해 사용자 속성을 설정할 수 있습니다:

// 사용자 속성 업데이트
await AIPush.updateUserAttributes({
  age: 25,
  gender: 'male',
  region: 'Seoul',
  membershipTier: 'gold'
});

// 태그 추가
await AIPush.addTags(['premium_user', 'mobile_app']);`
    },
    {
      title: "5. 푸시 알림 처리",
      content: `SDK가 자동으로 처리하는 기능들:
• 푸시 토큰 등록 (Expo/FCM 자동 감지)
• 권한 요청
• 알림 클릭 추적
• 딥링크 처리 (landingUrl 제공 시)

추가 코드가 필요하지 않습니다! 🎉

iOS 전용 기능:
• APNs 토큰 등록 (자동)
• 백그라운드 알림 처리
• 리치 알림 지원`
    }
  ];

  const currentSteps = activeTab === 'android' ? androidSetupSteps : iosSetupSteps;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">{app.appName} 설정 가이드</h3>
      
      {/* 테스트 토큰 매니저 먼저 표시 */}
      <TestTokenManager appId={app._id!} />
      
      {/* 테스트 푸시 발송 */}
      <TestPushSender appId={app._id!} appName={app.appName} />
      
      {(app.platform === 'both') && (
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'android'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            안드로이드 설정
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'ios'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            iOS 설정
          </button>
        </div>
      )}

      <div className="space-y-6">
        {currentSteps.map((step, index) => (
          <div key={index} className="border-l-4 border-primary-500 pl-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              {step.title}
            </h4>
            <div className="text-gray-600 whitespace-pre-line">
              {step.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">🚀 SDK 설정 정보:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>API Key:</strong> 이 대시보드에서 발급받은 실제 API 키를 사용하세요</li>
          <li>• <strong>Base URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'YOUR_API_ENDPOINT'}</li>
          <li>• <strong>App ID:</strong> {app._id} (자동으로 감지됨)</li>
          <li>• <strong>자동 감지:</strong> SDK가 자동으로 Expo/FCM 환경을 감지합니다</li>
          <li>• <strong>테스트:</strong> 푸시 알림 테스트는 실제 기기에서 진행하세요</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="text-sm font-semibold text-green-800 mb-2">✨ SDK 장점:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>설정 불필요:</strong> Firebase 설정이 필요하지 않습니다</li>
          <li>• <strong>범용 지원:</strong> Expo, React Native, FCM 모두 지원</li>
          <li>• <strong>자동 감지:</strong> 최적의 푸시 서비스를 자동으로 선택</li>
          <li>• <strong>🤖 AI 기반:</strong> 이벤트 추적으로 자동 캠페인 추천</li>
          <li>• <strong>쉬운 통합:</strong> 3줄의 코드로 시작 가능</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">🎯 AI 추천 시스템:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>구매 후 리뷰 미작성:</strong> 구매한 사용자에게 리뷰 요청</li>
          <li>• <strong>장바구니 이탈:</strong> 담고 구매 안 한 사용자에게 할인 제공</li>
          <li>• <strong>장기 미접속자:</strong> 비활성 사용자 재활성화</li>
          <li>• <strong>첫 구매 유도:</strong> 신규 사용자 전환 캠페인</li>
          <li>• <strong>상품 조회 후 무반응:</strong> 관심 상품 할인 알림</li>
        </ul>
        <div className="mt-2 text-xs text-blue-600">
          💡 이벤트가 쌓일수록 AI 추천의 정확도가 높아집니다!
        </div>
      </div>
    </div>
  );
}