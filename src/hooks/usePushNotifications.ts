import { useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { useFcmToken } from './useFcmToken';

/**
 * Custom hook to orchestrate push notification setup:
 * - Requests Android notification permissions (API 33+)
 * - Configures Notifee notification channel for Android
 * - Sets up FCM foreground message handler to display notifications via Notifee
 * - Listens for foreground notification click events (placeholder for deep-linking)
 * - Returns FCM token management functions (token lifecycle, delete token)
 */
export const usePushNotifications = (isLoggedIn: boolean) => {
  const { fcmToken, deleteToken } = useFcmToken(isLoggedIn);

  /**
   * Request Android runtime permission for POST_NOTIFICATIONS (required for API 33+ / Android 13)
   */
  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      if (Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (!hasPermission) {
          console.log('[Push] Requesting POST_NOTIFICATIONS permission...');
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('[Push] POST_NOTIFICATIONS permission granted');
          } else {
            console.warn('[Push] POST_NOTIFICATIONS permission denied');
          }
        }
      }
    } catch (error) {
      console.warn('[Push] Error requesting notification permission:', error);
    }
  }, []);

  /**
   * Create Notifee notification channel for Android (essential for displaying notifications)
   */
  const createChannel = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      await notifee.createChannel({
        id: 'pingbee-messages',
        name: 'PingBee Messages',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    } catch (error) {
      console.warn('[Push] Error creating Notifee channel:', error);
    }
  }, []);

  /**
   * Subscribe to a specific FCM topic.
   */
  const subscribeToTopic = useCallback(async (topic: string) => {
    try {
      await messaging().subscribeToTopic(topic);
    } catch (error) {
      console.warn(`[Push] Error subscribing to topic ${topic}:`, error);
    }
  }, []);

  /**
   * Unsubscribe from a specific FCM topic.
   */
  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
    } catch (error) {
      console.warn(`[Push] Error unsubscribing from topic ${topic}:`, error);
    }
  }, []);

  // Initialize permissions, notification channel, and default topic when user logs in
  useEffect(() => {
    if (!isLoggedIn) return;

    const init = async () => {
      await requestPermission();
      await createChannel();
      await subscribeToTopic('global');
    };

    init();
  }, [isLoggedIn, requestPermission, createChannel, subscribeToTopic]);

  // Handle FCM messages in foreground
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('[Push] Foreground message received:', remoteMessage);

      // Display foreground notification via Notifee on Android
      if (Platform.OS === 'android') {
        const { title, body } = remoteMessage.notification || {};

        try {
          await notifee.displayNotification({
            title: title || 'New Message',
            body: body || '',
            android: {
              channelId: 'pingbee-messages',
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
            },
          });
        } catch (error) {
          console.warn(
            '[Push] Failed to display notification via Notifee:',
            error,
          );
        }
      }
    });

    return unsubscribe;
  }, [isLoggedIn]);

  // Handle Notifee foreground events (e.g. notification click)
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribeForeground = notifee.onForegroundEvent(event => {
      const { type, detail } = event;

      if (type === EventType.PRESS) {
        console.log(
          '[Push] Foreground notification pressed:',
          detail.notification,
        );
        // TODO: Implement deep-linking / navigation later (leave space for it)
      }
    });

    return () => {
      unsubscribeForeground();
    };
  }, [isLoggedIn]);

  return {
    fcmToken,
    deleteToken,
    subscribeToTopic,
    unsubscribeFromTopic,
  };
};
