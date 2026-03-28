import { IMessage } from 'react-native-gifted-chat';
import { database } from '../db';
import Message from '../db/models/Message';
import { useUserStore } from '../store/userStore';
import { sendRaw, getIsConnected } from './websocket';
import type { WSOutgoingMsg } from '../types/websocket';

/**
 * Detect media type from an IMessage's optional fields.
 */
const getMediaInfo = (
  message: IMessage,
): { mediaUrl?: string; mediaType?: 'image' | 'video' | 'file' } => {
  if (message.image) {
    return { mediaUrl: message.image, mediaType: 'image' };
  }
  if (message.video) {
    return { mediaUrl: message.video, mediaType: 'video' };
  }
  return {};
};

/**
 * Format a WatermelonDB Message record into the WebSocket MSG payload.
 * This is also used by OutgoingSync to retry pending messages.
 */
export const formatMessagePayload = (message: Message): WSOutgoingMsg => ({
  type: 'MSG',
  payload: {
    tempId: message.id,
    chatId: message.chatId,
    text: message.text,
    senderId: message.senderId,
    createdAt: new Date(message.createdAt).toISOString(),
    ...(message.mediaUrl && {
      mediaUrl: message.mediaUrl,
      mediaType: message.mediaType,
    }),
    ...(message.replyToId && { replyToId: message.replyToId }),
  },
});

/**
 * Send a chat message — saves locally first, then sends via WebSocket if online.
 *
 * This is the ONLY function you should call to send messages. Import it anywhere:
 * ```
 * import { sendMessage } from '../services/messageController';
 *
 * // In GiftedChat's onSend:
 * const onSend = (messages: IMessage[]) => {
 *   sendMessage(messages[0], chatId);
 * };
 * ```
 *
 * @param message - The IMessage object from GiftedChat's onSend callback
 * @param chatId  - The ID of the chat this message belongs to
 * @returns The WatermelonDB record ID of the saved message
 */
export const sendMessage = async (
  message: IMessage,
  chatId: string,
): Promise<string> => {
  const { userId } = useUserStore.getState();
  const { mediaUrl, mediaType } = getMediaInfo(message);

  // Extract reply ID from GiftedChat's replyMessage if present
  const replyToId = message.replyMessage?._id?.toString();

  // 1. Atomically save message + update chat in a single DB write
  const savedMessage = await database.write(async () => {
    const messagesCollection = database.get<Message>('messages');

    const newMessage = await messagesCollection.create(msg => {
      msg.chatId = chatId;
      msg.senderId = userId;
      msg.text = message.text;
      msg.status = 'pending';
      msg.isMine = true;
      msg.createdAt =
        message.createdAt instanceof Date
          ? message.createdAt.getTime()
          : message.createdAt;
      if (mediaUrl) {
        msg.mediaUrl = mediaUrl;
      }
      if (mediaType) {
        msg.mediaType = mediaType;
      }
      if (replyToId) {
        msg.replyToId = replyToId;
      }
    });

    // Update the parent chat's metadata
    try {
      const chat = await database.get<any>('chats').find(chatId);
      await chat.update((c: any) => {
        c.lastMessageText = message.text;
        c.updatedAt = Date.now();
      });
    } catch {
      // Chat might not exist yet (e.g. first message in a new conversation)
      console.warn('[MessageController] Chat not found for update:', chatId);
    }

    return newMessage;
  });

  // 2. If online, send via WebSocket immediately
  if (getIsConnected()) {
    const payload = formatMessagePayload(savedMessage);
    sendRaw(payload);
  }

  return savedMessage.id;
};
