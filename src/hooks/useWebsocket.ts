import { useEffect } from 'react';
import { websocketApi } from '../api/WebsocketApi/websocketApi';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to manage the WebSocket lifecycle.
 * Should be called in a component that is mounted when the user is authenticated (e.g., AppStack).
 *
 * Network-change reconnection is handled globally in networkStore.
 */
export const useWebsocket = () => {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;
    websocketApi.connect(true);

    return () => {
      websocketApi.disconnect();
    };
  }, [isLoggedIn]);
};
