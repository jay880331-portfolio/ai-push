import mongoose, { Schema, Document } from 'mongoose';
import { ICampaign } from '@/types';

export interface ICampaignDocument extends Omit<ICampaign, '_id'>, Document {}

const CampaignSchema = new Schema<ICampaignDocument>({
  companyId: { type: String, required: true, index: true },
  appId: { type: String, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // 다중 채널 지원
  campaignType: { 
    type: String, 
    enum: ['promotional', 'transactional', 'retention', 'welcome', 'abandoned_cart', 'default'],
    default: 'default'
  },
  channels: [{ 
    type: String, 
    enum: ['mobile', 'web', 'email'],
    default: ['mobile']
  }],
  
  target: {
    platform: { type: String, enum: ['ios', 'android', 'web', 'all'], default: 'all' },
    lastLoginDays: { type: Number },
    userIds: [{ type: String }],
    customAttributes: { type: Schema.Types.Mixed },
    appIds: [{ type: String }],
    tags: [{ type: String }],
    attributes: { type: Schema.Types.Mixed }
  },
  targetCriteria: { type: Schema.Types.Mixed }, // 새로운 타겟팅 구조
  
  sendAt: { type: Date, index: true },
  landingUrl: { type: String },
  
  // 웹 푸시 전용 설정
  webPushOptions: {
    icon: { type: String },
    badge: { type: String },
    image: { type: String },
    url: { type: String }
  },
  
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'active', 'sent', 'failed'], 
    default: 'draft',
    index: true
  },
  
  // 채널별 상세 통계
  stats: {
    // 모바일 푸시
    mobileSent: { type: Number, default: 0 },
    mobileFailed: { type: Number, default: 0 },
    mobileClicked: { type: Number, default: 0 },
    
    // 웹 푸시
    webPushSent: { type: Number, default: 0 },
    webPushFailed: { type: Number, default: 0 },
    webPushClicked: { type: Number, default: 0 },
    
    // 이메일
    emailSent: { type: Number, default: 0 },
    emailFailed: { type: Number, default: 0 },
    emailClicked: { type: Number, default: 0 },
    
    // 전체 통계
    totalSent: { type: Number, default: 0 },
    totalClicked: { type: Number, default: 0 },
    totalConverted: { type: Number, default: 0 },
    
    // 성과 지표
    clickRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  
  // 기존 필드들 (호환성)
  sentCount: { type: Number, default: 0 },
  clickedCount: { type: Number, default: 0 },
  
  // AI 최적화 관련
  aiOptimized: { type: Boolean, default: false },
  metadata: {
    prompt: { type: String },
    aiGeneratedAt: { type: Date },
    channelOptimization: { type: Schema.Types.Mixed }
  }
}, { 
  timestamps: true 
});

// Compound index for efficient querying
CampaignSchema.index({ companyId: 1, status: 1, sendAt: 1 });

export const Campaign = mongoose.models.Campaign || mongoose.model<ICampaignDocument>('Campaign', CampaignSchema);