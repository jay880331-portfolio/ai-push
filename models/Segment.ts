import mongoose, { Document, Schema } from 'mongoose';
import { ISegment, SegmentRule } from '@/types/segment';

export interface ISegmentDocument extends Omit<ISegment, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const SegmentRuleSchema = new Schema<SegmentRule>({
  field: {
    type: String,
    required: true,
    enum: ['platform', 'lastLoginDays', 'tags', 'userIdInClientApp', 'appId', 'lastActiveAt', 'attributes.age', 'attributes.gender', 'attributes.region', 'attributes.purchaseAmount', 'attributes.membershipTier']
  },
  operator: {
    type: String,
    required: true,
    enum: ['equals', 'not_equals', 'contains', 'not_contains', 'within_days', 'older_than_days', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'between', 'not_between', 'in_array', 'not_in_array', 'starts_with', 'ends_with']
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  }
});

const SegmentSchema = new Schema<ISegmentDocument>({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  rules: [SegmentRuleSchema],
  userCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 회사별 세그먼트 이름 유니크 제약
SegmentSchema.index({ companyId: 1, name: 1 }, { unique: true });

export const Segment = mongoose.models.Segment || mongoose.model<ISegmentDocument>('Segment', SegmentSchema);