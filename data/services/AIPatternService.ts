import { eventRepository } from '@/data/repositories/EventRepository';
import { subDays, startOfDay } from 'date-fns';

export interface PatternRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  excludeEvent?: string;
  timeWindow: number; // days
  minimumUsers: number;
  messageTemplate: string;
  expectedImpact: string;
  category: 'retention' | 'conversion' | 'engagement';
}

export interface AIRecommendation {
  id: string;
  rule: PatternRule;
  targetUserCount: number;
  confidence: number; // 0-100
  generatedMessage: string;
  reasoning: string;
  createdAt: Date;
}

export class AIPatternService {
  
  // 미리 정의된 패턴 규칙들
  private patterns: PatternRule[] = [
    {
      id: 'purchase_no_review',
      name: '구매 후 리뷰 미작성',
      description: '상품을 구매했지만 리뷰를 작성하지 않은 사용자들',
      triggerEvent: 'purchase_completed',
      excludeEvent: 'review_submitted',
      timeWindow: 30, // 테스트용으로 30일로 확장
      minimumUsers: 1,
      messageTemplate: '구매하신 {product_name}은 어떠셨나요? 리뷰를 남겨주시면 포인트를 드려요! ⭐',
      expectedImpact: '리뷰 작성률 15-25% 증가 예상',
      category: 'conversion'
    },
    {
      id: 'cart_abandonment',
      name: '장바구니 이탈',
      description: '장바구니에 상품을 담았지만 구매하지 않은 사용자들',
      triggerEvent: 'add_to_cart',
      excludeEvent: 'purchase_completed',
      timeWindow: 30, // 테스트용으로 30일로 확장
      minimumUsers: 1,
      messageTemplate: '장바구니에 담아둔 {product_name}이 기다리고 있어요! 지금 구매하면 할인혜택까지 🛒',
      expectedImpact: '구매 전환율 8-15% 증가 예상',
      category: 'conversion'
    },
    {
      id: 'inactive_users',
      name: '장기 미접속자',
      description: '오랫동안 앱을 사용하지 않은 사용자들',
      triggerEvent: 'app_opened',
      timeWindow: 30, // 테스트용으로 30일로 확장
      minimumUsers: 1,
      messageTemplate: '오랜만이에요! 새로운 상품과 특별 할인이 준비되어 있어요 📱',
      expectedImpact: '재접속률 5-12% 증가 예상',
      category: 'retention'
    },
    {
      id: 'first_purchase_encourage',
      name: '첫 구매 유도',
      description: '앱을 사용하지만 아직 구매하지 않은 신규 사용자들',
      triggerEvent: 'app_opened',
      excludeEvent: 'purchase_completed',
      timeWindow: 30, // 테스트용으로 30일로 확장
      minimumUsers: 1,
      messageTemplate: '첫 구매 고객님만을 위한 특별 할인! 지금 바로 확인해보세요 🎁',
      expectedImpact: '첫 구매 전환율 10-20% 증가 예상',
      category: 'conversion'
    },
    {
      id: 'product_view_no_action',
      name: '상품 조회 후 무반응',
      description: '상품을 조회했지만 장바구니나 구매 액션이 없는 사용자들',
      triggerEvent: 'product_viewed',
      excludeEvent: 'add_to_cart',
      timeWindow: 30, // 테스트용으로 30일로 확장
      minimumUsers: 1,
      messageTemplate: '관심있게 보신 {product_name}에 특별 할인이 적용되었어요! 👀',
      expectedImpact: '장바구니 추가율 12-18% 증가 예상',
      category: 'engagement'
    }
  ];

  // AI 패턴 분석 실행
  async analyzePatterns(companyId: string, appId?: string): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    for (const pattern of this.patterns) {
      try {
        const recommendation = await this.analyzePattern(pattern, companyId, appId);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      } catch (error) {
        console.error(`❌ Pattern analysis failed for ${pattern.name}:`, error);
      }
    }

