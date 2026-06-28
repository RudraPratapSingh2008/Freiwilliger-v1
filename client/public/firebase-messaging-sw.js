/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: self.__FIREBASE_CONFIG__?.apiKey || '',
  authDomain: self.__FIREBASE_CONFIG__?.authDomain || '',
  projectId: self.__FIREBASE_CONFIG__?.projectId || '',
  appId: self.__FIREBASE_CONFIG__?.appId || '',
  messagingSenderId: self.__FIREBASE_CONFIG__?.messagingSenderId || '',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || 'Freiwilliger', {
    body: body || 'You have a new notification',
    icon: '/pwa-192x192.png',
    data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  let url = '/dashboard';

  if (data.type === 'new_message' && data.resourceId) url = '/messages';
  else if (data.type === 'selected' && data.resourceId) url = `/events/${data.resourceId}`;
  else if (data.type === 'contact_request:received' && data.resourceId) url = `/contact-requests/${data.resourceId}/review`;

  event.waitUntil(clients.openWindow(url));
});
