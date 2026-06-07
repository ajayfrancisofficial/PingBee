import { database } from '../../db';
import Message from '../../db/models/Message';
import Chat from '../../db/models/Chat';
import { useUserStore } from '../../store/userStore';
import { websocketApi } from '../../api/WebsocketApi/websocketApi';
import type { WsClientMessage } from '../../types/ApiTypes/WsApiTypes/wsApitypes';
import { DBService } from '../DB/DBService';

/**
 * Build the full WebSocket client message for sending a new message (SEND_MSG event).
 * Also used by OutgoingSync to retry pending messages.
 */
export const buildSendMessageEvent = (message: Message): WsClientMessage => ({
  event: 'SEND_MSG',
  payload: {
    id: message.id,
    chatId: Number(message.chatId),
    text: message.text,
    replyTo: message.replyToId ?? null,
    createdAt: message.createdAt,
  },
  timestamp: new Date().toISOString(),
});

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

    const oldText = message.text;

    await message.update(m => {
      m.text = newText;
      m.isEdited = true;
      m.editedAt = new Date(editedAt).getTime();
      m.editStatus = 'pending'; // Mark for sync
    });

    // Update parent chat's last message text if this was the last message
    try {
      const chat = await database.get<Chat>('chats').find(message.chatId);
      if (chat.lastMessageText === oldText) {
        await chat.update(c => {
          c.lastMessageText = newText;
          c.updatedAt = Date.now();
        });
      }
    } catch {
      // Chat update optional
    }
  });

  if (websocketApi.getIsConnected()) {
    websocketApi.sendRaw({
      event: 'EDIT_MSG',
      payload: {
        id: messageId,
        text: newText,
        editedAt,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Batch-delete multiple messages in a single WebSocket round-trip.
 * All messages are deleted with the same type.
 * All messages will be from the same chat.
 *
 * @param messageIds - IDs of the messages to delete
 * @param type       - 'deleteForEveryone' or 'deleteForMe'
 */
export const deleteMessages = async (
  messageIds: string[],
  type: 'deleteForEveryone' | 'deleteForMe',
): Promise<void> => {
  if (messageIds.length === 0) return;

  const now = Date.now();

  const updatedMessages = await database.write(async () => {
    const records: Message[] = [];
    let chatIdToUpdate: string | null = null;
    for (const messageId of messageIds) {
      try {
        const message = await database.get<Message>('messages').find(messageId);

        if (type === 'deleteForEveryone' && !message.isDeletable) {
          console.warn(
            '[MessageController] Skipping non-deletable message:',
            messageId,
          );
          continue;
        }

        if (type === 'deleteForMe') {
          await message.update(m => {
            m.isDeletedForMe = true;
            m.deletedForMeAt = now;
            m.deleteStatus = 'pending';
          });
        } else {
          await message.update(m => {
            m.isDeletedForEveryone = true;
            m.text = 'This message was deleted';
            m.deletedForEveryoneAt = now;
            m.deleteStatus = 'pending';
          });
        }
        chatIdToUpdate = message.chatId;
        records.push(message);
      } catch (err) {
        console.error(
          '[MessageController] Failed to delete message locally:',
          messageId,
          err,
        );
      }
    }

    if (chatIdToUpdate) {
      await DBService.updateChatsLastMessageInTransaction(chatIdToUpdate);
    }
    return records;
  });

  if (websocketApi.getIsConnected() && updatedMessages.length > 0) {
    const nowIso = new Date(now).toISOString();
    websocketApi.sendRaw({
      event: 'DELETE_MSGS',
      payload: {
        protocolVersion: '1.0',
        messages: updatedMessages.map(msg => ({
          id: msg.id,
          deleteType: type,
          deletedForEveryoneAt: msg.deletedForEveryoneAt
            ? new Date(msg.deletedForEveryoneAt).toISOString()
            : null,
          deletedForMeAt: msg.deletedForMeAt
            ? new Date(msg.deletedForMeAt).toISOString()
            : null,
        })),
      },
      timestamp: nowIso,
    });
  }
};

/**
 * Send a chat message using plain primitives.
 * This is the preferred function when using the custom message UI.
 *
 * @param text      - Message body text
 * @param chatId    - Target chat ID
 * @param replyToId - Optional ID of the message being replied to
 */
export const sendMessage = async (
  text: string,
  chatId: string,
  replyToId?: string,
): Promise<string> => {
  const { userId } = useUserStore.getState();
  const now = Date.now();

  const savedMessage = await database.write(async () => {
    const messagesCollection = database.get<Message>('messages');

    const newMessage = await messagesCollection.create(msg => {
      msg.chatId = chatId;
      msg.senderId = String(userId);
      msg.text = text;
      msg.status = 'pending';
      msg.isMine = true;
      msg.createdAt = now;
      if (replyToId) {
        msg.replyToId = replyToId;
      }
    });

    try {
      const chat = await database.get<Chat>('chats').find(chatId);
      await chat.update(c => {
        c.lastMessageText = text;
        c.updatedAt = now;
      });
    } catch {
      console.warn('[MessageController] Chat not found for update:', chatId);
    }

    return newMessage;
  });

  if (websocketApi.getIsConnected()) {
    websocketApi.sendRaw(buildSendMessageEvent(savedMessage));
  }

  return savedMessage.id;
};

/**
 * Send typing indicator status to the chat.
 */
export const sendTypingStatus = (chatId: string, isTyping: boolean) => {
  if (websocketApi.getIsConnected()) {
    websocketApi.sendRaw({
      event: 'TYPING',
      payload: {
        chatId: Number(chatId),
        isTyping,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

