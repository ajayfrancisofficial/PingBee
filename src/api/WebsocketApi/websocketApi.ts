import { setWsDisconnectedAt } from '../../utils/syncStorage';
import { websocketService } from '../../services/Websocket/websocketService';
import type {
  WSIncomingPayload,
  WSOutgoingPayload,
} from '../../types/websocket';
import { WS_BASE_URL } from '../RESTApi/endpoints';

let socket: WebSocket | null = null;
let isConnected: boolean = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let shouldReconnect: boolean = true;
const reconnectInterval: number = 3000;
let currentToken: string | null = null;

export const websocketApi = {
  /** Check if the WebSocket is currently connected */
  getIsConnected: (): boolean => isConnected,

  connect: (token: string) => {
    if (!token) {
      console.error('[websocketApi] Cannot connect: No token provided');
      return;
    }

    currentToken = token;
    shouldReconnect = true;
    const url = `${WS_BASE_URL}?token=${token}`;

    console.log('[websocketApi] Connecting...');

    if (socket) {
      console.log('[websocketApi] Closing existing socket before reconnecting');
      socket.close();
    }

    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('[websocketApi] ✅ Connected');
      isConnected = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      // Delegate "on-connect" logic to the service
      websocketService.handleConnectionSuccess();
    };

    socket.onmessage = event => {
      try {
        const parsedData: WSIncomingPayload = JSON.parse(event.data);
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
        console.log(`[websocketApi] Reconnecting in ${reconnectInterval}ms...`);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          if (currentToken) websocketApi.connect(currentToken);
        }, reconnectInterval);
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
    if (socket) {
      socket.close();
      socket = null;
    }
    isConnected = false;
  },

  sendRaw: (data: WSOutgoingPayload) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn('[websocketApi] Cannot send, socket not connected');
    }
  },
};
