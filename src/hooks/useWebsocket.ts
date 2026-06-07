import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { websocketApi } from '../api/WebsocketApi/websocketApi';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to manage the WebSocket lifecycle.
 * Should be called in a component that is mounted when the user is authenticated (e.g., AppStack).
 */
export const useWebsocket = () => {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;
    websocketApi.connect(true);

    // Reconnect to WebSocket when we come back online
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        if (!websocketApi.getIsConnected()) {
          websocketApi.connect(true);
        }
      }
    });

    return () => {
      unsubscribe();
      websocketApi.disconnect();
    };
  }, [isLoggedIn]);
};
