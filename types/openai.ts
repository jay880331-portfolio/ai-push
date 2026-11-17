export interface CampaignPromptRequest {
  prompt: string;
  companyId: string;
  context?: {
    previousCampaigns?: any[];
    userSegments?: any[];
    userStats?: any;
    availableUsers?: any[];
  };
}

export interface CampaignPromptResponse {
  title: string;
  message: string;
  target: {
    platform?: 'ios' | 'android' | 'all';
    lastLoginDays?: number;
    userTags?: string[];
  };
  sendAt: string; // ISO string
  landingUrl?: string;
  reasoning?: string;
}