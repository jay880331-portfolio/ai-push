export interface IUser {
  _id?: string | any;
  companyId: string;
  appId?: string;                    // Which customer app this user belongs to
  userIdInClientApp: string;
  pushToken: string;
  token?: string;                       // 호환성을 위한 alias
  tokenType?: 'fcm' | 'expo';           // 토큰 타입 구분
  platform: 'ios' | 'android' | 'web';  // 웹 플랫폼 추가
  
  // 웹 푸시 지원
  webPushSubscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  
  // Expo 푸시 토큰
  expoPushToken?: string;
  
  // 사용자 정보
  email?: string;
  
  // 디바이스 정보
  deviceInfo?: {
    userAgent?: string;
    appVersion?: string;
    osVersion?: string;
  };
  
  // 구독 정보
  subscriptionUrl?: string;
  lastLogin: Date;
  lastActiveAt?: Date;
  customAttributes?: Record<string, any>;
  tags?: string[];
  // 새로운 구조화된 속성들 (Phase 1 핵심 필드)
  attributes?: {
    age?: number;                    // 나이
    gender?: 'M' | 'F' | 'Other';   // 성별
    region?: string;                 // 지역
    purchaseAmount?: number;         // 총 구매금액
    membershipTier?: 'Bronze' | 'Silver' | 'Gold' | 'VIP'; // 멤버십 등급
  };
  
  // 채널별 선호도/응답률 (AI 최적화용)
  channelPreferences?: {
    mobile?: number;
    web?: number;
    email?: number;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}