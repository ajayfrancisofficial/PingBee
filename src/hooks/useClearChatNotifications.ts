import { useEffect } from 'react';
import notifee from '@notifee/react-native';

/**
 * Custom hook to clear displayed push notifications associated with a specific chat.
 * Retrieves all currently displayed notifications via Notifee, filters by the chat's ID,
 * and cancels them.
 *
 * @param chatId - The ID of the chat for which to clear notifications.
 */
export const useClearChatNotifications = (chatId: string) => {
  useEffect(() => {
    if (!chatId) return;

    const clearNotifications = async () => {
      try {
        const displayed = await notifee.getDisplayedNotifications();
        const chatNotifications = displayed.filter(
          item => item.notification.data?.chatId === chatId,
        );
        for (const item of chatNotifications) {
          if (item.id) {
            await notifee.cancelNotification(item.id);
          }
        }
      } catch (error) {
        console.warn('[Push] Error clearing chat notifications:', error);
      }
    };

    clearNotifications();
  }, [chatId]);
};
