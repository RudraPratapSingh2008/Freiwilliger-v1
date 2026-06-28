import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../lib/firebase';
import axios from '../lib/axios';

let messaging = null;

try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn('Firebase messaging not supported:', e.message);
}

export async function requestNotificationPermission() {
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) return;

    const token = await getToken(messaging, { vapidKey });
    if (token) {
      await axios.post('/users/me/fcm-token', { token });
    }
  } catch (error) {
    console.error('FCM permission/token error:', error);
  }
}

export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
