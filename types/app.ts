export interface ICustomerApp {
  _id?: string | any;
  companyId: string;
  appName: string;
  packageName: string;           // com.company.app
  platform: 'android' | 'ios' | 'both' | 'web';
  firebaseAppId?: string;        // Firebase 앱 ID (자동 생성)
  isActive: boolean;
  apiKey?: string;              // API 키 for web platform
  vapidKeys?: {                 // Web Push VAPID Keys
    publicKey: string;
    privateKey: string;
    email: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAppConfig {
  companyId: string;
  appName: string;
  packageName: string;
  platform: 'android' | 'ios' | 'both';
}

export interface IFirebaseConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}