import OpenAI from 'openai';
import { CampaignPromptRequest, CampaignPromptResponse } from '@/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY && process.env.NODE_ENV !== 'production') {
  console.warn('Please define the OPENAI_API_KEY environment variable inside .env.local');
}

const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
}) : null;

const SYSTEM_PROMPT = `You are an AI assistant specialized in creating effective push notification campaigns for Korean users.

CRITICAL RULES:
1. ALL content must be in KOREAN language
2. Use actual user data for targeting when available
3. Create realistic, actionable campaigns

REQUIRED JSON response format:
{
  "title": "한국어 제목 (최대 50자)",
  "message": "한국어 메시지 (최대 150자)", 
  "target": {
    "platform": "all" or "ios" or "android",
    "lastLoginDays": number or null,
    "userTags": ["tag1", "tag2"] or null
  },
  "sendAt": "ISO date string (within next 30 minutes)",
  "landingUrl": "URL or null"
}

Best practices:
- Use natural Korean expressions
- Create urgency when appropriate  
- Keep messages concise and friendly
- Set sendAt within 30 minutes from now
- Use familiar tone (반말/존댓말 appropriate)

Always respond with valid JSON only, all text in Korean.`;

export async function generateCampaignFromPrompt(
  request: CampaignPromptRequest
): Promise<CampaignPromptResponse> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // 실제 사용자 데이터를 가져와서 컨텍스트에 포함
    let userDataContext = '';
    try {
      // 간단한 사용자 통계 정보 제공 (실제 DB 쿼리는 향후 개선)
      userDataContext = `
Available user segments:
- 총 등록된 사용자: 등록된 테스트 토큰 기준
- 플랫폼: iOS, Android, 웹
- 사용자 태그: test, demo, new_user, premium 등
- 최근 로그인: 1일, 7일, 30일 이내 등
`;
    } catch (err) {
      console.log('Could not fetch user data, using default context');
    }

    const userPrompt = `
회사 ID: ${request.companyId}
마케팅 요청: ${request.prompt}
${request.context ? `추가 컨텍스트: ${JSON.stringify(request.context)}` : ''}
${userDataContext}

이 요청을 바탕으로 한국어 푸시 알림 캠페인을 생성해주세요.
현재 시간: ${new Date().toISOString()}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI raw response:', content);

    let response: CampaignPromptResponse;
    try {
      response = JSON.parse(content) as CampaignPromptResponse;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
    
    // Validate required fields
    if (!response.title || !response.message || !response.sendAt) {
      console.error('Missing required fields:', response);
      throw new Error('Invalid response format from OpenAI - missing required fields');
    }

    // Ensure sendAt is a valid date
    const sendAtDate = new Date(response.sendAt);
    if (isNaN(sendAtDate.getTime())) {
      // Fallback: set to 30 minutes from now
      response.sendAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }

    // Ensure target exists
    if (!response.target) {
      response.target = {
        platform: 'all'
      };
    }

    return response;
  } catch (error) {
    console.error('Error generating campaign from prompt:', error);
    throw new Error('Failed to generate campaign from prompt');
  }
}

export async function analyzeCampaignPerformance(
  campaignData: any
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in analyzing push notification campaign performance.'
        },
        {
          role: 'user',
          content: `Analyze this campaign performance data and provide insights: ${JSON.stringify(campaignData)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    return completion.choices[0].message.content || 'No analysis available';
  } catch (error) {
    console.error('Error analyzing campaign performance:', error);
    throw new Error('Failed to analyze campaign performance');
  }
}