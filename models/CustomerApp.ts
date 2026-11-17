import mongoose, { Schema, Document } from 'mongoose';
import { ICustomerApp } from '@/types';

export interface ICustomerAppDocument extends Omit<ICustomerApp, '_id'>, Document {}

const CustomerAppSchema = new Schema<ICustomerAppDocument>({
  companyId: { type: String, required: true, index: true },
  appName: { type: String, required: true },
  packageName: { type: String, required: true },
  platform: { type: String, enum: ['android', 'ios', 'both', 'web'], required: true },
  firebaseAppId: { type: String },
  
  // Web Push VAPID Keys (고객별 고유)
  vapidKeys: {
    publicKey: { type: String },
    privateKey: { type: String },
    email: { type: String }
  },
  
  // API Key (고객별 고유)
  apiKey: { type: String, unique: true, sparse: true },
  
  isActive: { type: Boolean, default: true, index: true }
}, { 
  timestamps: true 
});

// Compound unique index for company + package name
CustomerAppSchema.index({ companyId: 1, packageName: 1 }, { unique: true });

// Index for efficient querying
CustomerAppSchema.index({ companyId: 1, isActive: 1 });

export const CustomerApp = mongoose.models.CustomerApp || mongoose.model<ICustomerAppDocument>('CustomerApp', CustomerAppSchema);