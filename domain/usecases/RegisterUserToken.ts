import { UserRepository } from '@/data/repositories/UserRepository';
import { IUser } from '@/types';
import { expoPushService } from '@/lib/expoPush';

export interface RegisterUserTokenInput {
  companyId: string;
  appId?: string;                    // Optional: which app this user belongs to
  userIdInClientApp: string;
  pushToken: string;
  platform: 'ios' | 'android';
  customAttributes?: Record<string, any>;
  tags?: string[];
  // Phase 1: 새로운 구조화된 속성
  attributes?: {
    age?: number;
    gender?: 'M' | 'F' | 'Other';
    region?: string;
    purchaseAmount?: number;
    membershipTier?: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  };
}

export class RegisterUserTokenUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(input: RegisterUserTokenInput): Promise<IUser> {
    try {
      // 토큰 타입 자동 감지
      const tokenType = expoPushService.isValidExpoPushToken(input.pushToken) ? 'expo' : 'fcm';
      
      const userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'> = {
        companyId: input.companyId,
        appId: input.appId,
        userIdInClientApp: input.userIdInClientApp,
        pushToken: input.pushToken,
        tokenType,
        platform: input.platform,
        lastLogin: new Date(),
        lastActiveAt: new Date(),
        customAttributes: input.customAttributes,
        tags: input.tags,
        attributes: input.attributes,
        isActive: true,
      };

      const user = await this.userRepository.upsertUser(userData);
      return user;
    } catch (error) {
      console.error('Error registering user token:', error);
      throw new Error('Failed to register user token');
    }
  }
}