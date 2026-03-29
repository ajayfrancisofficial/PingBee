import { IMessage } from 'react-native-gifted-chat';
import { database } from '../db';
import Message from '../db/models/Message';
import Chat from '../db/models/Chat';
import { useUserStore } from '../store/userStore';
import { sendRaw, getIsConnected } from './websocket';
import type { WSSendMsg } from '../types/websocket';

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
export const formatMessagePayload = (message: Message): WSSendMsg => ({
  type: 'SEND_MSG',
  payload: {
    id: message.id,
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
      const chat = await database.get<Chat>('chats').find(chatId);
      await chat.update(c => {
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

/**
 * Edit an existing message.
 * @param messageId - The ID of the message to edit
 * @param newText - The new content of the message
 */
export const editMessage = async (
  messageId: string,
  newText: string,
): Promise<void> => {
  const editedAt = new Date().toISOString();

  await database.write(async () => {
    const message = await database.get<Message>('messages').find(messageId);

    // Can only edit if it's our own message and within time limit
    if (!message.isEditable) {
      throw new Error('Message is not editable');
    }

    await message.update(m => {
      m.text = newText;
      m.isEdited = true;
      m.editedAt = new Date(editedAt).getTime();
      m.editStatus = 'pending'; // Mark for sync
    });

    // Update parent chat's last message text if this was the last message
    try {
      const chat = await database.get<Chat>('chats').find(message.chatId);
      if (chat.lastMessageText === message.text) {
        await chat.update(c => {
          c.lastMessageText = newText;
        });
      }
    } catch {
      // Chat update optional
    }
  });

  if (getIsConnected()) {
    sendRaw({
      type: 'EDIT_MSG',
      payload: {
        id: messageId,
        text: newText,
        editedAt,
      },
    });
  }
};

/**
 * Delete a message.
 * @param messageId - ID of message to delete
 * @param type - 'deleteForEveryone' (syncs to everyone) or 'deleteForMe' (syncs to your other devices only)
 */
export const deleteMessage = async (
  messageId: string,
  type: 'deleteForEveryone' | 'deleteForMe',
): Promise<void> => {
  const deletedAt = new Date().toISOString();

  await database.write(async () => {
    const message = await database.get<Message>('messages').find(messageId);

    if (type === 'deleteForEveryone' && !message.isDeletable) {
      throw new Error('Message is no longer deletable for everyone');
    }

    await message.update(m => {
      m.isDeleted = true;
      m.deletedAt = new Date(deletedAt).getTime();
      m.deleteType = type;
      m.deleteStatus = 'pending'; // Always sync delete preference
      if (type === 'deleteForMe') {
        m.isDeletedForMe = true;
      }
    });

    // For "delete for everyone", update chat's last message text
    if (type === 'deleteForEveryone') {
      try {
        const chat = await database.get<Chat>('chats').find(message.chatId);
        await chat.update(c => {
          c.lastMessageText = 'This message was deleted';
        });
      } catch {
        // Chat update optional
      }
    }
  });

  if (getIsConnected()) {
    sendRaw({
      type: 'DELETE_MSG',
      payload: {
        id: messageId,
        deleteType: type,
        deletedAt,
      },
    });
  }
};

/**
 * Send typing indicator status to the chat.
 */
export const sendTypingStatus = (chatId: string, isTyping: boolean) => {
  if (getIsConnected()) {
    sendRaw({
      type: 'TYPING',
      payload: {
        chatId,
        isTyping,
      },
    });
  }
};
