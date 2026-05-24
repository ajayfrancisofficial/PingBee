import { useEffect } from 'react';
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
      if (isMounted) {
        websocketApi.connect();
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
