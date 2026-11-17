import { create } from 'zustand';
import { ICustomerApp } from '@/types';

interface AppState {
  apps: ICustomerApp[];
  selectedAppId: string | null;
  loading: boolean;
  error: string | null;
  fetchApps: (apiKey: string) => Promise<void>;
  addApp: (app: ICustomerApp) => void;
  updateApp: (appId: string, updates: Partial<ICustomerApp>) => void;
  selectApp: (appId: string | null) => void;
  clearApps: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  apps: [],
  selectedAppId: null,
  loading: false,
  error: null,

  fetchApps: async (apiKey: string) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch('/api/apps', {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }

      const data = await response.json();
      set({ apps: data.apps, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addApp: (app: ICustomerApp) => {
    set((state) => ({
      apps: [app, ...state.apps],
    }));
  },

  updateApp: (appId: string, updates: Partial<ICustomerApp>) => {
    set((state) => ({
      apps: state.apps.map((app) =>
        app._id === appId ? { ...app, ...updates } : app
      ),
    }));
  },

  selectApp: (appId: string | null) => {
    set({ selectedAppId: appId });
  },

  clearApps: () => {
    set({ apps: [], selectedAppId: null, error: null });
  },
}));