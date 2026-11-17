'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MultiChannelCampaignCreatorProps {
  companyId?: string;
  onCampaignCreate?: (campaign: any) => void;
}

interface CampaignData {
  title: string;
  message: string;
  campaignType: 'promotional' | 'transactional' | 'retention' | 'welcome' | 'abandoned_cart' | 'default';
  channels: string[];
  targetUsers: {
    tags: string[];
    attributes: Record<string, any>;
  };
  webPushOptions: {
    icon: string;
    url: string;
  };
  optimizeChannels: boolean;
}

export default function MultiChannelCampaignCreator({ 
  companyId, 
  onCampaignCreate 
}: MultiChannelCampaignCreatorProps) {
  const [campaign, setCampaign] = useState<CampaignData>({
    title: '',
    message: '',
    campaignType: 'default',
    channels: ['mobile'],
    targetUsers: {
      tags: [],
      attributes: {}
    },
    webPushOptions: {
      icon: '/logo.svg',
      url: ''
    },
    optimizeChannels: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const campaignTypes = [
    { value: 'promotional', label: '🎯 프로모션', description: '할인, 이벤트 알림' },
    { value: 'transactional', label: '💳 거래', description: '주문 확인, 배송 알림' },
    { value: 'retention', label: '🔄 리텐션', description: '재방문 유도' },
    { value: 'welcome', label: '👋 환영', description: '신규 가입자 온보딩' },
    { value: 'abandoned_cart', label: '🛒 장바구니', description: '장바구니 이탈 방지' },
    { value: 'default', label: '📢 일반', description: '기본 알림' }
  ];

  const availableChannels = [
    { value: 'mobile', label: '📱 모바일 푸시', description: 'iOS/Android 앱 푸시' },
    { value: 'web', label: '🌐 웹 푸시', description: '브라우저 푸시 알림' },
    { value: 'email', label: '📧 이메일', description: '이메일 마케팅 (준비중)' }
  ];

  const handleChannelToggle = (channel: string) => {
    setCampaign(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign.title || !campaign.message || campaign.channels.length === 0) {
      alert('제목, 메시지, 최소 하나의 채널을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/campaigns/multi-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // API key authentication handled by session in production
        },
        body: JSON.stringify({
          ...campaign,
          appId: companyId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '캠페인 생성 실패');
      }

      setResult(data);
      onCampaignCreate?.(data);

      // 폼 초기화
      setCampaign({
        title: '',
        message: '',
        campaignType: 'default',
        channels: ['mobile'],
        targetUsers: { tags: [], attributes: {} },
        webPushOptions: { icon: '/logo.svg', url: '' },
        optimizeChannels: true
      });

    } catch (error) {
      console.error('캠페인 생성 오류:', error);
      alert(`캠페인 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          🚀 AI 멀티채널 캠페인 생성
          <span className="text-sm font-normal text-gray-800">
            (모바일 + 웹 + 이메일 통합)
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">제목</label>
              <input
                type="text"
                value={campaign.title}
                onChange={(e) => setCampaign(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                placeholder="예: 특가 세일 알림"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">캠페인 유형</label>
              <select
                value={campaign.campaignType}
                onChange={(e) => setCampaign(prev => ({ 
                  ...prev, 
                  campaignType: e.target.value as any 
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                {campaignTypes.map(type => (
                  <option key={type.value} value={type.value} className="text-gray-800">
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">메시지</label>
            <textarea
              value={campaign.message}
              onChange={(e) => setCampaign(prev => ({ ...prev, message: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 text-gray-800 placeholder-gray-500"
              placeholder="예: 🎉 오늘만 50% 할인! 놓치지 마세요!"
            />
          </div>

          {/* 채널 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">발송 채널</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableChannels.map(channel => (
                <div
                  key={channel.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    campaign.channels.includes(channel.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${channel.value === 'email' ? 'opacity-50' : ''}`}
                  onClick={() => channel.value !== 'email' && handleChannelToggle(channel.value)}
                >
                  <div className="font-medium text-gray-800">{channel.label}</div>
                  <div className="text-sm text-gray-800 mt-1">{channel.description}</div>
                  {channel.value === 'email' && (
                    <div className="text-xs text-orange-500 mt-2">준비중</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI 최적화 옵션 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={campaign.optimizeChannels}
                onChange={(e) => setCampaign(prev => ({ 
                  ...prev, 
                  optimizeChannels: e.target.checked 
                }))}
                className="w-5 h-5 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-800">🤖 AI 채널 최적화</div>
                <div className="text-sm text-gray-800">
                  사용자별로 가장 효과적인 채널을 AI가 자동 선택합니다
                </div>
              </div>
            </label>
          </div>

          {/* 웹 푸시 옵션 */}
          {campaign.channels.includes('web') && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">🌐 웹 푸시 옵션</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">아이콘 URL</label>
                  <input
                    type="text"
                    value={campaign.webPushOptions.icon}
                    onChange={(e) => setCampaign(prev => ({
                      ...prev,
                      webPushOptions: { ...prev.webPushOptions, icon: e.target.value }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                    placeholder="/logo.svg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">클릭 시 이동할 URL</label>
                  <input
                    type="text"
                    value={campaign.webPushOptions.url}
                    onChange={(e) => setCampaign(prev => ({
                      ...prev,
                      webPushOptions: { ...prev.webPushOptions, url: e.target.value }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                    placeholder="https://example.com/sale"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 타겟팅 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">🎯 타겟팅 (선택사항)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  onChange={(e) => setCampaign(prev => ({
                    ...prev,
                    targetUsers: { 
                      ...prev.targetUsers, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                  placeholder="premium, mobile_user, active"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">최소 구매금액</label>
                <input
                  type="number"
                  onChange={(e) => setCampaign(prev => ({
                    ...prev,
                    targetUsers: { 
                      ...prev.targetUsers, 
                      attributes: { 
                        ...prev.targetUsers.attributes, 
                        purchaseAmount: { $gte: parseInt(e.target.value) || 0 }
                      }
                    }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">📱 미리보기</h3>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-800">{campaign.title || '제목'}</div>
              <div className="text-gray-800 text-sm mt-1">
                {campaign.message || '메시지 내용'}
              </div>
              <div className="flex gap-2 mt-2">
                {campaign.channels.map(channel => (
                  <span key={channel} className="text-xs bg-blue-100 px-2 py-1 rounded text-gray-800">
                    {availableChannels.find(c => c.value === channel)?.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 전송 버튼 */}
          <button
            type="submit"
            disabled={isLoading || campaign.channels.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? '전송 중...' : '🚀 멀티채널 캠페인 시작'}
          </button>
        </form>

        {/* 결과 표시 */}
        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">✅ 캠페인 전송 완료!</h3>
            <div className="text-sm text-green-700">
              <p>총 대상자: {result.totalUsers}명</p>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  📱 모바일: {result.channelResults.mobile.sent}명 성공, {result.channelResults.mobile.failed}명 실패
                </div>
                <div>
                  🌐 웹 푸시: {result.channelResults.web.sent}명 성공, {result.channelResults.web.failed}명 실패
                </div>
                <div>
                  📧 이메일: {result.channelResults.email.sent}명 성공, {result.channelResults.email.failed}명 실패
                </div>
              </div>
              {result.aiOptimized && (
                <p className="mt-2 text-purple-700">🤖 AI가 사용자별 최적 채널을 선택했습니다</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}