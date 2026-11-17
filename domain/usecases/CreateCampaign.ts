import { CampaignRepository } from '@/data/repositories/CampaignRepository';
import { UserRepository } from '@/data/repositories/UserRepository';
import { generateCampaignFromPrompt } from '@/lib/openai';
import { ICampaign, CampaignPromptRequest } from '@/types';

export class CreateCampaignUseCase {
  private campaignRepository: CampaignRepository;
  private userRepository: UserRepository;

  constructor() {
    this.campaignRepository = new CampaignRepository();
    this.userRepository = new UserRepository();
  }

  async execute(prompt: string, companyId: string): Promise<ICampaign> {
    try {
      // 실제 사용자 데이터 조회
      const users = await this.userRepository.getUsersByCompanyId(companyId);
      const userStats = {
        totalUsers: users.length,
        platforms: users.map(u => u.platform).filter(Boolean),
        tags: users.flatMap(u => u.tags || []),
        lastActiveCount: users.filter(u => {
          if (!u.lastActiveAt) return false;
          const daysSinceActive = (Date.now() - new Date(u.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceActive <= 7;
        }).length
      };

      // Generate campaign content using AI with real data
      const promptRequest: CampaignPromptRequest = {
        prompt,
        companyId,
        context: {
          userStats,
          availableUsers: users.map(u => ({
            id: u.userIdInClientApp,
            platform: u.platform,
            tags: u.tags,
            lastActive: u.lastActiveAt
          }))
        }
      };

      const aiResponse = await generateCampaignFromPrompt(promptRequest);

      // 실제 등록된 사용자 중에서 타겟 선별
      let targetUserIds: string[] = [];
      if (aiResponse.target.userTags && aiResponse.target.userTags.length > 0) {
        // AI가 제안한 태그를 가진 사용자들 선별
        targetUserIds = users
          .filter(user => 
            user.tags && 
            user.tags.some(tag => aiResponse.target.userTags!.includes(tag))
          )
          .map(user => user.userIdInClientApp);
      } else {
        // 태그가 없으면 모든 사용자를 타겟으로
        targetUserIds = users.map(user => user.userIdInClientApp);
      }

      // Create campaign object
      const campaignData: Omit<ICampaign, '_id' | 'createdAt' | 'updatedAt'> = {
        companyId,
        title: aiResponse.title,
        message: aiResponse.message,
        target: {
          platform: aiResponse.target.platform || 'all',
          lastLoginDays: aiResponse.target.lastLoginDays,
          userIds: targetUserIds, // 실제 등록된 사용자 ID들
        },
        sendAt: new Date(aiResponse.sendAt),
        landingUrl: aiResponse.landingUrl,
        status: 'scheduled',
        sentCount: 0,
        clickedCount: 0,
        metadata: {
          prompt,
          aiGeneratedAt: new Date(),
          userStats,
          targetedUserCount: targetUserIds.length
        },
      };

      // Save to database
      const campaign = await this.campaignRepository.createCampaign(campaignData);

      return campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }
}