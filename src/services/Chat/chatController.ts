import { database } from '../../db';
import Chat from '../../db/models/Chat';

/**
 * Ensures a chat record exists in the local database.
 * If it doesn't exist, it creates one with the provided metadata.
 *
 * @param chatId - The unique identifier for the chat
 * @param name - The display name for the chat
 * @param type - The type of chat ('individual' or 'group')
 * @param avatarUrl - Optional avatar URL
 */
export const ensureChatExists = async (
  chatId: string,
  name: string,
  type: 'individual' | 'group' = 'individual',
  avatarUrl?: string,
): Promise<void> => {
  await database.write(async () => {
    const chatsCollection = database.get<Chat>('chats');

    try {
      // Try to find the existing chat
      await chatsCollection.find(chatId);
      // If found, we don't need to do anything
    } catch (error) {
      // Chat not found, create a new one
      console.log(`[ChatController] Creating local chat record for: ${chatId}`);
      await chatsCollection.create(chat => {
        // @ts-ignore - WatermelonDB allows setting _raw.id if handled correctly for sync
        chat._raw.id = chatId;
        chat.name = name;
        chat.type = type;
        chat.unreadCount = 0;
        chat.updatedAt = Date.now();
        if (avatarUrl) {
          chat.avatarUrl = avatarUrl;
        }
      });
    }
  });
};
