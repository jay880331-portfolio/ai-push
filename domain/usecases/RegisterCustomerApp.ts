import { CustomerAppRepository } from '@/data/repositories/CustomerAppRepository';
import { ICustomerApp, IAppConfig } from '@/types';

export class RegisterCustomerAppUseCase {
  private customerAppRepository: CustomerAppRepository;

  constructor() {
    this.customerAppRepository = new CustomerAppRepository();
  }

  async execute(appConfig: IAppConfig): Promise<ICustomerApp> {
    try {
      // Check if app with same package name already exists for this company
      const existingApp = await this.customerAppRepository.getAppByPackageName(
        appConfig.companyId,
        appConfig.packageName
      );

      if (existingApp) {
        throw new Error(`App with package name ${appConfig.packageName} already exists`);
      }

      // Generate Firebase App ID (in real implementation, this would register with Firebase)
      const firebaseAppId = this.generateFirebaseAppId(appConfig);

      const appData: Omit<ICustomerApp, '_id' | 'createdAt' | 'updatedAt'> = {
        companyId: appConfig.companyId,
        appName: appConfig.appName,
        packageName: appConfig.packageName,
        platform: appConfig.platform,
        firebaseAppId,
        isActive: true,
      };

      const customerApp = await this.customerAppRepository.createApp(appData);

      return customerApp;
    } catch (error) {
      console.error('Error registering customer app:', error);
      throw new Error('Failed to register customer app');
    }
  }

  private generateFirebaseAppId(appConfig: IAppConfig): string {
    // In production, this would call Firebase Admin SDK to register the app
    // For now, generate a unique ID based on package name and timestamp
    const timestamp = Date.now();
    const cleanPackageName = appConfig.packageName.replace(/\./g, '');
    const platformPrefix = appConfig.platform === 'ios' ? 'ios' : 'android';
    
    return `1:123456789:${platformPrefix}:${cleanPackageName}${timestamp}`;
  }
}

export class GetCustomerAppsUseCase {
  private customerAppRepository: CustomerAppRepository;

  constructor() {
    this.customerAppRepository = new CustomerAppRepository();
  }

  async execute(companyId: string): Promise<ICustomerApp[]> {
    try {
      const apps = await this.customerAppRepository.getAppsByCompanyId(companyId);
      return apps;
    } catch (error) {
      console.error('Error getting customer apps:', error);
      throw new Error('Failed to get customer apps');
    }
  }
}