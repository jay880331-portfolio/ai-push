import { CampaignRepository } from '@/data/repositories/CampaignRepository';
import { UserRepository } from '@/data/repositories/UserRepository';
import { sendMultiAppPushNotification } from '@/lib/firebaseMultiApp';
import { ICampaign, IUser } from '@/types';

export class SendScheduledPushesUseCase {
  private campaignRepository: CampaignRepository;
  private userRepository: UserRepository;

  constructor() {
    this.campaignRepository = new CampaignRepository();
    this.userRepository = new UserRepository();
  }

  async execute(): Promise<{ processedCampaigns: number; totalSent: number }> {
    let processedCampaigns = 0;
    let totalSent = 0;

    try {
      // Get all scheduled campaigns that should be sent now
      const currentTime = new Date();
      const campaigns = await this.campaignRepository.getScheduledCampaigns(currentTime);

      for (const campaign of campaigns) {
        try {
          const sentCount = await this.sendCampaign(campaign);
          totalSent += sentCount;
          processedCampaigns++;

          // Update campaign status
          await this.campaignRepository.updateCampaignStatus(
            campaign._id!,
            'sent',
            { sentCount }
          );
        } catch (error) {
          console.error(`Failed to send campaign ${campaign._id}:`, error);
          await this.campaignRepository.updateCampaignStatus(
            campaign._id!,
            'failed'
          );
        }
      }

      return { processedCampaigns, totalSent };
    } catch (error) {
      console.error('Error processing scheduled pushes:', error);
      throw new Error('Failed to process scheduled pushes');
    }
  }

  private async sendCampaign(campaign: ICampaign): Promise<number> {
    // Get target users
    const users = await this.getUsersForCampaign(campaign);
    
    if (users.length === 0) {
      console.log(`No users found for campaign ${campaign._id}`);
      return 0;
    }

    // Extract push tokens
    const tokens = users.map(user => user.pushToken).filter(Boolean);
    
    if (tokens.length === 0) {
      console.log(`No valid push tokens for campaign ${campaign._id}`);
      return 0;
    }

    // Prepare push data
    const pushData: Record<string, string> = {
      campaignId: campaign._id!,
      companyId: campaign.companyId,
    };

    if (campaign.appId) {
      pushData.appId = campaign.appId;
    }

    if (campaign.landingUrl) {
      pushData.landingUrl = campaign.landingUrl;
    }

    // Send pushes in batches using multi-app Firebase
    const batchSize = 500;
    let totalSuccessful = 0;

    for (let i = 0; i < tokens.length; i += batchSize) {
      const batchTokens = tokens.slice(i, i + batchSize);
      
      try {
        const response = await sendMultiAppPushNotification({
          companyId: campaign.companyId,
          appId: campaign.appId,
          tokens: batchTokens,
          title: campaign.title,
          body: campaign.message,
          data: pushData,
        });

        totalSuccessful += response.successCount;

        // Handle failed tokens (e.g., invalid or expired)
        if (response.failureCount > 0) {
          response.responses.forEach((resp, index) => {
            if (!resp.success) {
              console.error(`Failed to send to token ${batchTokens[index]}:`, resp.error);
            }
          });
        }
      } catch (error) {
        console.error('Error sending batch:', error);
      }
    }

    return totalSuccessful;
  }

  private async getUsersForCampaign(campaign: ICampaign): Promise<IUser[]> {
    const filters: any = {
      isActive: true,
    };

    if (campaign.target.platform && campaign.target.platform !== 'all') {
      filters.platform = campaign.target.platform;
    }

    if (campaign.target.lastLoginDays) {
      filters.lastLoginDays = campaign.target.lastLoginDays;
    }

    if (campaign.target.userIds && campaign.target.userIds.length > 0) {
      filters.userIds = campaign.target.userIds;
    }

    // App-specific targeting
    if (campaign.appId) {
      filters.appId = campaign.appId;
    } else if (campaign.target.appIds && campaign.target.appIds.length > 0) {
      filters.appIds = campaign.target.appIds;
    }
    // If no app targeting specified, targets all apps in the company

    return await this.userRepository.getUsersByCompanyId(campaign.companyId, filters);
  }
}