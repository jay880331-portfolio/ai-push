import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  apiKey: string | null;
  companyId: string | null;
  isAuthenticated: boolean;
  setApiKey: (apiKey: string) => Promise<void>;
  clearApiKey: () => void;
  validateApiKey: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      companyId: null,
      isAuthenticated: false,

      setApiKey: async (apiKey: string) => {
        // Validate API key with backend
        try {
          const response = await fetch('/api/campaigns?limit=1', {
            headers: {
              'X-API-Key': apiKey,
            },
          });

          if (response.ok) {
            // API key is valid, extract companyId from response or set a default
            set({
              apiKey,
              companyId: 'company1', // In production, get this from backend response
              isAuthenticated: true,
            });
          } else {
            // API key is invalid
            set({
              apiKey: null,
              companyId: null,
              isAuthenticated: false,
            });
            throw new Error('Invalid API key');
          }
        } catch (error) {
          set({
            apiKey: null,
            companyId: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      clearApiKey: () => {
        set({
          apiKey: null,
          companyId: null,
          isAuthenticated: false,
        });
      },

      validateApiKey: async () => {
        const { apiKey } = get();
        if (!apiKey) return false;

        try {
          // Test the API key by making a simple request
          const response = await fetch('/api/campaigns?limit=1', {
            headers: {
              'X-API-Key': apiKey,
            },
          });

          if (response.ok) {
            return true;
          } else {
            get().clearApiKey();
            return false;
          }
        } catch (error) {
          console.error('Error validating API key:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);