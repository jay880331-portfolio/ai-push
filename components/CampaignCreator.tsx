'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useAppStore } from '@/stores/appStore';

export default function CampaignCreator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  
  const { apiKey } = useAuthStore();
  const { addCampaign } = useCampaignStore();
  const { apps, fetchApps } = useAppStore();

  useEffect(() => {
    if (apiKey && apps.length === 0) {
      fetchApps(apiKey);
    }
  }, [apiKey, apps.length, fetchApps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !apiKey) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Campaign creation error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create campaign`);
      }

      const data = await response.json();
      setPreviewData(data.campaign);
      addCampaign(data.campaign);
      setPrompt('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🤖</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI 캠페인 생성</h2>
            <p className="text-sm text-gray-600 mt-1">자연어로 지능적인 푸시 캠페인을 만들어보세요</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {apps.length > 0 && (
            <div>
              <label htmlFor="appSelect" className="block text-sm font-semibold text-gray-800 mb-2">
                대상 앱 (선택사항)
              </label>
              <select
                id="appSelect"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                disabled={loading}
              >
                <option value="">모든 앱</option>
                {apps.map((app) => (
                  <option key={app._id} value={app._id}>
                    {app.appName} ({app.packageName})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <span className="mr-1">💡</span>
                특정 앱을 선택하거나 비워두면 모든 앱에 발송됩니다
              </p>
            </div>
          )}

          <div>
            <label htmlFor="prompt" className="block text-sm font-semibold text-gray-800 mb-3">
              캠페인 설명
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-gray-900 placeholder-gray-500"
              rows={4}
              placeholder="예: 새로 가입한 사용자들에게 환영 메시지를 보내주세요"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <span className="mr-1">✨</span>
              AI가 자동으로 제목, 내용, 타겟팅을 생성해드립니다
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center">
              <span className="text-xl mr-3">❌</span>
              <div>
                <p className="font-medium">오류</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                AI 캠페인 생성 중...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-2">🚀</span>
                AI 캠페인 생성하기
              </div>
            )}
          </button>
        </form>
      </div>

      {previewData && (
        <div className="mx-6 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
              <span className="text-xl mr-2">🎯</span>
              생성된 캠페인 미리보기
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <span className="text-sm font-semibold text-gray-600 block mb-2">📝 제목</span>
                <p className="text-gray-900 font-medium">{previewData.title}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <span className="text-sm font-semibold text-gray-600 block mb-2">💬 메시지</span>
                <p className="text-gray-900">{previewData.message}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <span className="text-sm font-semibold text-gray-600 block mb-2">🎯 타겟</span>
                <p className="text-gray-900">
                  플랫폼: {previewData.target.platform === 'both' ? '모든 플랫폼' : 
                          previewData.target.platform === 'android' ? 'Android' : 
                          previewData.target.platform === 'ios' ? 'iOS' : '모든 플랫폼'}
                  {previewData.target.lastLoginDays && `, 최근 로그인: ${previewData.target.lastLoginDays}일 이내`}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <span className="text-sm font-semibold text-gray-600 block mb-2">⏰ 발송 예정일</span>
                <p className="text-gray-900">{formatDate(previewData.sendAt)}</p>
              </div>
              
              {previewData.landingUrl && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                  <span className="text-sm font-semibold text-gray-600 block mb-2">🔗 랜딩 URL</span>
                  <p className="text-gray-900 break-all font-mono text-sm bg-gray-50 p-2 rounded">{previewData.landingUrl}</p>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <span className="text-sm font-semibold text-gray-600 block mb-2">📊 상태</span>
                <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full ${
                  previewData.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  previewData.status === 'sent' ? 'bg-green-100 text-green-800' :
                  previewData.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {previewData.status === 'scheduled' ? '📅 예약됨' :
                   previewData.status === 'sent' ? '✅ 발송됨' :
                   previewData.status === 'failed' ? '❌ 실패' : previewData.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center">
                <span className="text-lg mr-2">🎉</span>
                <strong>성공!</strong> AI가 자동으로 캠페인을 생성했습니다. 예약된 시간에 자동 발송됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}