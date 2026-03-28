import { database } from '../db';
import Message from '../db/models/Message';
import Chat from '../db/models/Chat';
import { performOutgoingSync } from './sync/OutgoingSync';
import type { WSIncomingPayload, WSOutgoingPayload } from '../types/websocket';

let socket: WebSocket | null = null;
const url = 'wss://echo.websocket.org';
const reconnectInterval: number = 3000;
let isConnected: boolean = false;

/** Check if the WebSocket is currently connected */
export const getIsConnected = (): boolean => isConnected;

const handleIncomingMessage = async (data: WSIncomingPayload) => {
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
            if (payload.replyToId) {
              msg.replyToId = payload.replyToId;
            }
          });

          const chat = await database.get<Chat>('chats').find(payload.chatId);
          await chat.update(c => {
            c.lastMessageText = payload.text;
            c.unreadCount += 1;
            c.updatedAt = Date.now();
          });
        });
        break;

      case 'ACK': {
        const { tempId, serverTimestamp } = payload;
        await database.write(async () => {
          const message = await database.get<Message>('messages').find(tempId);
          await message.update(m => {
            m.status = 'sent';
            m.serverTimestamp = serverTimestamp;
          });
        });
        break;
      }

      case 'STATUS': {
        const { messageId, status } = payload;
        await database.write(async () => {
          const message = await database
            .get<Message>('messages')
            .find(messageId);
          await message.update(m => {
            m.status = status;
          });
        });
        break;
      }

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

    // Retry any messages that were queued while offline
    performOutgoingSync();
  };

  socket.onmessage = event => {
    try {
      const parsedData: WSIncomingPayload = JSON.parse(event.data);
      handleIncomingMessage(parsedData);
    } catch (e) {
      console.warn('Failed to parse WebSocket message', e);
    }
  };

  socket.onclose = () => {
    console.log('[WebSocket] Disconnected. Reconnecting in', reconnectInterval);
    isConnected = false;
    setTimeout(() => connect(), reconnectInterval);
  };
};

export const disconnect = () => {
  if (socket) {
    socket.close();
  }
  isConnected = false;
};

/** Low-level WebSocket send. Use messageController.sendMessage() for sending chat messages. */
export const sendRaw = (data: WSOutgoingPayload) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn('[WebSocket] Cannot send, socket not connected');
  }
};
