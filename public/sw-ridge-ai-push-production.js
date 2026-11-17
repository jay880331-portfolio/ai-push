// Ridge AI Push Service Worker (Production)
// 고객은 이 파일을 자신의 웹사이트 루트에 배치해야 합니다.

const API_BASE_URL = 'https://ai-push.ridge-it.site/api'; // 프로덕션 API URL

self.addEventListener('push', function(event) {
  console.log('푸시 메시지 수신:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: '알림', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || '새로운 알림이 도착했습니다',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    image: data.image,
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: true,
    tag: data.tag || 'ridge-ai-push'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '알림', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('알림 클릭됨:', event);
  
  event.notification.close();

  const data = event.notification.data;
  const url = data.url || event.notification.data.url || '/';

  // 클릭 이벤트 추적
  if (data.campaignId) {
    fetch(API_BASE_URL + '/events/push-clicked', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // API 키는 클라이언트에서 전송하지 않음 (보안상)
      },
      body: JSON.stringify({
        campaignId: data.campaignId,
        companyId: data.companyId,
        timestamp: new Date().toISOString(),
        channel: 'web'
      })
    }).catch(console.error);
  }

  // URL 열기
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // 이미 열린 탭이 있으면 포커스
        for (let client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 새 탭에서 열기
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('알림 닫힘:', event);
});