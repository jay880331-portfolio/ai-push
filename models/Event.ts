import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: string;
  appId: string;
  userIdInClientApp: string;
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  appId: {
    type: String,
    required: true,
    index: true
  },
  userIdInClientApp: {
    type: String,
    required: true,
    index: true
  },
  eventName: {
    type: String,
    required: true,
    index: true
  },
  properties: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'events'
});

// 복합 인덱스 생성 (쿼리 성능 최적화)
EventSchema.index({ companyId: 1, eventName: 1, timestamp: -1 });
EventSchema.index({ companyId: 1, userIdInClientApp: 1, timestamp: -1 });
EventSchema.index({ companyId: 1, appId: 1, eventName: 1, timestamp: -1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);