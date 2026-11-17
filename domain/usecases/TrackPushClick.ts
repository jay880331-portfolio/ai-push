import { ClickEventRepository } from '@/data/repositories/ClickEventRepository';
import { CampaignRepository } from '@/data/repositories/CampaignRepository';
import { IClickEvent } from '@/types';

export interface TrackPushClickInput {
  campaignId: string;
  companyId: string;
  userIdInClientApp: string;
  deviceInfo?: {
    platform?: string;
    userAgent?: string;
    ip?: string;
  };
}

export class TrackPushClickUseCase {
  private clickEventRepository: ClickEventRepository;
  private campaignRepository: CampaignRepository;

  constructor() {
    this.clickEventRepository = new ClickEventRepository();
    this.campaignRepository = new CampaignRepository();
  }

  async execute(input: TrackPushClickInput): Promise<IClickEvent> {
    try {
      // Check if user already clicked this campaign
      const alreadyClicked = await this.clickEventRepository.checkUserClickedCampaign(
        input.campaignId,
        input.userIdInClientApp
      );

      // Create click event
      const clickEvent = await this.clickEventRepository.createClickEvent({
        campaignId: input.campaignId,
        companyId: input.companyId,
        userIdInClientApp: input.userIdInClientApp,
        timestamp: new Date(),
        deviceInfo: input.deviceInfo,
      });

      // Increment campaign click count only for unique clicks
      if (!alreadyClicked) {
        await this.campaignRepository.incrementCampaignMetrics(
          input.campaignId,
          'clickedCount',
          1
        );
      }

      return clickEvent;
    } catch (error) {
      console.error('Error tracking push click:', error);
      throw new Error('Failed to track push click');
    }
  }
}