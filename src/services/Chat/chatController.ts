import { database } from '../../db';
import Chat from '../../db/models/Chat';
import { DBService } from '../../services/DB/DBService';
import type { UserSearchResponse } from '../../types/ApiTypes/RestApiTypes/restApiTypes';

/**
 * Called when a conversation is first created/opened from NewChatScreen.
 *
 * In a single write transaction it:
 *  1. Ensures the chat row exists (creates it if not).
 *  2. Upserts the other user's full profile into the `users` table.
 *  3. Writes both the current user and the other user into `chat_participants`.
 *
 * @param chatId       - The conversation ID returned by the server.
 * @param otherUser    - The full UserSearchResponse of the other participant.
 * @param currentUserId - The logged-in user's ID (as a string).
 */
export const setupConversation = async (
  chatId: string,
  otherUser: UserSearchResponse,
  currentUserId: string,
): Promise<void> => {
  const displayName =
    `${otherUser.firstname} ${otherUser.lastname}`.trim() || otherUser.username;

  // 1. Ensure chat record exists
  await database.write(async () => {
    const chatsCollection = database.get<Chat>('chats');
    try {
      await chatsCollection.find(chatId);
      // Already exists — no-op
    } catch {
      console.log(`[ChatController] Creating local chat record for: ${chatId}`);
      await chatsCollection.create(chat => {
        // @ts-ignore
        chat._raw.id = chatId;
        chat.name = displayName;
        chat.type = 'individual';
        chat.unreadCount = 0;
        chat.lastUpdatedAt = Date.now();
        if (otherUser.avatar_url) {
          chat.avatarUrl = otherUser.avatar_url;
        }
      });
    }
  });

  // 2. Persist the other user's profile to the users table
  await DBService.upsertUser(otherUser);

  // 3. Persist both participants
  await DBService.upsertChatParticipants(chatId, [
    currentUserId,
    String(otherUser.user_id),
  ]);

  console.log(`[ChatController] setupConversation done for chat: ${chatId}`);
};

/**
 * @deprecated Use setupConversation instead when you have a full UserSearchResponse.
 * Kept for compatibility with any non-search entry points.
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
      await chatsCollection.find(chatId);
    } catch {
      console.log(`[ChatController] Creating local chat record for: ${chatId}`);
      await chatsCollection.create(chat => {
        // @ts-ignore
        chat._raw.id = chatId;
        chat.name = name;
        chat.type = type;
        chat.unreadCount = 0;
        chat.lastUpdatedAt = Date.now();
        if (avatarUrl) {
          chat.avatarUrl = avatarUrl;
        }
      });
    }
  });
};

/**
 * Checks if a chat is a group chat.
 * @param chatId - The unique ID of the chat.
 * @returns A promise resolving to true if group, false otherwise.
 */
export const fetchChatIsGroup = async (chatId: string): Promise<boolean> => {
  try {
    const chat = await database.get<Chat>('chats').find(chatId);
    return chat.type === 'group';
  } catch (err) {
    console.warn('[ChatController] failed to find chat:', err);
    return false;
  }
};
