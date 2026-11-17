import { ClickEvent, IClickEventDocument } from '@/models/ClickEvent';
import { IClickEvent } from '@/types';

export class ClickEventRepository {
  async createClickEvent(eventData: Omit<IClickEvent, '_id' | 'createdAt'>): Promise<IClickEvent> {
    const clickEvent = new ClickEvent(eventData);
    const savedEvent = await clickEvent.save();
    return savedEvent.toObject();
  }

  async getClickEventsByCampaignId(campaignId: string): Promise<IClickEvent[]> {
    const events = await ClickEvent
      .find({ campaignId })
      .sort({ timestamp: -1 });
    return events.map(e => e.toObject());
  }

  async getClickEventsByCompanyId(companyId: string, dateRange?: { start: Date; end: Date }): Promise<IClickEvent[]> {
    let query: any = { companyId };
    
    if (dateRange) {
      query.timestamp = { 
        $gte: dateRange.start, 
        $lte: dateRange.end 
      };
    }

    const events = await ClickEvent
      .find(query)
      .sort({ timestamp: -1 });
    return events.map(e => e.toObject());
  }

  async countClicksByCampaignId(campaignId: string): Promise<number> {
    return await ClickEvent.countDocuments({ campaignId });
  }

  async getUniqueClickersByCampaignId(campaignId: string): Promise<string[]> {
    const result = await ClickEvent.distinct('userIdInClientApp', { campaignId });
    return result;
  }

  async checkUserClickedCampaign(campaignId: string, userIdInClientApp: string): Promise<boolean> {
    const event = await ClickEvent.findOne({ campaignId, userIdInClientApp });
    return !!event;
  }
}