'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import CampaignList from '@/components/CampaignList';
import AppManager from '@/components/AppManager';
import AIRecommendations from '@/components/AIRecommendations';
import DemoSimulation from '@/components/DemoSimulation';
import Contact from '@/components/Contact';
import Logo from '@/components/Logo';
import MultiChannelCampaignCreator from '@/components/MultiChannelCampaignCreator';
import WebPushManager from '@/components/WebPushManager';
import CrossChannelAnalytics from '@/components/CrossChannelAnalytics';

type TabType = 'dashboard' | 'campaigns' | 'web-push' | 'analytics' | 'contact';

export default function Home() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { apiKey, isAuthenticated, setApiKey, clearApiKey } = useAuthStore();

  const handleCampaignCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setIsValidating(true);
    
    try {
      await setApiKey(apiKeyInput);
      setApiKeyInput('');
    } catch (error) {
      console.error('Login failed:', error);
      alert('로그인에 실패했습니다. API 키를 확인해주세요.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsValidating(true);
    try {
      await setApiKey('api-key-1');
    } catch (error) {
      console.error('Demo login failed:', error);
      alert('데모 로그인에 실패했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogout = () => {
    clearApiKey();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" variant="icon" className="drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              Ridge AI Push
            </h1>
            <p className="text-lg text-gray-800 leading-relaxed">
              지능형 푸시 알림 플랫폼
            </p>
            <p className="text-sm text-gray-700 mt-2">
              자연어로 AI 기반 캠페인을 생성하세요
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
            <form onSubmit={handleApiKeySubmit} className="space-y-6">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-semibold text-gray-800 mb-3">
                  API 키
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="API 키를 입력하세요"
                  disabled={isValidating}
                />
              </div>

              <button
                type="submit"
                disabled={isValidating || !apiKeyInput.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none mb-3"
              >
                {isValidating ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    확인 중...
                  </div>
                ) : (
                  '로그인'
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isValidating}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isValidating ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    데모 로그인 중...
                  </div>
                ) : (
                  '🚀 데모 로그인'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-700">
                API 키가 없으신가요?{' '}
                <span className="text-indigo-600 font-medium">관리자에게 문의하세요</span>
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl mb-1">🤖</div>
              <p className="text-xs text-gray-800 font-medium">AI 기반</p>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-1">🌐</div>
              <p className="text-xs text-gray-800 font-medium">웹+모바일</p>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-1">📊</div>
              <p className="text-xs text-gray-800 font-medium">실시간 분석</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="sm" variant="full" />
            
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-8">
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-800 hover:text-gray-900'
                  }`}
                >
                  📱 대시보드
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'campaigns'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-800 hover:text-gray-900'
                  }`}
                >
                  🚀 멀티채널 캠페인
                </button>
                <button
                  onClick={() => setActiveTab('web-push')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'web-push'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-800 hover:text-gray-900'
                  }`}
                >
                  🌐 웹 푸시
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-800 hover:text-gray-900'
                  }`}
                >
                  📊 크로스채널 분석
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'contact'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-800 hover:text-gray-900'
                  }`}
                >
                  💬 문의하기
                </button>
              </nav>
              
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-800">
                    {apiKey?.substring(0, 8)}***
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-800 hover:text-red-600 transition-colors font-medium"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">
                  🚀 Ridge AI Push - 멀티채널 플랫폼
                </h2>
                <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                  모바일 앱과 웹사이트에서 AI 기반 푸시 알림을 한 곳에서 관리하세요.
                  사용자별 최적 채널을 AI가 자동 선택하고, 실시간 성과를 분석합니다.
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                    📱 <strong>모바일 푸시:</strong> iOS/Android 앱
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                    🌐 <strong>웹 푸시:</strong> 모든 브라우저
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                    🤖 <strong>AI 최적화:</strong> 자동 채널 선택
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">등록된 앱</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">캠페인</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">총 발송 수</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
              </div>

              <AppManager />
              <DemoSimulation onEventSent={handleCampaignCreated} />
              <AIRecommendations 
                companyId="company1" 
                onCampaignCreated={handleCampaignCreated} 
              />
              <CampaignList key={refreshKey} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'campaigns' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MultiChannelCampaignCreator 
            companyId="company1" 
            onCampaignCreate={handleCampaignCreated} 
          />
        </div>
      )}

      {activeTab === 'web-push' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WebPushManager companyId="company1" />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CrossChannelAnalytics companyId="company1" />
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Contact />
        </div>
      )}
    </div>
  );
}