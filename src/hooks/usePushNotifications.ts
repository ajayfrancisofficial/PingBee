import { useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { useFcmToken } from './useFcmToken';
import { navigate, navigationRef } from '../navigation/navigationRef';

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

  // Handle FCM messages and Notifee interactions (clicks and app startup launches)
  useEffect(() => {
    if (!isLoggedIn) return;

    // 1. Check if app was launched from a killed state by tapping a notification
    const checkInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        console.log(
          '[Push] App opened from killed state via notification:',
          initialNotification,
        );
        const { notification } = initialNotification;
        const data = notification?.data;
        if (data && data.chatId) {
          console.log(
            '[Push] Navigating to chat from initial notification:',
            data.chatId,
          );
          // Add a small delay to ensure navigation container is fully mounted and ready
          setTimeout(() => {
            navigate('Chat', {
              chatId: data.chatId as string,
              name: data.name as string,
              avatarUrl: data.avatarUrl as string | undefined,
              chatType: data.chatType as 'individual' | 'group' | undefined,
              otherUserId: data.otherUserId as string | undefined,
            });
          }, 500);
        }
      }
    };

    checkInitialNotification();

    // 2. Handle FCM messages in foreground
    const unsubscribeFcm = messaging().onMessage(async remoteMessage => {
      console.log('[Push] Foreground message received:', remoteMessage);

      // Display foreground notification via Notifee on Android
      if (Platform.OS === 'android') {
        // If the user is currently looking at the Chat screen for this chatId, do not display the notification
        if (navigationRef.isReady()) {
          const currentRoute = navigationRef.getCurrentRoute();
          if (
            currentRoute?.name === 'Chat' &&
            (currentRoute.params as any)?.chatId === remoteMessage.data?.chatId
          ) {
            return;
          }
        }

        const { title, body } = remoteMessage.notification || {};

        try {
          await notifee.displayNotification({
            title: title || 'New Message',
            body: body || '',
            data: remoteMessage.data,
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

    // 3. Listen for foreground notification tap events
    const unsubscribeNotifee = notifee.onForegroundEvent(event => {
      const { type, detail } = event;

      if (type === EventType.PRESS) {
        console.log(
          '[Push] Foreground notification pressed:',
          detail.notification,
        );
        const data = detail.notification?.data;
        if (data && data.chatId) {
          navigate('Chat', {
            chatId: data.chatId as string,
            name: data.name as string,
            avatarUrl: data.avatarUrl as string | undefined,
            chatType: data.chatType as 'individual' | 'group' | undefined,
            otherUserId: data.otherUserId as string | undefined,
          });
        }
      }
    });

    return () => {
      unsubscribeFcm();
      unsubscribeNotifee();
    };
  }, [isLoggedIn]);

  return {
    fcmToken,
    deleteToken,
    subscribeToTopic,
    unsubscribeFromTopic,
  };
};
