import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';

// Expo Push 서비스 클래스
export class ExpoPushService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  /**
   * 토큰이 유효한 Expo Push Token인지 확인
   */
  isValidExpoPushToken(pushToken: string): boolean {
    return Expo.isExpoPushToken(pushToken);
  }

  /**
   * 단일 메시지 발송
   */
  async sendSingleMessage(params: {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: 'default' | null;
    badge?: number;
  }): Promise<ExpoPushTicket[]> {
    const { to, title, body, data, sound = 'default', badge } = params;

    if (!this.isValidExpoPushToken(to)) {
      throw new Error(`Invalid Expo push token: ${to}`);
    }

    const message: ExpoPushMessage = {
      to,
      title,
      body,
      data: data || ({} as Record<string, unknown>),
      sound,
      badge,
    };

    try {
      const tickets = await this.expo.sendPushNotificationsAsync([message]);
      console.log('📤 Expo Push 발송 완료:', tickets);
      return tickets;
    } catch (error) {
      console.error('❌ Expo Push 발송 실패:', error);
      throw error;
    }
  }

  /**
   * 여러 메시지 배치 발송
   */
  async sendBatchMessages(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
    // 유효하지 않은 토큰 필터링
    const validMessages = messages.filter(message => 
      this.isValidExpoPushToken(message.to as string)
    );

    if (validMessages.length === 0) {
      throw new Error('No valid Expo push tokens found');
    }

    // 청크 단위로 나누어 발송 (Expo 권장사항)
    const chunks = this.expo.chunkPushNotifications(validMessages);
    const tickets: ExpoPushTicket[] = [];

    try {
      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      console.log(`📤 Expo Push 배치 발송 완료: ${validMessages.length}개 메시지`);
      return tickets;
    } catch (error) {
      console.error('❌ Expo Push 배치 발송 실패:', error);
      throw error;
    }
  }

  /**
   * 발송 결과 확인 (receipt 체크)
   */
  async checkReceipts(receiptIds: string[]): Promise<ExpoPushReceipt[]> {
    try {
      const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);
      const receipts: ExpoPushReceipt[] = [];

      for (const chunk of receiptIdChunks) {
        const receiptChunk = await this.expo.getPushNotificationReceiptsAsync(chunk);
        receipts.push(...Object.values(receiptChunk));
      }

      return receipts;
    } catch (error) {
      console.error('❌ Expo Push 결과 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 캠페인 스타일 메시지 생성
   */
  createCampaignMessage(params: {
    to: string;
    campaign: {
      title: string;
      message: string;
      landingUrl?: string;
    };
    campaignId?: string;
  }): ExpoPushMessage {
    const { to, campaign, campaignId } = params;

    return {
      to,
      title: campaign.title,
      body: campaign.message,
      data: {
        type: 'campaign',
        campaignId: campaignId || 'test',
        landingUrl: campaign.landingUrl,
        timestamp: new Date().toISOString(),
      },
      sound: 'default',
      badge: 1,
    };
  }
}

// 싱글톤 인스턴스 내보내기
export const expoPushService = new ExpoPushService();