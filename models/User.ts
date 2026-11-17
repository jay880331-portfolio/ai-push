import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>({
  companyId: { type: String, required: true, index: true },
  appId: { type: String, index: true },
  userIdInClientApp: { type: String, required: true },
  
  // 모바일 푸시 토큰 (기존)
  pushToken: { type: String },
  token: { type: String }, // 호환성을 위한 alias
  tokenType: { type: String, enum: ['fcm', 'expo'], default: 'fcm' },
  platform: { type: String, enum: ['ios', 'android', 'web'] },
  
  // 웹 푸시 구독 정보 (신규)
  webPushSubscription: {
    endpoint: { type: String },
    keys: {
      p256dh: { type: String },
      auth: { type: String }
    },
    userAgent: { type: String },
    subscriptionUrl: { type: String }
  },
  
  // 이메일 (향후 이메일 마케팅용)
  email: { type: String, index: true },
  
  // 디바이스 정보
  deviceInfo: {
    brand: { type: String },
    modelName: { type: String },
    osVersion: { type: String },
    userAgent: { type: String },
    url: { type: String }
  },
  
  lastLogin: { type: Date, index: true },
  lastActiveAt: { type: Date, index: true },
  customAttributes: { type: Schema.Types.Mixed },
  tags: [{ type: String }],
  
  // 새로운 구조화된 속성들 (Phase 1)
  attributes: {
    age: { type: Number, index: true },
    gender: { type: String, enum: ['M', 'F', 'Other'], index: true },
    region: { type: String, index: true },
    purchaseAmount: { type: Number, index: true },
    membershipTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'VIP'], index: true }
  },
  
  // 채널별 선호도/응답률 (AI 최적화용)
  channelPreferences: {
    mobile: { type: Number, default: 0.4 },
    web: { type: Number, default: 0.4 },
    email: { type: Number, default: 0.2 }
  },
  
  isActive: { type: Boolean, default: true, index: true }
}, { 
  timestamps: true 
});

// Compound unique index
UserSchema.index({ companyId: 1, userIdInClientApp: 1 }, { unique: true });

// Index for efficient querying by company and platform
UserSchema.index({ companyId: 1, platform: 1, isActive: 1 });

// Index for targeting by lastLogin
UserSchema.index({ companyId: 1, lastLogin: -1, isActive: 1 });

export const User = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);