/**
 * upsert.ts
 *
 * Batch upsert helpers for WatermelonDB.
 * "Upsert" = update the record if it exists, create it if it doesn't.
 *
 * WatermelonDB does not have a native upsert; we implement it by:
 *   1. Fetching existing IDs from local DB in one query
 *   2. Splitting the incoming array into `toCreate` vs `toUpdate`
 *   3. Running everything as a single database.batch() for atomicity
 */

import { Q } from '@nozbe/watermelondb';
import { database } from './index';
import Chat from './models/Chat';
import Message from './models/Message';
import User from './models/User';
import ChatParticipant from './models/ChatParticipant';
import type {
  ChatItem,
  MessageItem,
  UserSearchResponse,
  ChatUserDetailsResponse,
} from '../types/ApiTypes/RestApiTypes/restApiTypes';

// ─── Chats ───────────────────────────────────────────────────────────────────

/**
 * Upsert an array of ChatItem objects into the local `chats` table.
 */
export const upsertChats = async (apiChats: ChatItem[]): Promise<void> => {
  if (apiChats.length === 0) return;

  await database.write(async () => {
    const chatsCollection = database.get<Chat>('chats');
    const ids = apiChats.map(c => String(c.id));

    const existing = await chatsCollection
      .query(Q.where('id', Q.oneOf(ids)))
      .fetch();
    const existingMap = new Map(existing.map(c => [c.id, c]));

    const operations = apiChats.map(api => {
      const id = String(api.id);
      const existingRecord = existingMap.get(id);

      if (existingRecord) {
        return existingRecord.prepareUpdate(c => {
          c.name = api.name;
          c.type = api.type as 'individual' | 'group';
          c.lastMessageText = api.last_message_text || undefined;
          c.unreadCount = api.unread_count;
          c.updatedAt = api.updated_at;
          c.avatarUrl = api.avatar_url || undefined;
          c.lastMessageSentUsername = api.lastMessageSentUsername;
        });
      } else {
        return chatsCollection.prepareCreate(c => {
          // @ts-ignore
          c._raw.id = id;
          c.name = api.name;
          c.type = api.type as 'individual' | 'group';
          c.lastMessageText = api.last_message_text || undefined;
          c.unreadCount = api.unread_count;
          c.updatedAt = api.updated_at;
          c.avatarUrl = api.avatar_url || undefined;
          c.lastMessageSentUsername = api.lastMessageSentUsername;
        });
      }
    });

    await database.batch(...operations);
  });

  // Handle participants sync — batch all chats' participants in a single write
  await batchUpsertAllParticipants(apiChats);
};

// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * Upsert an array of MessageItem objects into the local `messages` table.
 * @param currentUserId - The authenticated user's ID, used to correctly set `isMine`.
 */
export const upsertMessages = async (
  apiMessages: MessageItem[],
  chatId: string,
  currentUserId: string,
): Promise<void> => {
  if (apiMessages.length === 0) return;

  await database.write(async () => {
    const messagesCollection = database.get<Message>('messages');
    const ids = apiMessages.map(m => String(m.message_id));

    const existing = await messagesCollection
      .query(Q.where('id', Q.oneOf(ids)))
      .fetch();
    const existingMap = new Map(existing.map(m => [m.id, m]));

    const operations = apiMessages.map(api => {
      const id = String(api.message_id);
      const senderId = String(api.sender_id);
      const isMine = senderId === currentUserId;
      const existingRecord = existingMap.get(id);

      if (existingRecord) {
        return existingRecord.prepareUpdate(m => {
          m.text = api.message;
          m.status = api.is_read ? 'read' : 'sent';
          m.isMine = isMine;
        });
      } else {
        return messagesCollection.prepareCreate(m => {
          // @ts-ignore
          m._raw.id = id;
          m.chatId = chatId;
          m.senderId = senderId;
          m.text = api.message;
          m.status = api.is_read ? 'read' : 'sent';
          m.isMine = isMine;
          m.createdAt = new Date(api.created_at).getTime();
        });
      }
    });

    await database.batch(...operations);
  });
};

/**
 * Upsert profiles from chat-users-details API.
 */
