'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'event' | 'push' | 'subscription' | 'error' | 'breaking';
  message: string;
  data?: any;
}

interface NewsStory {
  id: string;
  title: string;
  summary: string;
  category: string;
  priority: 'breaking' | 'high' | 'normal';
  readTime: number;
  publishedAt: string;
  views: number;
  isRead: boolean;
}

export default function NewsDemo() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [userPreferences, setUserPreferences] = useState({
    categories: [] as string[],
    breakingNews: true,
    dailyDigest: true,
    personalization: true
  });
  const [newsStories, setNewsStories] = useState<NewsStory[]>([
    {
      id: '1',
      title: 'AI 기술 대혁신 발표',
      summary: '새로운 인공지능 모델이 개발되며 기술업계에 큰 변화 예상',
      category: 'technology',
      priority: 'breaking',
      readTime: 3,
      publishedAt: '방금 전',
      views: 1247,
      isRead: false
    },
    {
      id: '2',
      title: '경제 동향: 주요 지표 발표',
      summary: '이번 달 경제 지표가 발표되며 전문가들의 분석이 이어지고 있음',
      category: 'economy',
      priority: 'high',
      readTime: 4,
      publishedAt: '1시간 전',
      views: 892,
      isRead: false
    },
    {
      id: '3',
      title: '환경 정책 새로운 변화',
      summary: '정부가 발표한 새로운 환경 정책이 업계에 미칠 영향 분석',
      category: 'politics',
      priority: 'normal',
      readTime: 5,
      publishedAt: '3시간 전',
      views: 534,
      isRead: false
    },
    {
      id: '4',
      title: '스포츠: 주요 경기 결과',
      summary: '어제 밤 열린 주요 경기들의 결과와 하이라이트',
      category: 'sports',
      priority: 'normal',
      readTime: 2,
      publishedAt: '5시간 전',
      views: 723,
      isRead: false
    }
  ]);

  useEffect(() => {
    initializeSDK();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addLog = (message: string, type: LogEntry['type'] = 'event', data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
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
        script.setAttribute('data-api-key', 'demo-news-api-key');
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

      await (window as any).RidgeAIPush.init({
        apiKey: 'demo-news-api-key',
        debug: true,
        userId: 'news-reader-' + Date.now(),
        userAttributes: {
          platform: 'web',
          demo: 'news',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'ko'
        }
      });

      setIsInitialized(true);
      addLog('✅ SDK 초기화 완료', 'event');

      const subscriptionStatus = await (window as any).RidgeAIPush.getSubscriptionStatus();
      setIsSubscribed(subscriptionStatus.isSubscribed);
      
      if (subscriptionStatus.isSubscribed) {
        addLog('📱 이미 뉴스 알림에 구독된 상태', 'subscription');
      }

    } catch (error) {
      addLog(`❌ SDK 초기화 실패: ${error}`, 'error');
      console.error('SDK 초기화 실패:', error);
    }
  }, []);

  const subscribeToPush = async () => {
    try {
      addLog('📰 뉴스 알림 구독 시작', 'subscription');
      
      await (window as any).RidgeAIPush.requestPermission();
      
      // 뉴스 독자 태그 및 선호도 설정
      const initialTags = ['news_reader', 'demo_user'];
      if (userPreferences.breakingNews) initialTags.push('breaking_news');
      if (userPreferences.dailyDigest) initialTags.push('daily_digest');
      
      await (window as any).RidgeAIPush.addTags(initialTags);
      
      // 사용자 선호도 업데이트
      await (window as any).RidgeAIPush.updateUserAttributes({
        newsPreferences: userPreferences,
        subscribedAt: new Date().toISOString()
      });
      
      setIsSubscribed(true);
      addLog('✅ 뉴스 알림 구독 완료!', 'subscription');
      
    } catch (error) {
      addLog(`❌ 구독 실패: ${error}`, 'error');
      console.error('구독 실패:', error);
    }
  };

  const readNews = async (story: NewsStory) => {
    if (!isInitialized) {
      addLog('⚠️ SDK가 초기화되지 않았습니다', 'error');
      return;
    }

    try {
      // 뉴스 읽기 시작 이벤트
      await (window as any).RidgeAIPush.trackEvent('news_article_start', {
        articleId: story.id,
        articleTitle: story.title,
        category: story.category,
        priority: story.priority,
        estimatedReadTime: story.readTime,
        publishedAt: story.publishedAt,
        timestamp: new Date().toISOString()
      });
      
      addLog(`📰 뉴스 읽기 시작: ${story.title}`, 'event');
      
      // 카테고리별 관심사 업데이트
      if (!userPreferences.categories.includes(story.category)) {
        const newCategories = [...userPreferences.categories, story.category];
        setUserPreferences(prev => ({ ...prev, categories: newCategories }));
        
        await (window as any).RidgeAIPush.addTags([`category_${story.category}`]);
        addLog(`🏷️ 새 카테고리 관심사: ${story.category}`, 'event');
      }
      
      // 조회수 업데이트
      setNewsStories(prev => prev.map(s => 
        s.id === story.id 
          ? { ...s, views: s.views + 1, isRead: true }
          : s
      ));
      
      // 우선순위에 따른 처리
      if (story.priority === 'breaking') {
        addLog('🚨 속보 뉴스 읽기 중!', 'breaking');
        await (window as any).RidgeAIPush.addTags(['breaking_news_reader']);
      }
      
      // 시뮬레이션: 읽기 완료 이벤트 (3초 후)
      setTimeout(async () => {
        await completeNewsReading(story);
      }, 3000);
      
    } catch (error) {
      addLog(`❌ 뉴스 읽기 추적 실패: ${error}`, 'error');
    }
  };
  
  const completeNewsReading = async (story: NewsStory) => {
    try {
      await (window as any).RidgeAIPush.trackEvent('news_article_completed', {
        articleId: story.id,
        articleTitle: story.title,
        category: story.category,
        priority: story.priority,
        completionTime: 3, // 시뮬레이션
        engagementScore: story.priority === 'breaking' ? 100 : 75
      });
      
      addLog(`✅ 뉴스 읽기 완료: ${story.title}`, 'event');
      
      // 사용자 참여도 업데이트
      const readCount = newsStories.filter(s => s.isRead).length + 1;
      await (window as any).RidgeAIPush.updateUserAttributes({
        totalNewsRead: readCount,
        lastReadCategory: story.category,
        lastActivity: new Date().toISOString()
      });
      
    } catch (error) {
      addLog(`❌ 뉴스 읽기 완료 추적 실패: ${error}`, 'error');
    }
  };
  
  const shareNews = async (story: NewsStory, platform: string) => {
    try {
      await (window as any).RidgeAIPush.trackEvent('news_shared', {
        articleId: story.id,
        articleTitle: story.title,
        platform: platform,
        category: story.category,
        sharedAt: new Date().toISOString()
      });
      
      await (window as any).RidgeAIPush.addTags(['news_sharer', `shared_${platform}`]);
      addLog(`📤 뉴스 공유: ${story.title} → ${platform}`, 'event');
      
    } catch (error) {
      addLog(`❌ 공유 추적 실패: ${error}`, 'error');
    }
  };
  
  const bookmarkNews = async (story: NewsStory) => {
    try {
      await (window as any).RidgeAIPush.trackEvent('news_bookmarked', {
        articleId: story.id,
        articleTitle: story.title,
        category: story.category,
        bookmarkedAt: new Date().toISOString()
      });
      
      await (window as any).RidgeAIPush.addTags(['news_saver']);
      addLog(`🔖 뉴스 북마크: ${story.title}`, 'event');
      
    } catch (error) {
      addLog(`❌ 북마크 추적 실패: ${error}`, 'error');
    }
  };

  const sendBreakingNews = async () => {
    if (!isSubscribed) {
      addLog('⚠️ 먼저 뉴스 알림을 구독해주세요', 'error');
      return;
    }

    try {
      addLog('🚨 속보 알림 전송 중...', 'breaking');
      
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'demo'
        },
        body: JSON.stringify({
          title: '🚨 속보: 기술 대혁신 발표!',
          message: '새로운 AI 모델이 공개되었습니다. 지금 확인하세요!',
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: { tags: ['breaking_news'] }
        })
      });

      const data = await response.json();
      if (response.ok) {
        addLog(`✅ 속보 알림 전송 완료 (${data.successCount}명)`, 'breaking');
      } else {
        addLog(`❌ 속보 알림 전송 실패: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ 속보 알림 전송 중 오류: ${error}`, 'error');
    }
  };
  
  const sendPersonalizedNews = async () => {
    if (!isSubscribed) {
      addLog('⚠️ 먼저 뉴스 알림을 구독해주세요', 'error');
      return;
    }

    try {
      addLog('🎯 개인화 뉴스 알림 전송 중...', 'push');
      
      const topCategory = userPreferences.categories[0] || 'technology';
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'demo'
        },
        body: JSON.stringify({
          title: `🎯 ${topCategory} 뉴스 추천`,
          message: '귀하의 관심사에 맞는 최신 뉴스를 준비했습니다!',
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: { tags: [`category_${topCategory}`] }
        })
      });

      const data = await response.json();
      if (response.ok) {
        addLog(`✅ 개인화 뉴스 알림 전송 완료`, 'push');
      } else {
        addLog(`❌ 개인화 알림 전송 실패: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ 개인화 알림 전송 중 오류: ${error}`, 'error');
    }
  };

  const sendDailyBrief = async () => {
    if (!isSubscribed) {
      addLog('⚠️ 먼저 뉴스 알림을 구독해주세요', 'error');
      return;
    }

    try {
      addLog('📅 일일 브리핑 전송 중...', 'push');
      
      const response = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'demo'
        },
        body: JSON.stringify({
          title: '📅 오늘의 주요 뉴스',
          message: `${userPreferences.categories.join(', ')} 분야 주요 뉴스를 요약해드립니다.`,
          icon: '/logo.svg',
          url: window.location.href,
          targetUsers: { tags: ['daily_digest'] }
        })
      });

      const data = await response.json();
      if (response.ok) {
        addLog(`✅ 일일 브리핑 전송 완료 (${data.successCount}명)`, 'push');
      } else {
        addLog(`❌ 브리핑 전송 실패: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ 브리핑 전송 중 오류: ${error}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">📰 뉴스 웹 푸시 데모</h1>
            <p className="text-gray-700">Ridge AI Push SDK를 활용한 뉴스 사이트 실시간 알림 체험</p>
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <span className={`px-3 py-1 rounded-full ${isInitialized ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {isInitialized ? '✅ SDK 초기화됨' : '⏳ SDK 로딩 중'}
              </span>
              <span className={`px-3 py-1 rounded-full ${isSubscribed ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                {isSubscribed ? '🚨 속보 구독 중' : '🔕 미구독'}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                📈 {userPreferences.categories.length}개 카테고리 관심
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-3 space-y-6">
              {/* 구독 상태 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">📱 뉴스 알림 구독</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubscribed ? (
                    <div className="space-y-4">
                      <div className="flex items-center text-green-600">
                        <span className="text-2xl mr-2">✅</span>
                        <span className="text-gray-800">구독 완료! 실시간 뉴스와 개인화 알림을 받아보세요.</span>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700 space-y-2">
                          <div><strong>관심 카테고리:</strong> {userPreferences.categories.join(', ') || '없음'}</div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input type="checkbox" checked={userPreferences.breakingNews} readOnly className="mr-1" />
                              속보 알림
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" checked={userPreferences.dailyDigest} readOnly className="mr-1" />
                              일일 요약
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-800 mb-4">AI 기반 속보, 개인화 뉴스, 일일 브리핑을 받아보세요!</p>
                      <button
                        onClick={subscribeToPush}
                        disabled={!isInitialized}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        🔔 뉴스 알림 구독하기
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 뉴스 헤드라인 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">📰 오늘의 헤드라인</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newsStories.map((story) => (
                    <div key={story.id} className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      story.priority === 'breaking' ? 'border-l-4 border-l-red-500 bg-red-50' :
                      story.priority === 'high' ? 'border-l-4 border-l-orange-500 bg-orange-50' :
                      'hover:shadow-md'
                    } ${story.isRead ? 'opacity-75' : ''}`} onClick={() => readNews(story)}>
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">
                          {story.category === 'technology' ? '🤖' :
                           story.category === 'economy' ? '📈' :
                           story.category === 'politics' ? '🌱' :
                           story.category === 'sports' ? '⚽' : '📰'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {story.priority === 'breaking' && (
                              <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">속보</span>
                            )}
                            {story.priority === 'high' && (
                              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mr-2">주요</span>
                            )}
                            {story.isRead && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-2">읽음</span>
                            )}
                          </div>
                          <h3 className={`text-lg font-bold mb-2 ${
                            story.priority === 'breaking' ? 'text-red-800' : 'text-gray-800'
                          } hover:text-blue-600`}>
                            {story.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">{story.summary}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <span>{story.publishedAt}</span>
                              <span className="mx-2">•</span>
                              <span>{story.readTime}분 읽기</span>
                              <span className="mx-2">•</span>
                              <span>👁 {story.views.toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <span className={`px-2 py-1 rounded ${
                                story.category === 'technology' ? 'bg-blue-100 text-blue-800' :
                                story.category === 'economy' ? 'bg-green-100 text-green-800' :
                                story.category === 'politics' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {story.category}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); bookmarkNews(story); }}
                                className="text-yellow-500 hover:text-yellow-600 text-sm"
                              >
                                🔖
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); shareNews(story, 'twitter'); }}
                                className="text-blue-500 hover:text-blue-600 text-sm"
                              >
                                🐦
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); shareNews(story, 'facebook'); }}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                📘
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 푸시 알림 테스트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">🧪 푸시 알림 테스트</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 mb-4">
                    뉴스 사이트의 다양한 AI 기반 푸시 알림을 체험해보세요:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={sendBreakingNews}
                      disabled={!isSubscribed}
                      className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      🚨 속보 알림
                    </button>
                    <button
                      onClick={sendPersonalizedNews}
                      disabled={!isSubscribed || userPreferences.categories.length === 0}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      🎯 개인화 뉴스 알림
                    </button>
                    <button
                      onClick={sendDailyBrief}
                      disabled={!isSubscribed}
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      📅 일일 브리핑
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* 사이드바 */}
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
                          log.type === 'breaking' ? 'bg-red-100 text-red-900' :
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
                  <CardTitle className="text-gray-800 text-sm">👤 뉴스 선호도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">관심 카테고리</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {userPreferences.categories.length > 0 ? userPreferences.categories.map((category, index) => (
                          <span key={index} className={`text-xs px-2 py-1 rounded ${
                            category === 'technology' ? 'bg-blue-100 text-blue-800' :
                            category === 'economy' ? 'bg-green-100 text-green-800' :
                            category === 'politics' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {category}
                          </span>
                        )) : (
                          <span className="text-gray-500 text-xs">없음</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">알림 설정</div>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center text-xs">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            userPreferences.breakingNews ? 'bg-red-500' : 'bg-gray-300'
                          }`}></span>
                          속보 알림
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            userPreferences.dailyDigest ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></span>
                          일일 요약
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">읽기 통계</div>
                      <div className="text-xs text-gray-600">
                        오늘 {newsStories.filter(s => s.isRead).length}개 뉴스 읽음
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