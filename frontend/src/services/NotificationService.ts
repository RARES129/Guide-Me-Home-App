import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import { DEFAULT_BACKEND_API_URL } from '../ProjectDefaults';
import { getUserIdWithGivenToken } from './tokenDecoder';

// Functie pentru inițializarea notificărilor push
export const initializePushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.warn('Push Notifications are only supported on native platforms.');
    return null;
  }

  // Cerere permisiune pentru notificări
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') {
    console.warn('Push notification permissions not granted.');
    return null;
  }

  // Înregistrare pentru notificări push
  await PushNotifications.register();

  // Obține token-ul FCM generat
  const token = await new Promise<string | null>((resolve) => {
    PushNotifications.addListener('registration', (token) => {
      resolve(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error during FCM registration:', error);
      resolve(null);
    });
  });

  if (!token) {
    console.error('FCM token could not be generated.');
    return null;
  }

  console.log('Generated FCM token:', token);
  return token;
};

// Functie pentru trimiterea token-ului FCM către server
export const sendFcmTokenToServer = async (accessToken: string, fcmToken: string) => {
  try {
    const userId = getUserIdWithGivenToken(accessToken);

    await axios.post(
      `${DEFAULT_BACKEND_API_URL}/api/v1/user/fcmToken`,
      {
        userId,
        fcmToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('FCM token sent to the server successfully.');
  } catch (error) {
    console.error('Error sending FCM token to the server:', error);
  }
};

export const clearFcmToken = async (accessToken: string) => {
    try {
      const userId = getUserIdWithGivenToken(accessToken);
  
      await axios.delete(`${DEFAULT_BACKEND_API_URL}/api/v1/user/fcmToken`, {
        data: { userId },
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('FCM token cleared from server.');
    } catch (error) {
      console.error('Error clearing FCM token:', error);
    }
  };
  

// Gestionare notificări primite
export const setupNotificationListeners = () => {
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification received:', notification);

    // Poți actualiza aici starea aplicației sau afișa o alertă
    alert(`New Notification: ${notification.title}\n${notification.body}`);
  });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Notification action performed:', action);
  });
};
