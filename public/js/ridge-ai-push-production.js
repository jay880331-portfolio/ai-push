/**
 * Ridge AI Push - Web Push SDK (Production Version)
 * AI-powered push notifications for websites
 *
 * Usage:
 * <script src="https://ai-push.ridge-it.site/js/ridge-ai-push.js"></script>
 * <script>
 *   RidgeAIPush.init({
 *     apiKey: 'your-api-key',
 *     vapidPublicKey: 'your-vapid-public-key'
 *   });
 * </script>
 */

(function (window, document) {
  'use strict';

  // 프로덕션 환경 설정
  const PRODUCTION_API_BASE_URL = 'https://ai-push.ridge-it.site/api';
  const PRODUCTION_VAPID_KEY =
    'BFybyp2nM7n5P8blNU0aQPj-ep-l-6L0sTeAZOkcVZiLNh5KiBLBVr1JRdXwfLzfAseBeOINhdEBNkhnxWJ03hk';

  class RidgeAIPush {
    constructor() {
      this.config = null;
      this.isInitialized = false;
      this.subscription = null;
      this.userId = null;
      this.apiBaseUrl = PRODUCTION_API_BASE_URL;
    }

    /**
     * SDK 초기화
     * @param {Object} config - 설정 객체
     * @param {string} config.apiKey - AI Push API 키 (필수)
     * @param {string} config.vapidPublicKey - VAPID 공용 키 (선택사항)
     * @param {string} config.baseUrl - API 기본 URL (선택사항)
     * @param {boolean} config.debug - 디버그 모드 (선택사항)
     */
    async init(config) {
      try {
        if (this.config.debug) {
          console.log('🚀 Ridge AI Push 초기화 시작...');
        }

        if (!config.apiKey) {
          throw new Error('API 키가 필요합니다. Ridge AI Push 대시보드에서 API 키를 발급받으세요.');
        }

        this.config = {
          vapidPublicKey: config.vapidPublicKey || PRODUCTION_VAPID_KEY,
          baseUrl: config.baseUrl || PRODUCTION_API_BASE_URL,
          debug: config.debug || false,
          ...config,
        };

        if (this.config.baseUrl) {
          this.apiBaseUrl = this.config.baseUrl;
        }

        // 브라우저 지원 확인
        if (!this.isSupported()) {
          throw new Error('이 브라우저는 웹 푸시를 지원하지 않습니다');
        }

        // Service Worker 등록
        await this.registerServiceWorker();

        // 기존 구독 확인
        await this.checkExistingSubscription();

        this.isInitialized = true;

        if (this.config.debug) {
          console.log('✅ Ridge AI Push 초기화 완료');
        }

        // 사용자 행동 추적 시작
        this.startUserTracking();
      } catch (error) {
        console.error('❌ Ridge AI Push 초기화 실패:', error);
        throw error;
      }
    }

    /**
     * 브라우저 지원 여부 확인
     */
    isSupported() {
      return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    }

    /**
     * Service Worker 등록
     */
    async registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        try {
          // 실제 Service Worker 파일 사용 (고객은 자신의 도메인에 배치)
          const registration = await navigator.serviceWorker.register('/sw-ridge-ai-push.js');

          if (this.config.debug) {
            console.log('✅ Service Worker 등록 성공:', registration);
          }

          this.swRegistration = registration;
          return registration;
        } catch (error) {
          console.error('❌ Service Worker 등록 실패:', error);
          throw error;
        }
      }
    }

    /**
     * 기존 구독 확인
     */
    async checkExistingSubscription() {
      if (this.swRegistration) {
        this.subscription = await this.swRegistration.pushManager.getSubscription();
        if (this.subscription && this.config.debug) {
          console.log('✅ 기존 구독 발견:', this.subscription);
        }
      }
    }

    /**
     * 푸시 알림 권한 요청 및 구독
     */
    async requestPermission() {
      try {
        // 권한 요청
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
          throw new Error('푸시 알림 권한이 거부되었습니다');
        }

        // 구독 생성
        const subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey),
        });

        this.subscription = subscription;

        // 서버에 구독 정보 전송
        await this.sendSubscriptionToServer(subscription);

        if (this.config.debug) {
          console.log('✅ 푸시 구독 성공:', subscription);
        }

        return subscription;
      } catch (error) {
        console.error('❌ 푸시 구독 실패:', error);
        throw error;
      }
    }

    /**
     * 구독 정보를 서버에 전송 (프로덕션용)
     */
    async sendSubscriptionToServer(subscription) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/web-push/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            userIdInClientApp: this.userId || `web_user_${Date.now()}`,
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        });

        if (!response.ok) {
          throw new Error(`서버 응답 오류: ${response.status}`);
        }

        const result = await response.json();
        this.userId = result.userId;

        if (this.config.debug) {
          console.log('✅ 구독 정보 서버 전송 성공:', result);
        }

        return result;
      } catch (error) {
        console.error('❌ 구독 정보 서버 전송 실패:', error);
        throw error;
      }
    }

    /**
     * 사용자 행동 추적 시작
     */
    startUserTracking() {
      // 페이지 뷰 추적
      this.trackEvent('page_view', {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
      });

      // 스크롤 추적
      let scrollTracked = false;
      window.addEventListener('scroll', () => {
        if (!scrollTracked && window.scrollY > window.innerHeight * 0.5) {
          scrollTracked = true;
          this.trackEvent('scroll_50_percent');
        }
      });

      // 이탈 의도 감지
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0) {
          this.trackEvent('exit_intent');
        }
      });

      // 페이지 체류 시간 추적
      let startTime = Date.now();
      window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        this.trackEvent('time_spent', { seconds: timeSpent });
      });
    }

    /**
     * 사용자 이벤트 추적
     */
    async trackEvent(eventName, properties = {}) {
      if (!this.isInitialized) return;

      try {
        await fetch(`${this.apiBaseUrl}/events/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
          },
          body: JSON.stringify({
            userIdInClientApp: this.userId || `web_user_${Date.now()}`,
            eventName,
            properties: {
              ...properties,
              url: window.location.href,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (this.config.debug) {
          console.log(`📊 이벤트 추적: ${eventName}`, properties);
        }
      } catch (error) {
        if (this.config.debug) {
          console.error('❌ 이벤트 추적 실패:', error);
        }
      }
    }

    /**
     * 사용자 속성 업데이트
     */
    async updateUserAttributes(attributes) {
      if (!this.isInitialized || !this.userId) return;

      try {
        await fetch(`${this.apiBaseUrl}/users/${this.userId}/attributes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
          },
          body: JSON.stringify({ attributes }),
        });

        if (this.config.debug) {
          console.log('✅ 사용자 속성 업데이트 성공');
        }
      } catch (error) {
        if (this.config.debug) {
          console.error('❌ 사용자 속성 업데이트 실패:', error);
        }
      }
    }

    /**
     * 태그 추가
     */
    async addTags(tags) {
      if (!this.isInitialized || !this.userId) return;

      try {
        await fetch(`${this.apiBaseUrl}/users/${this.userId}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
          },
          body: JSON.stringify({ tags }),
        });

        if (this.config.debug) {
          console.log('✅ 태그 추가 성공:', tags);
        }
      } catch (error) {
        if (this.config.debug) {
          console.error('❌ 태그 추가 실패:', error);
        }
      }
    }

    /**
     * 구독 해제
     */
    async unsubscribe() {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;

        if (this.config.debug) {
          console.log('✅ 푸시 구독 해제됨');
        }
      }
    }

    /**
     * VAPID 키를 Uint8Array로 변환
     */
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    /**
     * 현재 구독 상태 확인
     */
    isSubscribed() {
      return !!this.subscription;
    }

    /**
     * 권한 상태 확인
     */
    getPermissionState() {
      return Notification.permission;
    }
  }

  // 전역 객체로 노출
  window.RidgeAIPush = new RidgeAIPush();

  // 자동 초기화 (data-* 속성 사용)
  document.addEventListener('DOMContentLoaded', () => {
    const script = document.querySelector('script[src*="ridge-ai-push"]');
    if (script) {
      const apiKey = script.getAttribute('data-api-key');
      const vapidKey = script.getAttribute('data-vapid-key');
      const debug = script.getAttribute('data-debug') === 'true';

      // API 키가 있는 경우에만 초기화
      if (apiKey) {
        window.RidgeAIPush.init({
          apiKey,
          vapidPublicKey: vapidKey,
          debug,
        }).catch(console.error);
      }
    }
  });
})(window, document);
