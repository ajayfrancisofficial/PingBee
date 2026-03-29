import { database } from '../db';
import Message from '../db/models/Message';
import Chat from '../db/models/Chat';
import { performOutgoingSync } from './sync/OutgoingSync';
import type { 
  WSIncomingPayload, 
  WSOutgoingPayload,
  WSReceivedMsg,
  WSEditMsg,
  WSAckEditMsg,
  WSDeleteMsg,
  WSAckDeleteMsg,
  WSTypingMsg,
  WSAckMsg,
  WSMsgStatus
} from '../types/websocket';

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
      case 'SEND_MSG': {
        const p = payload as WSReceivedMsg['payload'];
        await database.write(async () => {
          const messagesCollection = database.get<Message>('messages');
          await messagesCollection.create(msg => {
            msg.chatId = p.chatId;
            msg.senderId = p.senderId;
            msg.text = p.text;
            msg.status = 'sent';
            msg.isMine = false;
            msg.createdAt = new Date(p.createdAt).getTime();
            msg.serverTimestamp = p.serverTimestamp;
            if (p.replyToId) {
              msg.replyToId = p.replyToId;
            }
          });

          const chat = await database.get<Chat>('chats').find(p.chatId);
          await chat.update(c => {
            c.lastMessageText = p.text;
            c.unreadCount += 1;
            c.updatedAt = Date.now();
          });
        });
        break;
      }

      case 'EDIT_MSG': {
        const p = payload as WSEditMsg['payload'];
        await database.write(async () => {
          const message = await database.get<Message>('messages').find(p.id);
          await message.update(m => {
            m.text = p.text;
            m.isEdited = true;
            m.editedAt = new Date(p.editedAt).getTime();
            m.editStatus = 'synced'; // If we receive an edit from others, it's synced
          });

          const chat = await database.get<Chat>('chats').find(message.chatId);
          if (chat.lastMessageText === message.text) {
             await chat.update(c => {
               c.lastMessageText = p.text;
             });
          }
        });
        break;
      }

      case 'ACK_EDIT_MSG': {
        const p = payload as WSAckEditMsg['payload'];
        await database.write(async () => {
          const message = await database.get<Message>('messages').find(p.id);
          await message.update(m => {
            m.editStatus = 'synced';
          });
        });
        break;
      }

      case 'DELETE_MSG': {
        const p = payload as WSDeleteMsg['payload'];
        await database.write(async () => {
          const message = await database.get<Message>('messages').find(p.id);
          await message.update(m => {
            m.isDeleted = true;
            m.deletedAt = new Date(p.deletedAt).getTime();
            m.deleteType = p.deleteType;
            m.deleteStatus = 'synced';
          });

          const chat = await database.get<Chat>('chats').find(message.chatId);
          await chat.update(c => {
            c.lastMessageText = 'This message was deleted';
          });
        });
        break;
      }

      case 'ACK_DELETE_MSG': {
        const p = payload as WSAckDeleteMsg['payload'];
        await database.write(async () => {
          const message = await database.get<Message>('messages').find(p.id);
          await message.update(m => {
            m.deleteStatus = 'synced';
          });
        });
        break;
      }

      case 'TYPING': {
        const p = payload as WSTypingMsg['payload'];
        const { setTyping } = require('../store/chatStore').useChatStore.getState();
        setTyping(p.chatId, p.userId, p.isTyping);
        break;
      }

      case 'ACK_MSG': {
        const p = payload as WSAckMsg['payload'];
        await database.write(async () => {
          const message = await database.get<Message>('messages').find(p.id);
          await message.update(m => {
            m.status = 'sent';
            m.serverTimestamp = p.serverTimestamp;
          });
        });
        break;
      }

      case 'MSG_STATUS': {
        const p = payload as WSMsgStatus['payload'];
        await database.write(async () => {
          const message = await database
            .get<Message>('messages')
            .find(p.messageId);
          await message.update(m => {
            m.status = p.status;
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
