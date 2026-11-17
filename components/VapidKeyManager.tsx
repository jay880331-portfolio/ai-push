'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

interface VapidKeyManagerProps {
  companyId?: string;
}

export default function VapidKeyManager({}: VapidKeyManagerProps) {
  const { apiKey } = useAuthStore();
  const [vapidKeys, setVapidKeys] = useState<{
    publicKey?: string;
    email?: string;
    hasKeys: boolean;
  }>({ hasKeys: false });
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<{
    publicKey: string;
    privateKey?: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    loadVapidKeys();
  }, [apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVapidKeys = useCallback(async () => {
    if (!apiKey) return;

    try {
      const response = await fetch('/api/vapid-keys', {
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVapidKeys({
          publicKey: data.publicKey,
          email: data.email,
          hasKeys: !data.usingDefault
        });
      }
    } catch (error) {
      console.error('Failed to load VAPID keys:', error);
    }
  }, [apiKey]);

  const generateVapidKeys = async (overwrite = false) => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/vapid-keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || ''
        },
        body: JSON.stringify({
          email,
          overwrite
        })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedKeys(data.keys);
        setVapidKeys({
          publicKey: data.keys.publicKey,
          email: data.keys.email,
          hasKeys: true
        });
        alert('✅ VAPID 키가 성공적으로 생성되었습니다!');
      } else {
        if (response.status === 409) {
          const confirmOverwrite = confirm(
            '이미 VAPID 키가 존재합니다. 기존 키를 덮어쓰시겠습니까?\n\n⚠️ 주의: 기존 구독자들은 새로 구독해야 합니다.'
          );
          if (confirmOverwrite) {
            generateVapidKeys(true);
          }
        } else {
          alert(`❌ VAPID 키 생성 실패: ${data.error}`);
        }
      }
    } catch (error) {
      alert('❌ VAPID 키 생성 중 오류가 발생했습니다.');
      console.error('VAPID key generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`✅ ${label}이(가) 클립보드에 복사되었습니다!`);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-800">🔑 VAPID 키 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 현재 VAPID 키 상태 */}
        <div>
          <h3 className="font-medium text-gray-800 mb-3">현재 VAPID 키 상태</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {vapidKeys.hasKeys ? (
              <div className="space-y-2">
                <div className="flex items-center text-green-600">
                  <span className="text-xl mr-2">✅</span>
                  <span className="text-gray-800">커스텀 VAPID 키 사용 중</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div><strong>Email:</strong> {vapidKeys.email}</div>
                  <div className="mt-2">
                    <strong>Public Key:</strong>
                    <div className="font-mono text-xs bg-white p-2 rounded border mt-1 break-all">
                      {vapidKeys.publicKey}
                    </div>
                    <button
                      onClick={() => copyToClipboard(vapidKeys.publicKey || '', 'Public Key')}
                      className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      📋 복사
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <span className="text-xl mr-2">⚠️</span>
                <span className="text-gray-800">기본 VAPID 키 사용 중 (Ridge AI Push 공통)</span>
              </div>
            )}
          </div>
        </div>

        {/* VAPID 키 생성 */}
        <div>
          <h3 className="font-medium text-gray-800 mb-3">새 VAPID 키 생성</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                이메일 주소 *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="support@yourcompany.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                VAPID 스펙에 따라 연락 가능한 이메일이 필요합니다.
              </p>
            </div>

            <button
              onClick={() => generateVapidKeys(false)}
              disabled={isGenerating || !email}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? '⏳ 생성 중...' : '🔑 새 VAPID 키 생성'}
            </button>
          </div>
        </div>

        {/* 생성된 키 표시 */}
        {generatedKeys && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-3">✅ 새 VAPID 키가 생성되었습니다!</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Public Key:</strong>
                <div className="font-mono text-xs bg-white p-2 rounded border mt-1 break-all">
                  {generatedKeys.publicKey}
                </div>
                <button
                  onClick={() => copyToClipboard(generatedKeys.publicKey, 'Public Key')}
                  className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  📋 복사
                </button>
              </div>

              <div>
                <strong>Email:</strong> {generatedKeys.email}
              </div>

              <div className="text-green-700 bg-green-100 p-3 rounded">
                <strong>⚠️ 중요:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Private Key는 보안상 표시되지 않으며, 서버에 안전하게 저장됩니다.</li>
                  <li>기존 구독자들은 새로운 키로 다시 구독해야 합니다.</li>
                  <li>Public Key는 클라이언트 SDK에서 자동으로 사용됩니다.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 사용법 가이드 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-3">📖 사용법</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>1. 자동 사용:</strong> SDK가 자동으로 새 VAPID 키를 사용합니다.</p>
            <p><strong>2. 수동 설정:</strong> 직접 지정하려면:</p>
            <pre className="bg-blue-100 p-2 rounded text-xs font-mono mt-2">
{`RidgeAIPush.init({
  apiKey: 'your-api-key',
  vapidPublicKey: '${vapidKeys.publicKey || 'your-public-key'}'
});`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}