export interface IClickEvent {
  _id?: string | any;
  campaignId: string;
  companyId: string;
  userIdInClientApp: string;
  timestamp: Date;
  deviceInfo?: {
    platform?: string;
    userAgent?: string;
    ip?: string;
  };
  createdAt?: Date;
}