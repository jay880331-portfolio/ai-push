import { User, IUserDocument } from '@/models/User';
import { IUser } from '@/types';

export class UserRepository {
  async upsertUser(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { 
        companyId: userData.companyId, 
        userIdInClientApp: userData.userIdInClientApp 
      },
      {
        ...userData,
        lastLogin: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );
    return user.toObject();
  }

  async getUsersByCompanyId(companyId: string, filters?: {
    platform?: 'ios' | 'android' | 'all';
    isActive?: boolean;
    lastLoginDays?: number;
    userIds?: string[];
    tags?: string[];
    appIds?: string[];              // Filter by specific apps
    appId?: string;                 // Filter by single app
  }): Promise<IUser[]> {
    let query: any = { companyId };

    if (filters) {
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      if (filters.platform && filters.platform !== 'all') {
        query.platform = filters.platform;
      }

      if (filters.lastLoginDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.lastLoginDays);
        query.lastLogin = { $gte: cutoffDate };
      }

      if (filters.userIds && filters.userIds.length > 0) {
        query.userIdInClientApp = { $in: filters.userIds };
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      if (filters.appId) {
        query.appId = filters.appId;
      }

      if (filters.appIds && filters.appIds.length > 0) {
        query.appId = { $in: filters.appIds };
      }
    }

    const users = await User.find(query);
    return users.map(u => u.toObject());
  }

  async getUserByUserIdInClientApp(companyId: string, userIdInClientApp: string): Promise<IUser | null> {
    const user = await User.findOne({ companyId, userIdInClientApp });
    return user ? user.toObject() : null;
  }

  async updateUserPushToken(companyId: string, userIdInClientApp: string, pushToken: string): Promise<IUser | null> {
    const user = await User.findOneAndUpdate(
      { companyId, userIdInClientApp },
      { pushToken },
      { new: true }
    );
    return user ? user.toObject() : null;
  }

  async deactivateUser(companyId: string, userIdInClientApp: string): Promise<IUser | null> {
    const user = await User.findOneAndUpdate(
      { companyId, userIdInClientApp },
      { isActive: false },
      { new: true }
    );
    return user ? user.toObject() : null;
  }
}