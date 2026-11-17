export interface ICampaign {
  _id?: string | any;
  companyId: string;
  appId?: string;                    // Which customer app this campaign targets
  title: string;
  message: string;
  
  // 다중 채널 지원
  campaignType?: 'promotional' | 'transactional' | 'retention' | 'welcome' | 'abandoned_cart' | 'default';
  channels?: ('mobile' | 'web' | 'email')[];
  
  target: {
    platform?: 'ios' | 'android' | 'all';
    lastLoginDays?: number;
    userIds?: string[];
    customAttributes?: Record<string, any>;
    appIds?: string[];               // Target specific apps (if not set, targets all company apps)
  };
  targetCriteria?: any;             // 새로운 타겟팅 구조
  
  // 웹 푸시 전용 설정
  webPushOptions?: {
    icon?: string;
    badge?: string;
    image?: string;
    url?: string;
    actions?: any[];
  };
  
  sendAt: Date;
  landingUrl?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentCount?: number;
  clickedCount?: number;
  
  // 채널별 상세 통계
  stats?: {
    mobileSent?: number;
    mobileFailed?: number;
    mobileClicked?: number;
    
    webSent?: number;
    webFailed?: number;
    webClicked?: number;
    
    emailSent?: number;
    emailFailed?: number;
    emailClicked?: number;
    
    totalUsers?: number;
    aiOptimized?: boolean;
  };
  
  // AI 최적화 관련
  aiOptimized?: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: {
    prompt?: string;
    aiGeneratedAt?: Date;
    userStats?: any;
    targetedUserCount?: number;
  };
}