    // 신뢰도 순으로 정렬
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // 개별 패턴 분석
  private async analyzePattern(
    pattern: PatternRule, 
    companyId: string, 
    appId?: string
  ): Promise<AIRecommendation | null> {
    
    console.log(`🔍 패턴 분석 시작: ${pattern.name}`, {
      triggerEvent: pattern.triggerEvent,
      excludeEvent: pattern.excludeEvent,
      timeWindow: pattern.timeWindow,
      minimumUsers: pattern.minimumUsers
    });
    
    let targetUsers: string[] = [];

    if (pattern.excludeEvent) {
      // 특정 이벤트는 했지만 다른 이벤트는 안 한 사용자들
      targetUsers = await eventRepository.findUsersWithoutEvent(
        companyId,
        pattern.triggerEvent,
        pattern.excludeEvent,
        pattern.timeWindow,
        appId
      );
      
      console.log(`📊 ${pattern.name} 결과:`, {
        triggerEvent: pattern.triggerEvent,
        excludeEvent: pattern.excludeEvent,
        foundUsers: targetUsers.length,
        users: targetUsers
      });
    } else {
      // 특정 기간 동안 특정 이벤트를 안 한 사용자들 (비활성 사용자)
      const activeUsers = await eventRepository.findUsersWithEvent(
        companyId,
        pattern.triggerEvent,
        pattern.timeWindow,
        appId
      );
      
      // 이전 기간에는 활동했지만 최근에는 활동하지 않은 사용자들
      const previouslyActiveUsers = await eventRepository.findUsersWithEvent(
        companyId,
        pattern.triggerEvent,
        pattern.timeWindow * 2, // 2배 기간
        appId
      );
      
      targetUsers = previouslyActiveUsers.filter(userId => !activeUsers.includes(userId));
      
      console.log(`📊 ${pattern.name} 결과:`, {
        activeUsers: activeUsers.length,
        previouslyActiveUsers: previouslyActiveUsers.length,
        targetUsers: targetUsers.length,
        users: targetUsers
      });
    }

    // 최소 사용자 수 체크
    if (targetUsers.length < pattern.minimumUsers) {
      console.log(`❌ ${pattern.name}: 사용자 수 부족 (${targetUsers.length} < ${pattern.minimumUsers})`);
      return null;
    }

    // 신뢰도 계산 (사용자 수가 많을수록, 최근 패턴일수록 높음)
    const confidence = Math.min(100, Math.floor(
      (targetUsers.length / pattern.minimumUsers) * 20 + // 사용자 수 기반 점수
      60 // 기본 신뢰도
    ));

    // 개인화된 메시지 생성
    const generatedMessage = await this.generatePersonalizedMessage(
      pattern, 
      targetUsers.length,
      companyId
    );

    return {
      id: `${pattern.id}_${Date.now()}`,
      rule: pattern,
      targetUserCount: targetUsers.length,
      confidence,
      generatedMessage,
      reasoning: this.generateReasoning(pattern, targetUsers.length),
      createdAt: new Date()
    };
  }

  // 개인화된 메시지 생성
  private async generatePersonalizedMessage(
    pattern: PatternRule, 
    userCount: number,
    companyId: string
  ): Promise<string> {
    
    // 실제 상품명 정보 수집 (최근 이벤트에서)
    const productInfo = await this.getProductInfoFromEvents(pattern, companyId);
    
    // OpenAI API로 실제 AI 메시지 생성
    try {
      console.log(`🤖 OpenAI 메시지 생성 시작: ${pattern.name}`);
      const prompt = this.createMessagePrompt(pattern, userCount, productInfo);
      const aiMessage = await this.callOpenAI(prompt);
      
      if (aiMessage) {
        // AI 생성 메시지에서도 변수 치환
        const finalMessage = this.replaceVariables(aiMessage, productInfo);
        console.log(`✅ AI 메시지 생성 완료 (${pattern.name}):`, finalMessage);
        return finalMessage;
      } else {
        console.log(`❌ OpenAI 응답이 비어있음 (${pattern.name})`);
      }
    } catch (error) {
      console.log(`⚠️ AI 메시지 생성 실패, 템플릿 사용 (${pattern.name}):`, error);
    }
    
    // AI 실패 시 템플릿 기반 개인화 (폴백)
    const fallbackMessage = this.replaceVariables(pattern.messageTemplate, productInfo);
    return fallbackMessage;
  }

  // 이벤트에서 상품 정보 추출
  private async getProductInfoFromEvents(pattern: PatternRule, companyId: string): Promise<any> {
    try {
      // 기본값 반환 (향후 이벤트 데이터에서 실제 상품명 추출 가능)
      return {
        productName: '구매하신 상품',
        productCount: 1,
        category: '상품'
      };
    } catch (error) {
      console.log('상품 정보 추출 실패:', error);
      return {
        productName: '구매하신 상품',
        productCount: 0,
        category: '상품'
      };
    }
  }

