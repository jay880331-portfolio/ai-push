'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ICustomerApp } from '@/types';
import SetupGuide from './SetupGuide';

export default function AppManager() {
  const [apps, setApps] = useState<ICustomerApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add app form state
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [platform, setPlatform] = useState<'android' | 'ios' | 'both'>('both');
  const [addingApp, setAddingApp] = useState(false);
  const [selectedAppForGuide, setSelectedAppForGuide] = useState<ICustomerApp | null>(null);
  
  const { apiKey } = useAuthStore();

  useEffect(() => {
    if (apiKey) {
      fetchApps();
    }
  }, [apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/apps', {
        headers: {
          'X-API-Key': apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }

      const data = await response.json();
      setApps(data.apps);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !packageName.trim() || !apiKey) return;

    setAddingApp(true);
    setError(null);

    try {
      const response = await fetch('/api/apps/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          appName: appName.trim(),
          packageName: packageName.trim(),
          platform,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register app');
      }

      const data = await response.json();
      setApps(prev => [data.app, ...prev]);
      
      // Reset form
      setAppName('');
      setPackageName('');
      setPlatform('both');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingApp(false);
    }
  };

  const downloadConfig = async (appId: string, platform: 'android' | 'ios') => {
    try {
      const response = await fetch(`/api/apps/config?appId=${appId}&platform=${platform}`, {
        headers: {
          'X-API-Key': apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download config');
      }

      const data = await response.json();
      
      // Create and download file
      const configJson = JSON.stringify(data.config, null, 2);
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading && apps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">앱 관리</h2>
            <p className="text-sm text-gray-600 mt-1">모바일 앱을 등록하고 관리하세요</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            {showAddForm ? '✕ 취소' : '+ 앱 추가'}
          </button>
        </div>
      </div>
      
      <div className="p-6">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
          <span className="text-xl mr-3">⚠️</span>
          <div>
            <p className="font-medium">오류</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-xl mr-2">📱</span>
            새 앱 추가
          </h3>
          <form onSubmit={handleAddApp} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="appName" className="block text-sm font-semibold text-gray-800 mb-2">
                  앱 이름
                </label>
                <input
                  type="text"
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="내 멋진 앱"
                  required
                />
              </div>

              <div>
                <label htmlFor="packageName" className="block text-sm font-semibold text-gray-800 mb-2">
                  패키지 이름
                </label>
                <input
                  type="text"
                  id="packageName"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="com.company.app"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="mr-1">💡</span>
                  역방향 도메인 표기법을 사용하세요 (예: com.yourcompany.yourapp)
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="platform" className="block text-sm font-semibold text-gray-800 mb-2">
                대상 플랫폼
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
              >
                <option value="both">📱 iOS & Android 모두</option>
                <option value="android">🤖 Android만</option>
                <option value="ios">🍎 iOS만</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={addingApp || !appName.trim() || !packageName.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {addingApp ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  앱 추가 중...
                </div>
              ) : (
                '🚀 앱 추가'
              )}
            </button>
          </form>
        </div>
      )}

      {apps.length === 0 && !showAddForm ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-6">
            <span className="text-3xl">📱</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 등록된 앱이 없습니다</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            첫 번째 모바일 앱을 등록하여 지능적인 푸시 알림 전송을 시작하세요.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🚀 첫 번째 앱 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app._id} className="bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{app.appName}</h3>
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.platform === 'both' ? 'bg-purple-100 text-purple-700' :
                        app.platform === 'android' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {app.platform === 'both' ? '📱 크로스 플랫폼' :
                         app.platform === 'android' ? '🤖 Android' : '🍎 iOS'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {app.isActive ? '🟢 활성' : '🔴 비활성'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 font-mono text-sm bg-gray-100 rounded-lg px-3 py-1 inline-block">
                    {app.packageName}
                  </p>
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p>📅 생성일: {new Date(app.createdAt!).toLocaleDateString()}</p>
                    {app.firebaseAppId && (
                      <p>🔥 Firebase App ID: <span className="font-mono">{app.firebaseAppId}</span></p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <p className="text-xs text-gray-500">Platform: {app.platform}</p>
                  {(app.platform === 'android' || app.platform === 'both') && (
                    <button
                      onClick={() => downloadConfig(app._id!, 'android')}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span>🤖</span>
                      Android 설정
                    </button>
                  )}
                  {(app.platform === 'ios' || app.platform === 'both') && (
                    <button
                      onClick={() => downloadConfig(app._id!, 'ios')}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span>🍎</span>
                      iOS 설정
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAppForGuide(selectedAppForGuide?._id === app._id ? null : app)}
                    className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>📖</span>
                    {selectedAppForGuide?._id === app._id ? '가이드 숨기기' : '설정 가이드'}
                  </button>
                </div>
              </div>
              
              {selectedAppForGuide?._id === app._id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <SetupGuide app={app} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}