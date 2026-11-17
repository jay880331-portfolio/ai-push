'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'event' | 'push' | 'subscription' | 'error';
  message: string;
  data?: any;
}

export default function BlogDemo() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [readingTime, setReadingTime] = useState(0);
  const [currentArticle, setCurrentArticle] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState({
    interests: [] as string[],
    readingHistory: [] as string[],
    engagementLevel: 'new' as 'new' | 'casual' | 'engaged' | 'power'
  });

  useEffect(() => {
    initializeSDK();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 읽기 시간 추적
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentArticle) {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentArticle]);

  const addLog = (message: string, type: LogEntry['type'] = 'event', data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // 최근 50개만 유지
  };

  const initializeSDK = useCallback(async () => {
    try {
      addLog('🚀 Ridge AI Push SDK 초기화 시작', 'event');
      
      // SDK 스크립트 동적 로드
      if (typeof window !== 'undefined' && !(window as any).RidgeAIPush) {
        addLog('⏳ SDK 스크립트 로딩 중...', 'event');
        
        // 스크립트 요소 생성 및 로드
        const script = document.createElement('script');
        script.src = '/js/ridge-ai-push.js';
        script.setAttribute('data-api-key', 'demo-blog-api-key');
        script.setAttribute('data-debug', 'true');
        document.head.appendChild(script);
        
        await new Promise<void>((resolve) => {
          const checkSDK = () => {
            if ((window as any).RidgeAIPush) {
              resolve();
            } else {
              setTimeout(checkSDK, 100);
            }
          };
          checkSDK();
        });
      }

      // SDK 초기화
      await (window as any).RidgeAIPush.init({
        apiKey: 'demo-blog-api-key',
        debug: true,
        userId: 'blog-reader-' + Date.now(),
        userAttributes: {
          platform: 'web',
          demo: 'blog',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });

      setIsInitialized(true);
      addLog('✅ SDK 초기화 완료', 'event');

      // 구독 상태 확인
      const subscriptionStatus = await (window as any).RidgeAIPush.getSubscriptionStatus();
      setIsSubscribed(subscriptionStatus.isSubscribed);
      
      if (subscriptionStatus.isSubscribed) {
        addLog('📱 이미 구독된 상태입니다', 'subscription');
      }

    } catch (error) {
      addLog(`❌ SDK 초기화 실패: ${error}`, 'error');
      console.error('SDK 초기화 실패:', error);
    }
  }, []);

  const subscribeToPush = async () => {
    try {
      addLog('🔔 푸시 알림 구독 시작', 'subscription');
      
      await (window as any).RidgeAIPush.requestPermission();
      
      // 블로그 독자 태그 설정
      await (window as any).RidgeAIPush.addTags(['blog_reader', 'content_lover', 'demo_user']);
      
      setIsSubscribed(true);
      addLog('✅ 블로그 푸시 알림 구독 완료!', 'subscription');
      
    } catch (error) {
      addLog(`❌ 구독 실패: ${error}`, 'error');
      console.error('구독 실패:', error);
    }
  };

  const readArticle = async (title: string, category: string = 'tech', estimatedReadTime: number = 5) => {
    if (!isInitialized) {
      addLog('⚠️ SDK가 초기화되지 않았습니다', 'error');
      return;
    }

    try {
      setCurrentArticle(title);
      setReadingTime(0);
      
      // 글 시작 이벤트
      await (window as any).RidgeAIPush.trackEvent('article_start', {
        articleTitle: title,
        category: category,
        estimatedReadTime: estimatedReadTime,
        timestamp: new Date().toISOString()
      });
      
      addLog(`📖 글 읽기 시작: ${title} (${category})`, 'event');
      
      // 관심사 업데이트
      const newInterests = [...userProfile.interests];
      if (!newInterests.includes(category)) {
        newInterests.push(category);
        setUserProfile(prev => ({ ...prev, interests: newInterests }));
        
        // 관심사 태그 추가
        await (window as any).RidgeAIPush.addTags([`interest_${category}`]);
        addLog(`🏷️ 새 관심사 태그 추가: ${category}`, 'event');
      }
      
      // 읽기 기록 업데이트
      setUserProfile(prev => ({
        ...prev,
        readingHistory: [title, ...prev.readingHistory.slice(0, 9)] // 최근 10개
      }));
      
      // 시뮬레이션: 3초 후 스크롤 이벤트
      setTimeout(async () => {
        await (window as any).RidgeAIPush.trackEvent('article_scroll_50', {
          articleTitle: title,
          scrollPercent: 50
        });
        addLog(`📜 ${title} - 50% 스크롤 완료`, 'event');
      }, 3000);
      
      // 시뮬레이션: 6초 후 읽기 완료
      setTimeout(async () => {
        await completeReading(title, category);
      }, 6000);
      
    } catch (error) {
      addLog(`❌ 글 읽기 추적 실패: ${error}`, 'error');
    }
  };
  
  const completeReading = async (title: string, category: string) => {
    try {
      await (window as any).RidgeAIPush.trackEvent('article_read_completed', {
        articleTitle: title,
        category: category,
        readingTime: readingTime,
        completionRate: 100
      });
      
      addLog(`✅ 글 읽기 완료: ${title} (${readingTime}초)`, 'event');
      
      // 참여도 레벨 업데이트
      const readCount = userProfile.readingHistory.length + 1;
      let newLevel = userProfile.engagementLevel;
      
      if (readCount >= 10) newLevel = 'power';
      else if (readCount >= 5) newLevel = 'engaged';
      else if (readCount >= 2) newLevel = 'casual';
      
      if (newLevel !== userProfile.engagementLevel) {
        setUserProfile(prev => ({ ...prev, engagementLevel: newLevel }));
        await (window as any).RidgeAIPush.updateUserAttributes({
          engagementLevel: newLevel,
          totalArticlesRead: readCount
        });
        addLog(`⬆️ 참여도 레벨 업: ${newLevel}`, 'event');
      }
      
      setCurrentArticle(null);
      setReadingTime(0);
      
    } catch (error) {
      addLog(`❌ 읽기 완료 추적 실패: ${error}`, 'error');
    }
  };
  
  const shareArticle = async (title: string, platform: string) => {
    try {
      await (window as any).RidgeAIPush.trackEvent('article_shared', {
        articleTitle: title,
        platform: platform,
        sharedAt: new Date().toISOString()
      });
      
      await (window as any).RidgeAIPush.addTags(['social_sharer', `shared_${platform}`]);
      addLog(`📤 글 공유: ${title} → ${platform}`, 'event');
      
    } catch (error) {
      addLog(`❌ 공유 추적 실패: ${error}`, 'error');
    }
  };
  
  const likeArticle = async (title: string) => {
    try {
      await (window as any).RidgeAIPush.trackEvent('article_liked', {
        articleTitle: title,
        likedAt: new Date().toISOString()
      });
      
      addLog(`❤️ 글 좋아요: ${title}`, 'event');
      
    } catch (error) {
      addLog(`❌ 좋아요 추적 실패: ${error}`, 'error');
    }
  };

  const sendNewArticleAlert = async () => {
    if (!isSubscribed) {
      addLog('⚠️ 먼저 푸시 알림을 구독해주세요', 'error');
      return;
    }

    try {
      addLog('📤 새 글 발행 알림 전송 중...', 'push');
      
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'demo'
        },
        body: JSON.stringify({
          title: '📝 새 글이 발행되었습니다!',
          message: 'AI와 웹 개발의 미래 - 지금 읽어보세요!',
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: { tags: ['blog_reader'] }
        })
      });

      const data = await response.json();
      if (response.ok) {
        addLog(`✅ 새 글 알림 전송 완료 (${data.successCount}명)`, 'push');
      } else {
        addLog(`❌ 알림 전송 실패: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ 알림 전송 중 오류: ${error}`, 'error');
    }
  };

  const sendPersonalizedRecommendation = async () => {
    if (!isSubscribed) {
      addLog('⚠️ 먼저 푸시 알림을 구독해주세요', 'error');
      return;
    }

    try {
      addLog('🤖 개인화 추천 알림 전송 중...', 'push');
      
      const topInterest = userProfile.interests[0] || 'tech';
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'demo'
        },
        body: JSON.stringify({
          title: `🎯 ${topInterest} 관련 추천글`,
          message: `${userProfile.engagementLevel} 독자님을 위한 맞춤 콘텐츠를 준비했습니다!`,
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: { tags: [`interest_${topInterest}`] }
        })
      });

      const data = await response.json();
      if (response.ok) {
        addLog(`✅ 개인화 추천 알림 전송 완료`, 'push');
      } else {
        addLog(`❌ 추천 알림 전송 실패: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ 추천 알림 전송 중 오류: ${error}`, 'error');
    }
  };

  const sendWeeklyDigest = async () => {
    if (!isSubscribed) {
      addLog('⚠️ 먼저 푸시 알림을 구독해주세요', 'error');
      return;
    }

    try {
      addLog('📅 주간 다이제스트 전송 중...', 'push');
      
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'demo'
        },
        body: JSON.stringify({
          title: '📅 주간 인기글 모음',
          message: `이번 주 ${userProfile.interests.join(', ')} 분야 인기글을 확인하세요!`,
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: { tags: ['blog_reader'] }
        })
      });

      const data = await response.json();
      if (response.ok) {
        addLog(`✅ 주간 다이제스트 전송 완료 (${data.successCount}명)`, 'push');
      } else {
        addLog(`❌ 다이제스트 전송 실패: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ 다이제스트 전송 중 오류: ${error}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">📝 블로그 웹 푸시 데모</h1>
            <p className="text-gray-700">Ridge AI Push SDK를 활용한 블로그 사이트 체험</p>
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <span className={`px-3 py-1 rounded-full ${isInitialized ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {isInitialized ? '✅ SDK 초기화됨' : '⏳ SDK 로딩 중'}
              </span>
              <span className={`px-3 py-1 rounded-full ${isSubscribed ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {isSubscribed ? '🔔 구독 중' : '🔕 미구독'}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                📊 {userProfile.engagementLevel} 독자
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-2 space-y-6">

              {/* 구독 상태 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">📱 블로그 구독</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubscribed ? (
                    <div className="space-y-4">
                      <div className="flex items-center text-green-600">
                        <span className="text-2xl mr-2">✅</span>
                        <span className="text-gray-800">구독 완료! 개인화된 콘텐츠를 받아보세요.</span>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700">
                          <div><strong>관심사:</strong> {userProfile.interests.join(', ') || '없음'}</div>
                          <div><strong>읽은 글:</strong> {userProfile.readingHistory.length}개</div>
                          <div><strong>참여도:</strong> {userProfile.engagementLevel}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-800 mb-4">AI 기반 개인화 콘텐츠와 실시간 알림을 받아보세요!</p>
                      <button
                        onClick={subscribeToPush}
                        disabled={!isInitialized}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        🔔 블로그 구독하기
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 최근 글 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">📚 최신 글</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 현재 읽고 있는 글 */}
                  {currentArticle && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-blue-700">
                          <span className="text-lg mr-2">📖</span>
                          <span className="font-medium">현재 읽는 중: {currentArticle}</span>
                        </div>
                        <span className="text-sm text-blue-600">{readingTime}초</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => readArticle('AI 기반 푸시 알림의 미래', 'AI', 5)}>
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">🤖</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">AI 기반 푸시 알림의 미래</h3>
                          <p className="text-gray-600 text-sm mb-3">인공지능이 개인화된 푸시 알림을 통해 사용자 경험을 혁신하는 방법...</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <span>2024.12.27</span>
                              <span className="mx-2">•</span>
                              <span>5분</span>
                              <span className="mx-2">•</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">AI</span>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); likeArticle('AI 기반 푸시 알림의 미래'); }}
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                ❤️
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); shareArticle('AI 기반 푸시 알림의 미래', 'twitter'); }}
                                className="text-blue-500 hover:text-blue-600 text-sm"
                              >
                                🐦
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => readArticle('웹 푸시 API 완벽 가이드', 'development', 8)}>
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">🌐</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">웹 푸시 API 완벽 가이드</h3>
                          <p className="text-gray-600 text-sm mb-3">웹 브라우저에서 네이티브 앱 수준의 푸시 알림 구현 방법...</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <span>2024.12.26</span>
                              <span className="mx-2">•</span>
                              <span>8분</span>
                              <span className="mx-2">•</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">개발</span>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); likeArticle('웹 푸시 API 완벽 가이드'); }}
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                ❤️
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); shareArticle('웹 푸시 API 완벽 가이드', 'linkedin'); }}
                                className="text-blue-500 hover:text-blue-600 text-sm"
                              >
                                💼
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => readArticle('사용자 참여도를 높이는 전략', 'marketing', 6)}>
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">📊</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">사용자 참여도를 높이는 전략</h3>
                          <p className="text-gray-600 text-sm mb-3">효과적인 푸시 알림 메시지 작성법과 최적 타이밍...</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <span>2024.12.25</span>
                              <span className="mx-2">•</span>
                              <span>6분</span>
                              <span className="mx-2">•</span>
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">마케팅</span>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); likeArticle('사용자 참여도를 높이는 전략'); }}
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                ❤️
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); shareArticle('사용자 참여도를 높이는 전략', 'facebook'); }}
                                className="text-blue-500 hover:text-blue-600 text-sm"
                              >
                                📘
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 푸시 알림 테스트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">🧪 푸시 알림 테스트</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 mb-4">
                    블로그 사이트의 다양한 AI 기반 푸시 알림을 체험해보세요:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={sendNewArticleAlert}
                      disabled={!isSubscribed}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      📝 새 글 발행 알림
                    </button>
                    <button
                      onClick={sendPersonalizedRecommendation}
                      disabled={!isSubscribed || userProfile.interests.length === 0}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      🎯 개인화 추천 알림
                    </button>
                    <button
                      onClick={sendWeeklyDigest}
                      disabled={!isSubscribed}
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      📅 주간 다이제스트
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* 사이드바 - 로그 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800 text-sm">📊 실시간 로그</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {logs.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">로그가 없습니다</p>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className={`text-xs p-2 rounded ${
                          log.type === 'error' ? 'bg-red-50 text-red-800' :
                          log.type === 'push' ? 'bg-blue-50 text-blue-800' :
                          log.type === 'subscription' ? 'bg-green-50 text-green-800' :
                          'bg-gray-50 text-gray-800'
                        }`}>
                          <div className="font-medium">{log.timestamp}</div>
                          <div>{log.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800 text-sm">👤 사용자 프로필</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">참여도 레벨</div>
                      <div className={`inline-block px-2 py-1 rounded text-xs ${
                        userProfile.engagementLevel === 'power' ? 'bg-purple-100 text-purple-800' :
                        userProfile.engagementLevel === 'engaged' ? 'bg-blue-100 text-blue-800' :
                        userProfile.engagementLevel === 'casual' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {userProfile.engagementLevel}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">관심사</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {userProfile.interests.length > 0 ? userProfile.interests.map((interest, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {interest}
                          </span>
                        )) : (
                          <span className="text-gray-500 text-xs">없음</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">읽기 기록</div>
                      <div className="text-xs text-gray-600">
                        총 {userProfile.readingHistory.length}개 글 읽음
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 뒤로가기 */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Ridge AI Push 메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
}