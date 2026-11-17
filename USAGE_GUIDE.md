# 🚀 Ridge AI Push 사용 가이드

AI 기반 멀티채널 푸시 알림 플랫폼 완전 사용법

## 📋 목차
1. [빠른 시작](#빠른-시작)
2. [웹 푸시 통합](#웹-푸시-통합)
3. [모바일 앱 통합](#모바일-앱-통합)
4. [대시보드 사용법](#대시보드-사용법)
5. [API 사용법](#api-사용법)
6. [고급 기능](#고급-기능)

---

## 🚀 빠른 시작

### 1. 데모 체험
```bash
# 라이브 데모 확인
https://ai-push.ridge-it.site/demo/web-push
```

### 2. 로컬 개발 환경 설정
```bash
# 프로젝트 클론
git clone <repository-url>
cd ai-push

# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에서 MongoDB, OpenAI API 키 등 설정

# 개발 서버 시작
pnpm dev
```

---

## 🌐 웹 푸시 통합

### 웹사이트에 5분만에 설치

#### 1단계: JavaScript SDK 추가
```html
<!-- HTML 파일의 </body> 태그 직전에 추가 -->
<script src="https://ai-push.ridge-it.site/js/ridge-ai-push.js" 
        data-api-key="YOUR_API_KEY"
        data-debug="true"></script>

<script>
  // 페이지 로드 후 자동으로 권한 요청
  setTimeout(() => {
    RidgeAIPush.requestPermission()
      .then(() => console.log('✅ 웹 푸시 구독 완료!'))
      .catch(err => console.log('❌ 구독 실패:', err));
  }, 3000); // 3초 후 권한 요청
</script>
```

#### 2단계: 사용자 이벤트 추적 (선택사항)
```javascript
// 상품 조회 추적
function trackProductView(productId) {
  RidgeAIPush.trackEvent('product_view', {
    productId: productId,
    category: 'electronics',
    price: 99.99
  });
}

// 구매 완료 추적
function trackPurchase(orderId, amount) {
  RidgeAIPush.trackEvent('purchase_completed', {
    orderId: orderId,
    amount: amount
  });
  
  // VIP 고객 태그 추가
  RidgeAIPush.addTags(['vip_customer', 'purchased']);
}

// 사용자 정보 설정
function setUserInfo(email, age) {
  RidgeAIPush.updateUserAttributes({
    email: email,
    age: age,
    membershipTier: 'gold'
  });
}
```

### 사이트 유형별 통합 코드

#### 🛒 이커머스 사이트
```html
<script src="https://ai-push.ridge-it.site/js/ridge-ai-push.js"></script>
<script>
  RidgeAIPush.init({
    apiKey: 'YOUR_API_KEY',
    debug: true
  }).then(() => {
    
    // 장바구니 추가 시
    window.trackAddToCart = function(productId, price) {
      RidgeAIPush.trackEvent('add_to_cart', {
        productId: productId,
        price: price
      });
    };
    
    // 구매 완료 시  
    window.trackPurchase = function(orderId, amount) {
      RidgeAIPush.trackEvent('purchase_completed', {
        orderId: orderId,
        amount: amount
      });
      RidgeAIPush.addTags(['purchaser']);
    };
  });
</script>
```

#### 📝 블로그/뉴스 사이트
```html
<script src="https://ai-push.ridge-it.site/js/ridge-ai-push.js"></script>
<script>
  RidgeAIPush.init({
    apiKey: 'YOUR_API_KEY'
  }).then(() => {
    
    // 글 읽기 완료 추적 (80% 스크롤 시)
    let readCompleted = false;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      if (!readCompleted && scrollPercent > 80) {
        readCompleted = true;
        RidgeAIPush.trackEvent('article_read_completed', {
          articleTitle: document.title,
          readingTime: Date.now() - pageStartTime
        });
        RidgeAIPush.addTags(['engaged_reader']);
      }
    });
    
    const pageStartTime = Date.now();
  });
</script>
```

---

## 📱 모바일 앱 통합

### React Native 통합

#### 1단계: SDK 설치
```bash
npm install @ridge-ai/push-react-native
```

#### 2단계: 앱에 통합
```javascript
// App.js
import RidgeAIPush from '@ridge-ai/push-react-native';

export default function App() {
  useEffect(() => {
    // SDK 초기화
    RidgeAIPush.initialize({
      apiKey: 'YOUR_API_KEY',
      projectId: 'your-firebase-project-id'
    });

    // 푸시 권한 요청
    RidgeAIPush.requestPermissions().then(granted => {
      if (granted) {
        console.log('푸시 알림 권한 허용됨');
      }
    });

    // 푸시 클릭 이벤트 처리
    RidgeAIPush.onNotificationClick((notification) => {
      console.log('푸시 클릭:', notification);
      // 딥링크 처리 등
    });
  }, []);

  return <YourApp />;
}
```

#### 3단계: 이벤트 추적
```javascript
// 사용자 이벤트 추적
const trackUserEvent = (eventName, properties) => {
  RidgeAIPush.trackEvent(eventName, properties);
};

// 사용자 속성 설정
const setUserAttributes = (attributes) => {
  RidgeAIPush.setUserAttributes(attributes);
};

// 사용 예시
trackUserEvent('screen_view', { screen_name: 'home' });
setUserAttributes({ age: 25, city: 'Seoul' });
```

---

## 🎛️ 대시보드 사용법

### 멀티채널 캠페인 생성

#### 1. 대시보드 접속
```
https://ai-push.ridge-it.site/
```

#### 2. 캠페인 생성 단계

**기본 정보 입력:**
- 제목: "🎉 특가 세일 시작!"
- 메시지: "오늘만 50% 할인! 놓치지 마세요!"
- 캠페인 유형: 프로모션

**채널 선택:**
- ☑️ 모바일 푸시 (iOS/Android)
- ☑️ 웹 푸시 (브라우저)
- ☐ 이메일 (준비중)

**AI 최적화:**
- ☑️ AI 채널 최적화 활성화
- → 사용자별로 가장 효과적인 채널을 AI가 자동 선택

**타겟팅 (선택사항):**
- 태그: "premium, active_user"
- 최소 구매금액: 50,000원

#### 3. 실시간 결과 확인
```
✅ 캠페인 전송 완료!
총 대상자: 1,247명
📱 모바일: 856명 성공, 12명 실패  
🌐 웹 푸시: 378명 성공, 1명 실패
🤖 AI가 사용자별 최적 채널을 선택했습니다
```

---

## 🔌 API 사용법

### 멀티채널 푸시 발송

```javascript
// 멀티채널 캠페인 생성
const response = await fetch('/api/campaigns/multi-channel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    title: '🎯 특별 혜택',
    message: '지금 바로 확인하세요!',
    campaignType: 'promotional',
    channels: ['mobile', 'web'],
    optimizeChannels: true, // AI 최적화 활성화
    targetUsers: {
      tags: ['premium'],
      attributes: {
        purchaseAmount: { $gte: 100000 }
      }
    },
    webPushOptions: {
      icon: '/logo.svg',
      url: 'https://yoursite.com/sale'
    }
  })
});

const result = await response.json();
console.log('발송 결과:', result);
```

### 웹 푸시만 발송

```javascript
// 웹 푸시 전용 발송
const response = await fetch('/api/web-push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    title: '🔔 중요한 알림',
    message: '새로운 메시지가 도착했습니다',
    icon: '/notification-icon.png',
    url: 'https://yoursite.com/messages',
    targetUsers: {} // 모든 구독자에게
  })
});
```

### 사용자 이벤트 추적

```javascript
// 이벤트 추적 API
await fetch('/api/events/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    userIdInClientApp: 'user123',
    eventName: 'purchase_completed',
    properties: {
      orderId: 'ORDER_12345',
      amount: 150000,
      products: ['product1', 'product2']
    }
  })
});
```

---

## 🤖 고급 기능

### AI 추천 시스템

```javascript
// AI 기반 추천 받기
const recommendations = await fetch('/api/ai/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    companyId: 'your-company-id',
    analysisType: 'user_engagement'
  })
});

const aiInsights = await recommendations.json();
console.log('AI 추천:', aiInsights);
```

### 세그먼트 관리

```javascript
// 사용자 세그먼트 생성
const segment = await fetch('/api/segments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'VIP 고객',
    conditions: {
      tags: { $in: ['vip', 'premium'] },
      'attributes.totalPurchases': { $gte: 5 }
    }
  })
});
```

### 실시간 분석

```javascript
// 캠페인 성과 분석
const analytics = await fetch('/api/campaigns/analytics', {
  method: 'GET',
  headers: {
    'X-API-Key': 'YOUR_API_KEY'
  }
});

const data = await analytics.json();
/*
{
  totalSent: 10000,
  delivered: 9850,
  clicked: 1230,
  clickRate: 12.5,
  channelBreakdown: {
    mobile: { sent: 6000, clicked: 750 },
    web: { sent: 4000, clicked: 480 }
  }
}
*/
```

---

## 🔧 개발자 도구

### 테스트 모드

```javascript
// 개발 환경에서 테스트용 푸시 발송
await fetch('/api/test/send-push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    title: '🧪 테스트 푸시',
    message: '테스트 메시지입니다',
    testMode: true
  })
});
```

### 디버깅

```javascript
// SDK 디버그 모드 활성화
RidgeAIPush.init({
  apiKey: 'YOUR_API_KEY',
  debug: true // 콘솔에 상세 로그 출력
});
```

---

## 📞 지원 및 문의

### 기술 지원
- 📧 이메일: support@ridge-it.site
- 📚 문서: https://docs.ridge-ai-push.com
- 🐛 버그 리포트: GitHub Issues

### 라이브 데모
- 🌐 웹 푸시 데모: https://ai-push.ridge-it.site/demo/web-push
- 📱 모바일 데모 앱: (TestFlight/Google Play 베타)

### 가격 정보
- 🆓 무료 플랜: 월 1,000건
- 💼 프로 플랜: 월 50,000건
- 🏢 기업 플랜: 무제한

---

**🎉 축하합니다! Ridge AI Push로 스마트한 푸시 알림을 시작하세요!**