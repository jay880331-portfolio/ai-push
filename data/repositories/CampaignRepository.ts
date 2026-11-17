import { Campaign, ICampaignDocument } from '@/models/Campaign';
import { ICampaign } from '@/types';

export class CampaignRepository {
  async createCampaign(campaignData: Omit<ICampaign, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICampaign> {
    const campaign = new Campaign(campaignData);
    const savedCampaign = await campaign.save();
    return savedCampaign.toObject();
  }

  async getCampaignById(campaignId: string): Promise<ICampaign | null> {
    const campaign = await Campaign.findById(campaignId);
    return campaign ? campaign.toObject() : null;
  }

  async getCampaignsByCompanyId(companyId: string, limit: number = 50): Promise<ICampaign[]> {
    const campaigns = await Campaign
      .find({ companyId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return campaigns.map(c => c.toObject());
  }

  async getScheduledCampaigns(currentTime: Date): Promise<ICampaign[]> {
    const campaigns = await Campaign.find({
      status: 'scheduled',
      sendAt: { $lte: currentTime }
    });
    return campaigns.map(c => c.toObject());
  }

  async updateCampaignStatus(campaignId: string, status: ICampaign['status'], additionalUpdates?: Partial<ICampaign>): Promise<ICampaign | null> {
    const updates = { status, ...additionalUpdates };
    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      updates,
      { new: true }
    );
    return campaign ? campaign.toObject() : null;
  }

  async incrementCampaignMetrics(campaignId: string, metric: 'sentCount' | 'clickedCount', increment: number = 1): Promise<void> {
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { [metric]: increment }
    });
  }

  async getCampaignsByStatus(companyId: string, status: ICampaign['status']): Promise<ICampaign[]> {
    const campaigns = await Campaign.find({ companyId, status });
    return campaigns.map(c => c.toObject());
  }
}