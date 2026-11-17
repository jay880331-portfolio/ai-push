'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface TestTokenManagerProps {
  appId: string;
}

export default function TestTokenManager({ appId }: TestTokenManagerProps) {
  const [testToken, setTestToken] = useState('');
  const [userId, setUserId] = useState('');
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { apiKey } = useAuthStore();

  const generateTestToken = () => {
    // FCM 토큰 형식의 더미 토큰 생성
    const dummyToken = 'test_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ':APA91bH' + Math.random().toString(36).substring(2, 30);
    setTestToken(dummyToken);
    setUserId('test_user_' + Math.random().toString(36).substring(2, 8));
  };

  const registerTestToken = async () => {
    if (!testToken.trim() || !userId.trim() || !apiKey) return;

    setRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/users/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          token: testToken,
          platform: 'android',
          userIdInClientApp: userId,
          appId: appId,
          customAttributes: { testUser: true },
          tags: ['test', 'demo']
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '토큰 등록에 실패했습니다');
      }

      setSuccess(`테스트 토큰이 성공적으로 등록되었습니다! (사용자: ${userId})`);
      setTestToken('');
      setUserId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-4">
      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <span className="text-xl mr-2">🧪</span>
        테스트용 푸시 토큰 등록
      </h4>
      
      <p className="text-sm text-gray-600 mb-4">
        실제 모바일 앱 없이도 푸시 발송을 테스트할 수 있도록 더미 토큰을 등록합니다.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 flex items-center">
          <span className="text-lg mr-2">❌</span>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4 flex items-center">
          <span className="text-lg mr-2">✅</span>
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테스트 토큰
            </label>
            <input
              type="text"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 bg-white placeholder-gray-500"
              placeholder="더미 FCM 토큰"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용자 ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500"
              placeholder="test_user_123"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateTestToken}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            🎲 더미 토큰 생성
          </button>
          
          <button
            onClick={registerTestToken}
            disabled={registering || !testToken.trim() || !userId.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {registering ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                등록 중...
              </div>
            ) : (
              '📝 토큰 등록'
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>참고:</strong> 이는 테스트용 더미 토큰입니다. 실제 푸시는 발송되지 않지만 
          시스템의 모든 로직(AI 생성, 저장, 스케줄링)을 테스트할 수 있습니다.
        </p>
      </div>
    </div>
  );
}