export const upsertUserDetails = async (
  users: ChatUserDetailsResponse['data'],
): Promise<void> => {
  if (!users || users.length === 0) return;


  await database.write(async () => {
    const usersCollection = database.get<User>('users');
    const ids = users.map(u => String(u.userId));

    const existing = await usersCollection
      .query(Q.where('id', Q.oneOf(ids)))
      .fetch();
    const existingMap = new Map(existing.map(u => [u.id, u]));

    const operations = users.map(api => {
      const id = String(api.userId);
      const existingRecord = existingMap.get(id);

      if (existingRecord) {
        return existingRecord.prepareUpdate(u => {
          u.name = api.name;
          u.username = api.username ?? undefined;
          u.firstName = api.first_name ?? undefined;
          u.lastName = api.last_name ?? undefined;
          u.email = api.email ?? undefined;
          u.avatarUrl = api.avatar_url ?? undefined;
          u.phoneNumber = api.phone_number ?? undefined;
        });
      } else {
        return usersCollection.prepareCreate(u => {
          // @ts-ignore
          u._raw.id = id;
          u.name = api.name;
          u.username = api.username ?? undefined;
          u.firstName = api.first_name ?? undefined;
          u.lastName = api.last_name ?? undefined;
          u.email = api.email ?? undefined;
          u.avatarUrl = api.avatar_url ?? undefined;
          u.phoneNumber = api.phone_number ?? undefined;
        });
      }
    });

    await database.batch(...operations);
  });
};

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * Upsert a single user from a UserSearchResponse object into the local `users` table.
 * Stores all available profile data so sender names can be resolved offline.
 */
export const upsertUser = async (apiUser: UserSearchResponse): Promise<void> => {
  const id = String(apiUser.user_id);

  await database.write(async () => {
    const usersCollection = database.get<User>('users');
    let existing: User | null = null;
    try {
      existing = await usersCollection.find(id);
    } catch {
      // Not found — will create below
    }

    if (existing) {
      await existing.update(u => {
        u.name = `${apiUser.firstname} ${apiUser.lastname}`.trim() || apiUser.username;
        u.username = apiUser.username;
        u.firstName = apiUser.firstname;
        u.lastName = apiUser.lastname;
        u.email = apiUser.email ?? undefined;
      });
    } else {
      await usersCollection.create(u => {
        // @ts-ignore
        u._raw.id = id;
        u.name = `${apiUser.firstname} ${apiUser.lastname}`.trim() || apiUser.username;
        u.username = apiUser.username;
        u.firstName = apiUser.firstname;
        u.lastName = apiUser.lastname;
        u.email = apiUser.email ?? undefined;
      });
    }
  });
};

// ─── Chat Participants ────────────────────────────────────────────────────────

/**
 * Batch-upsert participants for ALL chats in a single database.write().
 * This replaces the previous per-chat loop which opened N separate write
 * transactions and was significantly slower for many chats.
 */
const batchUpsertAllParticipants = async (
  apiChats: ChatItem[],
): Promise<void> => {
  // Collect all (chatId, userId) pairs that need syncing
  const pairs: { chatId: string; userId: string }[] = [];
  for (const api of apiChats) {
    if (api.participants?.userIDs) {
      const chatId = String(api.id);
      for (const uid of api.participants.userIDs) {
        pairs.push({ chatId, userId: uid });
      }
    }
  }
  if (pairs.length === 0) return;

  await database.write(async () => {
    const participantsCollection =
      database.get<ChatParticipant>('chat_participants');

    // Fetch all existing participants for the relevant chats in one query
    const chatIds = [...new Set(pairs.map(p => p.chatId))];
    const existing = await participantsCollection
      .query(Q.where('chat_id', Q.oneOf(chatIds)))
      .fetch();

    // Build a set of "chatId:userId" keys for fast lookup
    const existingKeys = new Set(
      existing.map(p => `${p.chatId}:${p.userId}`),
    );

    const operations = pairs
      .filter(({ chatId, userId }) => !existingKeys.has(`${chatId}:${userId}`))
      .map(({ chatId, userId }) =>
        participantsCollection.prepareCreate(p => {
          p.chatId = chatId;
          p.userId = userId;
        }),
      );

    if (operations.length > 0) {
      await database.batch(...operations);
    }
  });
};

/**
 * Upsert participant records for a given chat.
 * Each userId entry gets a row in `chat_participants` if one does not already exist.
 */
export const upsertChatParticipants = async (
  chatId: string,
  userIds: string[],
): Promise<void> => {
  if (userIds.length === 0) return;

  await database.write(async () => {
    const participantsCollection = database.get<ChatParticipant>('chat_participants');

    // Fetch existing rows for this chat to avoid duplicates
    const existing = await participantsCollection
      .query(Q.where('chat_id', chatId))
      .fetch();
    const existingUserIds = new Set(existing.map(p => p.userId));

    const operations = userIds
      .filter(uid => !existingUserIds.has(uid))
      .map(uid =>
        participantsCollection.prepareCreate(p => {
          p.chatId = chatId;
          p.userId = uid;
        }),
      );

    if (operations.length > 0) {
      await database.batch(...operations);
    }
  });
};
