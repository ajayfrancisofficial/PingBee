import { useEffect, useRef, useCallback, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { pushNotificationApi } from '../api/RESTApi/pushNotificationApi';

/**
 * Hook that manages the FCM token lifecycle:
 * - Gets the FCM token and saves it to the backend
 * - Listens for token refresh events and re-saves
 * - Provides a `deleteToken` function for logout cleanup
 *
 * @param isActive - Whether the hook should be active (typically `isLoggedIn`)
 */
// Cache to keep track of the last successfully saved token across component unmounts/remounts
let globalLastSavedToken: string | null = null;

export const useFcmToken = (isActive: boolean) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  /**
   * Get the current FCM token and save it to the backend.
   */
  const getAndSaveToken = useCallback(async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        tokenRef.current = token;
        setFcmToken(token);

        if (token === globalLastSavedToken) {
          return;
        }

        // Save to backend
        try {
          globalLastSavedToken = token;
          await pushNotificationApi.saveFcmToken({
            token: token,
          });
        } catch (apiError) {
          globalLastSavedToken = null;
          console.warn('[FCM] Failed to save token to server:', apiError);
        }
      }
    } catch (error) {
      console.warn('[FCM] Failed to get token:', error);
    }
  }, []);

  /**
   * Delete the FCM token from both the server and Firebase.
   * Should be called during logout.
   */
  const deleteToken = useCallback(async () => {
    try {
      const currentToken = tokenRef.current ?? (await messaging().getToken());

      if (currentToken) {
        // Remove from backend
        try {
          await pushNotificationApi.deleteFcmToken({
            token: currentToken,
          });
        } catch (apiError) {
          console.warn('[FCM] Failed to delete token from server:', apiError);
        }

        // Invalidate on Firebase
        await messaging().deleteToken();
      }

      globalLastSavedToken = null;
      tokenRef.current = null;
      setFcmToken(null);
    } catch (error) {
      console.warn('[FCM] Token deletion failed:', error);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Get and save the initial token
    getAndSaveToken();

    // Listen for token refresh events
    const unsubscribeRefresh = messaging().onTokenRefresh(
      async (newToken: string) => {
        // Prevent duplicate calls if the token is already the same
        if (
          newToken === tokenRef.current ||
          newToken === globalLastSavedToken
        ) {
          return;
        }

        tokenRef.current = newToken;
        setFcmToken(newToken);

        try {
          await pushNotificationApi.saveFcmToken({
            token: newToken,
          });
          globalLastSavedToken = newToken;
        } catch (apiError) {
          console.warn(
            '[FCM] Failed to save refreshed token to server:',
            apiError,
          );
        }
      },
    );

    return () => {
      unsubscribeRefresh();
    };
  }, [isActive, getAndSaveToken]);

  return { fcmToken, deleteToken };
};
