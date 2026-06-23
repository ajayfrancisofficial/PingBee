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
 * - Listens for foreground notification click events
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

  // Handle FCM messages and Notifee/FCM interactions (clicks and app startup launches)
  useEffect(() => {
    if (!isLoggedIn) return;

    // Helper to process notification navigation
    const handleNotificationNavigation = (data: any, source: string) => {
      if (data && data.chatId && data.name) {
        console.log(
          `[Push] Navigating to Chat from ${source} for chatId:`,
          data.chatId,
        );
        navigate('Chat', {
          chatId: data.chatId as string,
          name: data.name as string,
          avatarUrl: data.avatarUrl as string | undefined,
          chatType: data.chatType as 'individual' | 'group' | undefined,
          otherUserId: data.otherUserId as string | undefined,
        });
      } else {
        console.warn(
          `[Push] Pressed notification from ${source} missing chatId or name in data:`,
          data,
        );
      }
    };

    // 1. Check if app was launched from a killed state by tapping a notification
    const checkInitialNotification = async () => {
      try {
        const initialFcm = await messaging().getInitialNotification();
        if (initialFcm) {
          console.log(
            '[Push] App opened from killed state via FCM notification:',
            initialFcm,
          );
          if (initialFcm.data?.type === 'NEW_MESSAGE') {
            handleNotificationNavigation(initialFcm.data, 'FCM Initial');
          }
        } else {
          console.log('[Push] No initial FCM notification found on boot.');
        }
      } catch (error) {
        console.warn('[Push] Error checking initial notification:', error);
      }
    };

    checkInitialNotification();

    // 2. Handle FCM messages in foreground
    const unsubscribeFcm = messaging().onMessage(async remoteMessage => {
      console.log('[Push] Foreground message received:', remoteMessage);

      // Guard: Ignore empty or system messages (e.g. syncs, deleted messages callbacks)
      const hasNotification = !!remoteMessage.notification;
      const hasData =
        remoteMessage.data && Object.keys(remoteMessage.data).length > 0;
      if (!hasNotification && !hasData) {
        return;
      }

      const type = remoteMessage.data?.type;
      if (!type) {
        console.log('[Push] Foreground message has no type. Skipping.');
        return;
      }

      switch (type) {
        case 'NEW_MESSAGE': {
          // Display foreground notification via Notifee on Android
          if (Platform.OS === 'android') {
            // If the user is currently looking at the Chat screen for this chatId, do not display the notification
            if (navigationRef.isReady()) {
              const currentRoute = navigationRef.getCurrentRoute();
              if (
                currentRoute?.name === 'Chat' &&
                (currentRoute.params as any)?.chatId ===
                  remoteMessage.data?.chatId
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
          break;
        }
        default:
          console.log(`[Push] Unhandled foreground message type: ${type}`);
      }
    });

    // 3. Listen for foreground notification tap events (via Notifee)
    const unsubscribeNotifee = notifee.onForegroundEvent(event => {
      const { type, detail } = event;

      if (type === EventType.PRESS) {
        console.log(
          '[Push Foreground] Notification pressed:',
          detail.notification,
        );
        const n = detail.notification;
        if (n?.data?.type === 'NEW_MESSAGE') {
          handleNotificationNavigation(n.data, 'Notifee Foreground');
        }
      }
    });

    // 4. Listen for FCM OS-displayed notifications pressed while app was in background
    const unsubscribeFcmOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log(
          '[Push FCM] Notification caused app to open from background:',
          remoteMessage,
        );
        if (remoteMessage.data?.type === 'NEW_MESSAGE') {
          handleNotificationNavigation(
            remoteMessage.data,
            'FCM Background Tap',
          );
        }
      },
    );

    return () => {
      unsubscribeFcm();
      unsubscribeNotifee();
      unsubscribeFcmOpened();
    };
  }, [isLoggedIn]);

  return {
    fcmToken,
    deleteToken,
    subscribeToTopic,
    unsubscribeFromTopic,
  };
};
