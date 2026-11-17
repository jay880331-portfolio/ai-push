import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/auth';
import { sendMultiAppPushNotification } from '@/lib/firebaseMultiApp';

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await authenticateApiKey(request);
    const { campaignId, appId, testMessage } = await request.json();

    // 테스트용 푸시 발송 (실제로는 발송되지 않음)
    const testPayload = {
      appIds: [appId],
      title: testMessage?.title || '테스트 푸시',
      message: testMessage?.message || '이것은 테스트 메시지입니다.',
      data: {
        campaignId: campaignId || 'test-campaign',
        companyId: companyId,
        isTest: 'true'
      }
    };

    console.log('🧪 테스트 푸시 발송 시뮬레이션:', testPayload);

    // 실제 Firebase 발송은 주석 처리 (테스트용)
    // const result = await sendMultiAppPushNotification(testPayload);

    // 가짜 성공 응답
    const mockResult = {
      successCount: 1,
      failureCount: 0,
      responses: [
        {
          success: true,
          messageId: 'test-message-id-' + Date.now()
        }
      ]
    };

    return NextResponse.json({
      success: true,
      message: '테스트 푸시가 성공적으로 발송되었습니다 (시뮬레이션)',
      result: mockResult,
      payload: testPayload
    });

  } catch (error: any) {
    console.error('테스트 푸시 발송 오류:', error);
    return NextResponse.json(
      { error: error.message || '테스트 푸시 발송에 실패했습니다' },
      { status: 500 }
    );
  }
}