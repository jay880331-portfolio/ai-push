import mongoose, { Schema, Document } from 'mongoose';
import { IClickEvent } from '@/types';

export interface IClickEventDocument extends Omit<IClickEvent, '_id'>, Document {}

const ClickEventSchema = new Schema<IClickEventDocument>({
  campaignId: { type: String, required: true, index: true },
  companyId: { type: String, required: true, index: true },
  userIdInClientApp: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  deviceInfo: {
    platform: { type: String },
    userAgent: { type: String },
    ip: { type: String }
  }
}, { 
  timestamps: true 
});

// Compound index for analytics queries
ClickEventSchema.index({ campaignId: 1, timestamp: -1 });
ClickEventSchema.index({ companyId: 1, campaignId: 1 });

export const ClickEvent = mongoose.models.ClickEvent || mongoose.model<IClickEventDocument>('ClickEvent', ClickEventSchema);