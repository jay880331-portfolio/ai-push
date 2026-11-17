import { CampaignRepository } from '@/data/repositories/CampaignRepository';
import { ICampaign } from '@/types';

export class GetCampaignsUseCase {
  private campaignRepository: CampaignRepository;

  constructor() {
    this.campaignRepository = new CampaignRepository();
  }

  async execute(companyId: string, limit?: number): Promise<ICampaign[]> {
    try {
      const campaigns = await this.campaignRepository.getCampaignsByCompanyId(
        companyId,
        limit
      );
      
      return campaigns;
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw new Error('Failed to get campaigns');
    }
  }

  async getByStatus(companyId: string, status: ICampaign['status']): Promise<ICampaign[]> {
    try {
      const campaigns = await this.campaignRepository.getCampaignsByStatus(
        companyId,
        status
      );
      
      return campaigns;
    } catch (error) {
      console.error('Error getting campaigns by status:', error);
      throw new Error('Failed to get campaigns by status');
    }
  }

  async getById(campaignId: string): Promise<ICampaign | null> {
    try {
      const campaign = await this.campaignRepository.getCampaignById(campaignId);
      return campaign;
    } catch (error) {
      console.error('Error getting campaign by ID:', error);
      throw new Error('Failed to get campaign');
    }
  }
}