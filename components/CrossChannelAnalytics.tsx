'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ChannelData {
  name: string;
  icon: string;
  color: string;
  sent: number;
  delivered: number;
  clicked: number;
  converted: number;
  cost: number;
}

interface CampaignData {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  channels: string[];
  stats: {
    totalSent: number;
    totalClicked: number;
    totalConverted: number;
    clickRate: number;
    conversionRate: number;
  };
}

interface CrossChannelAnalyticsProps {
  companyId?: string;
}

export default function CrossChannelAnalytics({ companyId }: CrossChannelAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7days');
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    avgClickRate: 0,
    avgConversionRate: 0,
    roi: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    // 실제로는 API에서 데이터를 가져와야 함
    // 여기서는 mock 데이터 사용
    
    const mockChannelData: ChannelData[] = [
      {
        name: '모바일 푸시',
        icon: '📱',
        color: 'bg-blue-500',
        sent: 15420,
        delivered: 14850,
        clicked: 1892,
        converted: 324,
        cost: 123.50
      },
      {
        name: '웹 푸시',
        icon: '🌐',
        color: 'bg-green-500',
        sent: 8930,
        delivered: 8456,
        clicked: 1067,
        converted: 189,
        cost: 67.20
      },
      {
        name: '이메일',
        icon: '📧',
        color: 'bg-purple-500',
        sent: 5240,
        delivered: 4987,
        clicked: 598,
        converted: 156,
        cost: 31.80
      }
    ];

    const mockCampaignData: CampaignData[] = [
      {
        id: '1',
        title: '신년 특가 세일',
        type: 'promotional',
        createdAt: '2024-01-15',
        channels: ['mobile', 'web'],
        stats: {
          totalSent: 12500,
          totalClicked: 1750,
          totalConverted: 280,
          clickRate: 14.0,
          conversionRate: 2.24
        }
      },
      {
        id: '2',
        title: '장바구니 이탈 알림',
        type: 'abandoned_cart',
        createdAt: '2024-01-14',
        channels: ['web', 'email'],
        stats: {
          totalSent: 3200,
          totalClicked: 640,
          totalConverted: 128,
          clickRate: 20.0,
          conversionRate: 4.0
        }
      },
      {
        id: '3',
        title: '신규 회원 환영',
        type: 'welcome',
        createdAt: '2024-01-13',
        channels: ['mobile', 'web', 'email'],
        stats: {
          totalSent: 890,
          totalClicked: 267,
          totalConverted: 45,
          clickRate: 30.0,
          conversionRate: 5.06
        }
      }
    ];

    setChannelData(mockChannelData);
    setCampaignData(mockCampaignData);
    
    // 총계 계산
    const totalSent = mockChannelData.reduce((sum, channel) => sum + channel.sent, 0);
    const totalClicked = mockChannelData.reduce((sum, channel) => sum + channel.clicked, 0);
    const totalConverted = mockChannelData.reduce((sum, channel) => sum + channel.converted, 0);
    const totalCost = mockChannelData.reduce((sum, channel) => sum + channel.cost, 0);
    
    setTotalStats({
      totalUsers: 24680,
      totalCampaigns: mockCampaignData.length,
      avgClickRate: (totalClicked / totalSent) * 100,
      avgConversionRate: (totalConverted / totalSent) * 100,
      roi: ((totalConverted * 50 - totalCost) / totalCost) * 100 // 가정: 전환당 $50 수익
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2)}`;
  };

  const getChannelIcon = (channel: string) => {
    const icons = {
      mobile: '📱',
      web: '🌐',
      email: '📧'
    };
    return icons[channel as keyof typeof icons] || '📢';
  };

  const getCampaignTypeColor = (type: string) => {
    const colors = {
      promotional: 'bg-red-100 text-red-800',
      transactional: 'bg-blue-100 text-blue-800',
      retention: 'bg-yellow-100 text-yellow-800',
      welcome: 'bg-green-100 text-green-800',
      abandoned_cart: 'bg-purple-100 text-purple-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📊 크로스 채널 분석</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
        >
          <option value="1day" className="text-gray-800">최근 1일</option>
          <option value="7days" className="text-gray-800">최근 7일</option>
          <option value="30days" className="text-gray-800">최근 30일</option>
          <option value="90days" className="text-gray-800">최근 3개월</option>
        </select>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(totalStats.totalUsers)}</div>
            <div className="text-sm text-gray-800">총 사용자</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{totalStats.totalCampaigns}</div>
            <div className="text-sm text-gray-800">실행된 캠페인</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{formatPercent(totalStats.avgClickRate)}</div>
            <div className="text-sm text-gray-800">평균 클릭률</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{formatPercent(totalStats.avgConversionRate)}</div>
            <div className="text-sm text-gray-800">평균 전환율</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{formatPercent(totalStats.roi)}</div>
            <div className="text-sm text-gray-800">ROI</div>
          </CardContent>
        </Card>
      </div>

      {/* 채널별 성과 비교 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800">📈 채널별 성과 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-800">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-800">채널</th>
                  <th className="text-right py-3 px-4 text-gray-800">발송</th>
                  <th className="text-right py-3 px-4 text-gray-800">전달</th>
                  <th className="text-right py-3 px-4 text-gray-800">클릭</th>
                  <th className="text-right py-3 px-4 text-gray-800">전환</th>
                  <th className="text-right py-3 px-4 text-gray-800">클릭률</th>
                  <th className="text-right py-3 px-4 text-gray-800">전환율</th>
                  <th className="text-right py-3 px-4 text-gray-800">비용</th>
                  <th className="text-right py-3 px-4 text-gray-800">CPC</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map((channel, index) => {
                  const clickRate = (channel.clicked / channel.sent) * 100;
                  const conversionRate = (channel.converted / channel.sent) * 100;
                  const cpc = channel.cost / channel.clicked;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{channel.icon}</span>
                          <span className="font-medium text-gray-800">{channel.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{formatNumber(channel.sent)}</td>
                      <td className="text-right py-3 px-4">{formatNumber(channel.delivered)}</td>
                      <td className="text-right py-3 px-4 font-medium text-blue-600">
                        {formatNumber(channel.clicked)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-green-600">
                        {formatNumber(channel.converted)}
                      </td>
                      <td className="text-right py-3 px-4">{formatPercent(clickRate)}</td>
                      <td className="text-right py-3 px-4">{formatPercent(conversionRate)}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(channel.cost)}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(cpc)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 채널별 시각적 비교 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channelData.map((channel, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <span className="text-xl">{channel.icon}</span>
                {channel.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-800">발송</span>
                  <span className="font-medium text-gray-800">{formatNumber(channel.sent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-800">클릭</span>
                  <span className="font-medium text-blue-600">{formatNumber(channel.clicked)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-800">전환</span>
                  <span className="font-medium text-green-600">{formatNumber(channel.converted)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm text-gray-800">
                    <span>클릭률</span>
                    <span className="font-medium text-gray-800">{formatPercent((channel.clicked / channel.sent) * 100)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${channel.color}`}
                      style={{ width: `${Math.min((channel.clicked / channel.sent) * 100 * 5, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 최근 캠페인 성과 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800">🚀 최근 캠페인 성과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaignData.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg text-gray-800">{campaign.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCampaignTypeColor(campaign.type)}`}>
                        {campaign.type}
                      </span>
                      <span className="text-sm text-gray-700">{campaign.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {campaign.channels.map(channel => (
                      <span key={channel} className="text-lg">
                        {getChannelIcon(channel)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-800">
                  <div>
                    <div className="text-gray-800">발송</div>
                    <div className="font-medium text-gray-800">{formatNumber(campaign.stats.totalSent)}</div>
                  </div>
                  <div>
                    <div className="text-gray-800">클릭</div>
                    <div className="font-medium text-blue-600">{formatNumber(campaign.stats.totalClicked)}</div>
                  </div>
                  <div>
                    <div className="text-gray-800">전환</div>
                    <div className="font-medium text-green-600">{formatNumber(campaign.stats.totalConverted)}</div>
                  </div>
                  <div>
                    <div className="text-gray-800">클릭률</div>
                    <div className="font-medium text-gray-800">{formatPercent(campaign.stats.clickRate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-800">전환율</div>
                    <div className="font-medium text-gray-800">{formatPercent(campaign.stats.conversionRate)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI 인사이트 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800">🤖 AI 분석 인사이트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="font-medium text-gray-800">채널 최적화 제안</div>
                  <div className="text-sm text-gray-800 mt-1">
                    웹 푸시의 전환율이 모바일 푸시보다 12% 높습니다. 
                    프로모션 캠페인에서 웹 푸시 비중을 늘리는 것을 권장합니다.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <div className="font-medium text-gray-800">성과 향상 팁</div>
                  <div className="text-sm text-gray-800 mt-1">
                    장바구니 이탈 캠페인의 ROI가 가장 높습니다 (340%). 
                    이 캠페인 유형을 더 자주 실행하면 전체 수익성이 개선될 것입니다.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="font-medium text-gray-800">타이밍 최적화</div>
                  <div className="text-sm text-gray-800 mt-1">
                    화요일 오후 2-4시에 발송한 캠페인의 클릭률이 평균보다 23% 높습니다. 
                    중요한 캠페인은 이 시간대를 활용해보세요.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}