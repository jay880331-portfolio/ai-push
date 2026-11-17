'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface TestPushSenderProps {
  appId: string;
  appName: string;
}

interface Campaign {
  _id: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function TestPushSender({ appId, appName }: TestPushSenderProps) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  
  const { apiKey } = useAuthStore();

  // 캠페인 목록 불러오기
  useEffect(() => {
    if (apiKey) {
      fetchCampaigns();
    }
  }, [apiKey]);

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const response = await fetch('/api/campaigns?limit=10', {
        headers: {
          'X-API-Key': apiKey!,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
        // 가장 최근 캠페인을 기본 선택
        if (data.campaigns && data.campaigns.length > 0) {
          setSelectedCampaignId(data.campaigns[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const sendTestPush = async () => {
    if (!apiKey || !selectedCampaignId) return;

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const selectedCampaign = campaigns.find(c => c._id === selectedCampaignId);
      
      const response = await fetch('/api/test/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          appId: appId,
          campaignId: selectedCampaignId,
          testMessage: selectedCampaign ? {
            title: selectedCampaign.title,
            message: selectedCampaign.message
          } : {
            title: `${appName} 테스트`,
            message: '안녕하세요! 이것은 테스트 푸시 알림입니다. 🚀'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '테스트 푸시 발송에 실패했습니다');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Expo Push 테스트 발송
  const sendExpoPush = async () => {
    if (!apiKey || !selectedCampaignId) return;

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/campaigns/send-expo-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          testMode: true // 테스트 모드로 모든 Expo 토큰 사용자에게 발송
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Expo Push 발송에 실패했습니다');
      }

      const data = await response.json();
      setResult({
        message: data.message,
        result: {
          successCount: data.results?.targetUserCount || 0,
          failureCount: 0
        },
        payload: {
          title: data.campaign?.title,
          message: data.campaign?.message
        },
        expoResult: data.results
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-4">
      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <span className="text-xl mr-2">🚀</span>
        AI 캠페인 테스트 발송
      </h4>
      
      <p className="text-sm text-gray-600 mb-4">
        생성된 AI 캠페인을 선택하여 등록된 테스트 토큰으로 실제 발송을 테스트해보세요.
      </p>

      {/* 캠페인 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          테스트할 캠페인 선택
        </label>
        {loadingCampaigns ? (
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            캠페인 로딩 중...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-700 flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              아직 생성된 캠페인이 없습니다. 먼저 AI 캠페인을 생성해주세요.
            </p>
          </div>
        ) : (
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
          >
            {campaigns.map((campaign) => (
              <option key={campaign._id} value={campaign._id}>
                {campaign.title} - {new Date(campaign.createdAt).toLocaleString()}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 선택된 캠페인 미리보기 */}
      {selectedCampaignId && campaigns.length > 0 && (
        <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-600 mb-2">발송될 메시지 미리보기:</p>
          {(() => {
            const selectedCampaign = campaigns.find(c => c._id === selectedCampaignId);
            return selectedCampaign ? (
              <div className="space-y-1">
                <p className="font-medium text-gray-900">📝 {selectedCampaign.title}</p>
                <p className="text-gray-700 text-sm">💬 {selectedCampaign.message}</p>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 flex items-center">
          <span className="text-lg mr-2">❌</span>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-4">
          <h5 className="font-semibold mb-2 flex items-center">
            <span className="text-lg mr-2">✅</span>
            테스트 결과
          </h5>
          <div className="text-sm space-y-1">
            <p><strong>상태:</strong> {result.message}</p>
            <p><strong>성공 수:</strong> {result.result?.successCount || 0}</p>
            <p><strong>실패 수:</strong> {result.result?.failureCount || 0}</p>
            {result.payload && (
              <div className="mt-2">
                <p><strong>발송된 메시지:</strong></p>
                <div className="bg-white border rounded p-2 mt-1 font-mono text-xs">
                  <p><strong>제목:</strong> {result.payload.title}</p>
                  <p><strong>내용:</strong> {result.payload.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={sendTestPush}
          disabled={sending || !selectedCampaignId || campaigns.length === 0}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          {sending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              발송 중...
            </>
          ) : (
            <>
              <span>🚀</span>
              {campaigns.length === 0 ? '캠페인을 먼저 생성하세요' : 'FCM 테스트 발송'}
            </>
          )}
        </button>

        <button
          onClick={sendExpoPush}
          disabled={sending || !selectedCampaignId || campaigns.length === 0}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          {sending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              발송 중...
            </>
          ) : (
            <>
              <span>📱</span>
              {campaigns.length === 0 ? '캠페인을 먼저 생성하세요' : 'Expo Push 발송'}
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>참고:</strong> 이 기능은 시스템의 푸시 발송 로직을 테스트합니다. 
          실제 디바이스에서 알림을 받으려면 해당 앱이 설치되어 있어야 합니다.
        </p>
      </div>
    </div>
  );
}