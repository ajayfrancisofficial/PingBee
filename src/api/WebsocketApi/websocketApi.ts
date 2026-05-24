import { setWsDisconnectedAt } from '../../utils/syncStorage';
import { websocketService } from '../../services/Websocket/websocketService';
import { authService } from '../../services/Auth/authService';
import { snackbar } from '../../components/foundations/Snackbar';
import type {
  WsServerMessage,
  WsClientMessage,
} from '../../types/ApiTypes/WsApiTypes/wsApitypes';
import { WS_BASE_URL } from '../RESTApi/endpoints';

let socket: WebSocket | null = null;
let isConnected: boolean = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let shouldReconnect: boolean = true;
const reconnectInterval: number = 3000;
let currentToken: string | null = null;
let retryCount: number = 0;
const MAX_RETRIES: number = 5;

export const websocketApi = {
  /** Check if the WebSocket is currently connected */
  getIsConnected: (): boolean => isConnected,

  connect: async () => {
    // If it's the initial connection attempt, refresh the token first
    if (retryCount === 0) {
      try {
        console.log('[websocketApi] Initial load: Refreshing token...');
        const newToken = await authService.refreshToken();
        currentToken = newToken;
      } catch (error) {
        console.error(
          '[websocketApi] Token refresh failed on initial load:',
          error,
        );
        // Error already handled (snackbar + logout) inside authService.refreshToken
        return;
      }
    }

    if (!currentToken) {
      console.error('[websocketApi] Cannot connect: No token available');
      return;
    }

    shouldReconnect = true;
    const url = `${WS_BASE_URL}?token=${currentToken}`;

    console.log('[websocketApi] Connecting...');

    if (socket) {
      console.log('[websocketApi] Closing existing socket before reconnecting');
      socket.close();
    }

    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('[websocketApi] ✅ Connected');
      isConnected = true;
      retryCount = 0; // Reset retry count upon successful connection
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      // Delegate "on-connect" logic to the service
      websocketService.handleConnectionSuccess();
    };

    socket.onmessage = event => {
      try {
        const parsedData: WsServerMessage = JSON.parse(event.data);
        console.log('[websocketApi] Received message:', parsedData);
        // Delegate message handling to the service
        websocketService.handleIncomingMessage(parsedData);
      } catch (e) {
        console.warn('[websocketApi] Failed to parse message', e);
      }
    };

    socket.onclose = event => {
      isConnected = false;
      console.log(`[websocketApi] ❌ Disconnected (Code: ${event.code})`);

      // Record the disconnect time so IncomingSync can skip if reconnect was brief
      setWsDisconnectedAt(Date.now());

      if (shouldReconnect) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(
            `[websocketApi] Reconnecting (Attempt ${retryCount}/${MAX_RETRIES}) in ${reconnectInterval}ms...`,
          );
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            websocketApi.connect();
          }, reconnectInterval);
        } else {
          console.error(
            '[websocketApi] Max retries reached. Stopping reconnection.',
          );
          snackbar.show({
            message: 'Unable to connect to server. Please Try again later',
            type: 'error',
          });
        }
      }
    };

    socket.onerror = error => {
      console.error('[websocketApi] Error:', error);
    };
  },

  disconnect: () => {
    console.log('[websocketApi] Manually disconnecting...');
    shouldReconnect = false;
    currentToken = null;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    retryCount = 0;
    if (socket) {
      socket.close();
      socket = null;
    }
    isConnected = false;
  },

  sendRaw: (data: WsClientMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('[websocketApi] Sending raw data:', data);
      socket.send(JSON.stringify(data));
    } else {
      console.warn('[websocketApi] Cannot send, socket not connected');
    }
  },
};
