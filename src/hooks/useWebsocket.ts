import { useEffect } from 'react';
import * as Keychain from 'react-native-keychain';
import { websocketApi } from '../api/WebsocketApi/websocketApi';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to manage the WebSocket lifecycle.
 * Should be called in a component that is mounted when the user is authenticated (e.g., AppStack).
 */
export const useWebsocket = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    let isMounted = true;

    const startWebsocket = async () => {
      if (!isLoggedIn) return;

      try {
        console.log('[useWebsocket] Fetching token for connection...');
        const credentials = await Keychain.getGenericPassword({
          service: 'accessToken',
        });

        if (credentials && isMounted) {
          websocketApi.connect(credentials.password);
        } else if (!credentials) {
          console.warn('[useWebsocket] No access token found in keychain');
        }
      } catch (error) {
        console.error('[useWebsocket] Error fetching token:', error);
      }
    };

    startWebsocket();

    return () => {
      isMounted = false;
      console.log('[useWebsocket] Component unmounting, disconnecting...');
      websocketApi.disconnect();
    };
  }, [isLoggedIn]);
};