  // 변수 치환 함수
  private replaceVariables(message: string, productInfo: any): string {
    // 시간대별 개인화
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? '좋은 아침이에요!' : 
                        hour < 18 ? '좋은 오후에요!' : '좋은 저녁이에요!';
    
    // 사용자 수에 따른 긴급성 조절
    const urgency = productInfo.productCount > 100 ? '많은 분들이 기다리고 계세요' :
                   productInfo.productCount > 50 ? '놓치면 후회할 기회예요' :
                   '특별한 혜택을 준비했어요';

    // 모든 변수 치환
    return message
      .replace(/{product_name}/g, productInfo.productName)
      .replace(/{time_greeting}/g, timeGreeting)
      .replace(/{urgency}/g, urgency)
      .replace(/{category}/g, productInfo.category);
  }

  // OpenAI 프롬프트 생성
  private createMessagePrompt(pattern: PatternRule, userCount: number, productInfo?: any): string {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? '오전' : hour < 18 ? '오후' : '저녁';
    
    return `
당신은 전문 마케팅 카피라이터입니다. 다음 사용자 행동 패턴에 기반하여 효과적인 푸시 알림 메시지를 작성해주세요.

**패턴 정보:**
- 패턴명: ${pattern.name}
- 설명: ${pattern.description}
- 타겟 사용자 수: ${userCount}명
- 현재 시간대: ${timeOfDay}
- 기대 효과: ${pattern.expectedImpact}
- 상품 정보: ${productInfo?.productName || '상품'}

**메시지 요구사항:**
1. 20-35자 내외의 간결한 메시지
2. 사용자의 행동을 자연스럽게 언급
3. 명확한 액션 유도 (CTA)
4. 친근하고 부담스럽지 않은 톤
5. 이모지 1-2개 포함
6. 긴급성이나 혜택을 자연스럽게 표현
7. 구체적인 상품명 대신 '구매하신 상품', '선택하신 아이템' 등 일반적 표현 사용

**참고 템플릿:** ${pattern.messageTemplate}

위 요구사항을 바탕으로 ${userCount}명의 사용자에게 전송할 효과적인 푸시 메시지를 한국어로 작성해주세요. 메시지만 답변하세요.
`.trim();
  }

  // OpenAI API 호출
  private async callOpenAI(prompt: string): Promise<string | null> {
    try {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      
      if (!OPENAI_API_KEY) {
        console.log('⚠️ OPENAI_API_KEY 환경변수가 설정되지 않음');
        return null;
      }

      console.log('🔑 OpenAI API 키 확인됨, API 호출 시작...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      console.log('📡 OpenAI API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API 오류 상세:', errorText);
        throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content?.trim();
      
      console.log('📝 OpenAI 원본 응답:', message);
      
      return message || null;
    } catch (error) {
      console.error('❌ OpenAI API 호출 실패:', error);
      return null;
    }
  }

  // 추천 이유 생성
  private generateReasoning(pattern: PatternRule, userCount: number): string {
    const timeText = pattern.timeWindow === 1 ? '하루' :
                    pattern.timeWindow < 7 ? `${pattern.timeWindow}일` :
                    `${Math.floor(pattern.timeWindow / 7)}주`;

    if (pattern.excludeEvent) {
      return `최근 ${timeText} 동안 ${pattern.triggerEvent}를 했지만 ${pattern.excludeEvent}를 하지 않은 ${userCount}명의 사용자를 발견했습니다. 이들에게 적절한 리마인더를 보내면 ${pattern.expectedImpact}`;
    } else {
      return `최근 ${timeText} 동안 ${pattern.triggerEvent} 활동이 없는 ${userCount}명의 비활성 사용자를 발견했습니다. 재활성화 메시지로 ${pattern.expectedImpact}`;
    }
  }

  // 특정 패턴의 타겟 사용자 조회
  async getPatternTargetUsers(
    patternId: string, 
    companyId: string, 
    appId?: string
  ): Promise<string[]> {
    const pattern = this.patterns.find(p => p.id === patternId);
    if (!pattern) {
      throw new Error('Pattern not found');
    }

    if (pattern.excludeEvent) {
      return await eventRepository.findUsersWithoutEvent(
        companyId,
        pattern.triggerEvent,
        pattern.excludeEvent,
        pattern.timeWindow,
        appId
      );
    } else {
      const activeUsers = await eventRepository.findUsersWithEvent(
        companyId,
        pattern.triggerEvent,
        pattern.timeWindow,
        appId
      );
      
      const previouslyActiveUsers = await eventRepository.findUsersWithEvent(
        companyId,
        pattern.triggerEvent,
        pattern.timeWindow * 2,
        appId
      );
      
      return previouslyActiveUsers.filter(userId => !activeUsers.includes(userId));
    }
  }
}

export const aiPatternService = new AIPatternService();