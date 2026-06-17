import { setWsDisconnectedAt } from '../../utils/syncStorage';
import { websocketService } from '../../services/Websocket/websocketService';
import { authService } from '../../services/Auth/authService';
import { useOnlineUsersStore } from '../../store/onlineUsersStore';
import type {
  WsServerMessage,
  WsClientMessage,
} from '../../types/ApiTypes/WsApiTypes/wsApitypes';
import { WS_BASE_URL } from '../RESTApi/endpoints';

const MAX_RETRIES = 3;
const RECONNECT_DELAY = 3000;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private shouldReconnect: boolean = true;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private retryCount: number = 0;
  private currentToken: string | null = null;

  async connect(force: boolean = false): Promise<void> {
    if (this.isConnected && !force) {
      console.log('[WebSocketManager] Already connected. Skipping.');
      return;
    }

    if (this.isConnecting) {
      console.log(
        '[WebSocketManager] Connection attempt already in progress. Skipping.',
      );
      return;
    }

    this.isConnecting = true;

    if (force) {
      console.log(
        '[WebSocketManager] Force connect requested. Resetting state.',
      );
      this.retryCount = 0;
      this.shouldReconnect = true;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }

    if (this.retryCount === 0) {
      try {
        console.log('[WebSocketManager] Refreshing token...');
        const newToken = await authService.refreshToken();
        this.currentToken = newToken;
      } catch (error) {
        console.error('[WebSocketManager] Token refresh failed:', error);
        this.isConnecting = false;
        return;
      }
    }

    if (!this.currentToken) {
      console.error('[WebSocketManager] Cannot connect: No token available.');
      this.isConnecting = false;
      return;
    }

    this.shouldReconnect = true;

    if (this.socket) {
      console.log(
        '[WebSocketManager] Closing existing socket before reconnecting.',
      );
      this.socket.close();
      this.socket = null;
    }

    const url = `${WS_BASE_URL}?token=${this.currentToken}`;
    console.log('[WebSocketManager] Connecting...');

    this.socket = new WebSocket(url);
    this.socket.onopen = () => this.handleOpen();
    this.socket.onmessage = (event: WebSocketMessageEvent) =>
      this.handleMessage(event);
    this.socket.onclose = (event: WebSocketCloseEvent) =>
      this.handleClose(event);
    this.socket.onerror = (error: WebSocketErrorEvent) =>
      this.handleError(error);
  }

  disconnect(): void {
    console.log('[WebSocketManager] Disconnecting...');
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.retryCount = 0;
    this.currentToken = null;

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.isConnected = false;
  }

  send(data: WsClientMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('[WebSocketManager] ⬆️ Sending:', data);
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocketManager] Cannot send: socket is not open.');
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  private handleOpen(): void {
    console.log('[WebSocketManager] ✅ Connected.');
    this.isConnected = true;
    this.isConnecting = false;
    this.retryCount = 0;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    websocketService.handleConnectionSuccess();
  }

  private handleMessage(event: WebSocketMessageEvent): void {
    try {
      const parsedData: WsServerMessage = JSON.parse(event.data as string);
      console.log('[WebSocketManager] ⬇️ Received:', parsedData);
      websocketService.handleIncomingMessage(parsedData);
    } catch {
      console.warn('[WebSocketManager] Failed to parse incoming message.');
    }
  }

  private handleClose(event: WebSocketCloseEvent): void {
    this.isConnected = false;
    this.isConnecting = false;
    useOnlineUsersStore.getState().clearOnlineUsers();
    console.log(
      `[WebSocketManager] ❌ Disconnected (Code: ${event.code ?? 'unknown'}).`,
    );

    setWsDisconnectedAt(Date.now());

    if (this.shouldReconnect && this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `[WebSocketManager] Reconnecting attempt ${this.retryCount}/${MAX_RETRIES} in ${RECONNECT_DELAY}ms...`,
      );
      this.reconnectTimer = setTimeout(() => this.connect(), RECONNECT_DELAY);
    } else if (this.retryCount >= MAX_RETRIES) {
      console.log(
        '[WebSocketManager] Max retries reached. Stopping reconnection.',
      );
    }
  }

  private handleError(error: WebSocketErrorEvent): void {
    console.error('[WebSocketManager] Error:', error);
    this.isConnecting = false;
  }
}

export const websocketApi = new WebSocketManager();
