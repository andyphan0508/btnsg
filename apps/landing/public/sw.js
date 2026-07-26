/* Service Worker — nhận thông báo đẩy cho Ban Thanh Niên.
   File này phải nằm ở gốc site (/sw.js) để có quyền điều khiển toàn trang. */

self.addEventListener('install', () => {
  // Kích hoạt bản mới ngay, không chờ tab cũ đóng.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Ban Thanh Niên', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Ban Thanh Niên Sài Gòn';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    // Gom thông báo cùng nhóm để không spam màn hình khoá
    tag: data.tag || 'btnsg-notify',
    renotify: true,
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Đang mở tab của site rồi → chuyển tab đó tới đúng trang, không mở tab mới.
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
