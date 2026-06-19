import { useEffect } from 'react';
import notifee from '@notifee/react-native';

/**
 * Custom hook to clear all displayed notifications from the system tray when entering a chat.
 */
export const useClearChatNotifications = () => {
  useEffect(() => {
    const clearNotifications = async () => {
      try {
        await notifee.cancelAllNotifications();
      } catch (error) {
        console.warn('[Push] Error clearing notifications:', error);
      }
    };

    clearNotifications();
  }, []);
};
