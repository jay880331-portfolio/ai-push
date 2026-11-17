import { CustomerApp, ICustomerAppDocument } from '@/models/CustomerApp';
import { ICustomerApp } from '@/types';

export class CustomerAppRepository {
  async createApp(appData: Omit<ICustomerApp, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICustomerApp> {
    const app = new CustomerApp(appData);
    const savedApp = await app.save();
    return savedApp.toObject();
  }

  async getAppById(appId: string): Promise<ICustomerApp | null> {
    const app = await CustomerApp.findById(appId);
    return app ? app.toObject() : null;
  }

  async getAppsByCompanyId(companyId: string): Promise<ICustomerApp[]> {
    const apps = await CustomerApp
      .find({ companyId, isActive: true })
      .sort({ createdAt: -1 });
    return apps.map(app => app.toObject());
  }

  async getAppByPackageName(companyId: string, packageName: string): Promise<ICustomerApp | null> {
    const app = await CustomerApp.findOne({ companyId, packageName, isActive: true });
    return app ? app.toObject() : null;
  }

  async updateApp(appId: string, updates: Partial<ICustomerApp>): Promise<ICustomerApp | null> {
    const app = await CustomerApp.findByIdAndUpdate(
      appId,
      updates,
      { new: true }
    );
    return app ? app.toObject() : null;
  }

  async deactivateApp(appId: string): Promise<ICustomerApp | null> {
    const app = await CustomerApp.findByIdAndUpdate(
      appId,
      { isActive: false },
      { new: true }
    );
    return app ? app.toObject() : null;
  }

  async getAllActiveApps(): Promise<ICustomerApp[]> {
    const apps = await CustomerApp.find({ isActive: true });
    return apps.map(app => app.toObject());
  }
}