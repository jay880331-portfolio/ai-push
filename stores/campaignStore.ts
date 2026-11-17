import { create } from 'zustand';
import { ICampaign } from '@/types';

interface CampaignState {
  campaigns: ICampaign[];
  loading: boolean;
  error: string | null;
  fetchCampaigns: (apiKey: string) => Promise<void>;
  addCampaign: (campaign: ICampaign) => void;
  updateCampaign: (campaignId: string, updates: Partial<ICampaign>) => void;
  clearCampaigns: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  loading: false,
  error: null,

  fetchCampaigns: async (apiKey: string) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch('/api/campaigns', {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      set({ campaigns: data.campaigns, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addCampaign: (campaign: ICampaign) => {
    set((state) => ({
      campaigns: [campaign, ...state.campaigns],
    }));
  },

  updateCampaign: (campaignId: string, updates: Partial<ICampaign>) => {
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign._id === campaignId
          ? { ...campaign, ...updates }
          : campaign
      ),
    }));
  },

  clearCampaigns: () => {
    set({ campaigns: [], error: null });
  },
}));