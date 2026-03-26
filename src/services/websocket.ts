import { database } from '../db';
import Message from '../db/models/Message';

export type MessageCallback = (data: any) => void;

let socket: WebSocket | null = null;
const url = 'wss://echo.websocket.org';
const listeners: Map<string, MessageCallback[]> = new Map();
const reconnectInterval: number = 3000;
let isConnected: boolean = false;

const emit = (event: string, data: any) => {
  const eventListeners = listeners.get(event);
  if (eventListeners) {
    eventListeners.forEach(callback => callback(data));
  }
};

const handleIncomingMessage = async (data: any) => {
  const { type, payload } = data;

  try {
    switch (type) {
      case 'MSG':
        await database.write(async () => {
          const messagesCollection = database.get<Message>('messages');
          await messagesCollection.create(msg => {
            msg.chatId = payload.chatId;
            msg.senderId = payload.senderId;
            msg.text = payload.text;
            msg.status = 'sent';
            msg.isMine = false;
            msg.createdAt = new Date(payload.createdAt).getTime();
            msg.serverTimestamp = payload.serverTimestamp;
          });

          const chat = await database.get<any>('chats').find(payload.chatId);
          await chat.update((c: any) => {
            c.lastMessageId = payload.id;
            c.unreadCount += 1;
            c.updatedAt = Date.now();
          });
        });
        break;

      case 'ACK':
        const { tempId, serverTimestamp } = payload;
        await database.write(async () => {
          const message = await database.get<Message>('messages').find(tempId);
          await message.update(m => {
            m.status = 'sent';
            m.serverTimestamp = serverTimestamp;
          });
        });
        break;

      default:
        console.log('[WebSocket] Unknown message type:', type);
    }
  } catch (error) {
    console.error('[WebSocket] Error processing incoming message:', error);
  }
};

export const connect = () => {
  console.log('[WebSocket] Connecting to:', url);
  
  socket = new WebSocket(url);
  
  socket.onopen = () => {
    console.log('[WebSocket] Connected');
    isConnected = true;
    emit('onConnect', null);
  };

  socket.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      handleIncomingMessage(parsedData);
      emit('onMessage', parsedData);
    } catch(e) {
      console.warn('Failed to parse WebSocket message', e);
    }
  };

  socket.onclose = () => {
    console.log('[WebSocket] Disconnected. Reconnecting in', reconnectInterval);
    isConnected = false;
    emit('onDisconnect', null);
    setTimeout(() => connect(), reconnectInterval);
  };
};

export const disconnect = () => {
  if (socket) {
    socket.close();
  }
  isConnected = false;
};

export const onMessage = (event: 'onConnect' | 'onDisconnect' | 'onMessage', callback: MessageCallback) => {
  if (!listeners.has(event)) {
    listeners.set(event, []);
  }
  listeners.get(event)?.push(callback);
  return () => offMessage(event, callback);
};

export const offMessage = (event: string, callback: MessageCallback) => {
  const eventListeners = listeners.get(event);
  if (eventListeners) {
    listeners.set(event, eventListeners.filter(cb => cb !== callback));
  }
};

export const sendMessage = (data: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn('[WebSocket] Cannot send, socket not connected');
  }
};
