import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { websocketApi } from '../api/WebsocketApi/websocketApi';
import { useAuthStore } from './authStore';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

export const useNetworkStore = create<NetworkState>(() => ({
  isConnected: true,
  isInternetReachable: null,
}));

/**
 * Starts the global NetInfo listener. Must be called once at app boot.
 * Handles:
 *  - Updating global network state (isConnected, isInternetReachable)
 *  - Reconnecting the WebSocket when coming back online
 *
 * Add future global network reactions here instead of creating new listeners.
 */
export function startNetworkListener() {
  NetInfo.addEventListener((state: NetInfoState) => {
    const wasConnected = useNetworkStore.getState().isConnected;
    const isNowConnected = !!state.isConnected;
    const isInternetReachable = state.isInternetReachable ?? null;

    useNetworkStore.setState({
      isConnected: isNowConnected,
      isInternetReachable,
    });

    // Reconnect WebSocket when transitioning from offline → online
    if (isNowConnected && !wasConnected) {
      const { isLoggedIn } = useAuthStore.getState();
      if (isLoggedIn && !websocketApi.getIsConnected()) {
        websocketApi.connect(true);
      }
    }
  });
}
