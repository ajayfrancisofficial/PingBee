export type MessageCallback = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, MessageCallback[]> = new Map();
  private reconnectInterval: number = 3000;
  private mockInterval: ReturnType<typeof setInterval> | null = null;
  private isConnected: boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    console.log('[WebSocket] Connecting to:', this.url);
    
    // For now we'll simulate a connection since we only have dummy data
    // In production, uncomment the native WebSocket usage:
    /*
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('[WebSocket] Connected');
      this.isConnected = true;
      this.emit('onConnect', null);
    };

    this.socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        this.emit('onMessage', parsedData);
      } catch(e) {
        console.warn('Failed to parse WebSocket message', e);
      }
    };

    this.socket.onclose = () => {
      console.log('[WebSocket] Disconnected. Reconnecting in', this.reconnectInterval);
      this.isConnected = false;
      this.emit('onDisconnect', null);
      setTimeout(() => this.connect(), this.reconnectInterval);
    };
    */
    
    // --- MOCK CONNECTION FOR TESTING ---
    setTimeout(() => {
      console.log('[WebSocket] Mock Connected');
      this.isConnected = true;
      this.emit('onConnect', null);
      this.startMockMessages();
    }, 1000);
  }

  private startMockMessages() {
    if (this.mockInterval) clearInterval(this.mockInterval);
    // Every 10 seconds, receive a new dummy message for chat "1"
    this.mockInterval = setInterval(() => {
      const mockMsg = {
        id: Math.random().toString(36).substring(7),
        chatId: '1', // Default dummy chat ID, update based on realistic data if needed
        text: 'This is a mock real-time message at ' + new Date().toLocaleTimeString(),
        senderId: '2', // Someone else
        createdAt: new Date().toISOString(),
      };
      this.emit('onMessage', mockMsg);
    }, 10000); 
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
    }
    this.isConnected = false;
  }

  on(event: 'onConnect' | 'onDisconnect' | 'onMessage', callback: MessageCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: MessageCallback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(cb => cb !== callback));
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.log('[WebSocket] Mock send:', data);
      // Mock echo back after a delay
      setTimeout(() => {
        this.emit('onMessage', { ...data, id: Math.random().toString(), createdAt: new Date().toISOString() });
      }, 500);
    }
  }
}

// Export a singleton instance. Change URL to actual wss:// endpoint later
export const socketService = new WebSocketService('wss://echo.websocket.org');
