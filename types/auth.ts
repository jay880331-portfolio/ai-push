export interface ApiKeyConfig {
  companyId: string;
  apiKey: string;
  name: string;
  isActive: boolean;
}

export interface AuthContext {
  companyId: string;
  apiKey: string;
}