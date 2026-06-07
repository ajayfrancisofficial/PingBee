// DBService.ts
// Centralized WatermelonDB helper functions bundled into a service-like object.

import { Q } from '@nozbe/watermelondb';
import { database } from '../../db';
import Chat from '../../db/models/Chat';
import Message from '../../db/models/Message';
import User from '../../db/models/User';
import ChatParticipant from '../../db/models/ChatParticipant';
import type {
  ChatItem,
  MessageItem,
  UserSearchResponse,
  ChatUserDetailsResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';
import { parseDateToMillis } from '../../utils/DateTimeUtils';

/**
 * DBService groups all WatermelonDB operations into a single exported object.
 */
export const DBService = {
  /**
   * Upsert an array of ChatItem objects into the local `chats` table.
   * @param apiChats - Array of chat objects received from the API.
   */
  upsertChats: async (apiChats: ChatItem[]): Promise<void> => {
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
            c.type = api.type;
            c.lastMessageText = api.last_message_text || undefined;
            c.unreadCount = api.unread_count;
            c.updatedAt = parseDateToMillis(api.updated_at);
            c.avatarUrl = api.avatar_url || undefined;
            c.lastMessageSentUsername = api.lastMessageSentUsername;
          });
        } else {
          return chatsCollection.prepareCreate(c => {
            // @ts-ignore
            c._raw.id = id;
            c.name = api.name;
            c.type = api.type;
            c.lastMessageText = api.last_message_text || undefined;
            c.unreadCount = api.unread_count;
            c.updatedAt = parseDateToMillis(api.updated_at);
            c.avatarUrl = api.avatar_url || undefined;
            c.lastMessageSentUsername = api.lastMessageSentUsername;
          });
        }
      });
      await database.batch(...operations);
    });
    // Handle participants sync — batch all chats' participants in a single write
    await batchUpsertAllParticipants(apiChats);
  },

  /**
   * Upsert an array of MessageItem objects into the local `messages` table.
   * @param apiMessages - Messages retrieved from the API.
   * @param chatId - The chat identifier these messages belong to.
   * @param currentUserId - The authenticated user's ID, used to set `isMine` flag.
   */
  upsertMessages: async (
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
      let shouldUpdateLastMessage = false;

      const operations = apiMessages
        .map(api => {
          const id = String(api.message_id);
          const senderId = String(api.sender_id);
          const isMine = senderId === currentUserId;
          const existingRecord = existingMap.get(id);
          if (api.is_delete_for_me) {
            if (existingRecord) {
              shouldUpdateLastMessage = true;
              return existingRecord.prepareDestroyPermanently();
            }
            return null;
          }
          if (existingRecord) {
            const nextText = api.is_deleted_for_everyone
              ? 'This message was deleted'
              : api.message;
            if (
              existingRecord.text !== nextText ||
              existingRecord.isDeletedForEveryone !==
                api.is_deleted_for_everyone
            ) {
              shouldUpdateLastMessage = true;
            }
            return existingRecord.prepareUpdate(m => {
              m.text = nextText;
              m.status = api.is_read ? 'read' : 'sent';
              m.isMine = isMine;
              m.isDeletedForEveryone = api.is_deleted_for_everyone;
            });
          } else {
            shouldUpdateLastMessage = true;
            return messagesCollection.prepareCreate(m => {
              // @ts-ignore
              m._raw.id = id;
              m.chatId = chatId;
              m.senderId = senderId;
              m.text = api.is_deleted_for_everyone
                ? 'This message was deleted'
                : api.message;
              m.status = api.is_read ? 'read' : 'sent';
              m.isMine = isMine;
              m.createdAt = parseDateToMillis(api.created_at);
              m.isDeletedForEveryone = api.is_deleted_for_everyone;
            });
          }
        })
        .filter(op => op !== null);
      await database.batch(...operations);

      if (shouldUpdateLastMessage) {
        await DBService.updateChatsLastMessageInTransaction(chatId);
      }
    });
  },

  /**
   * Upsert profile data from the chat‑users‑details API response.
   * @param users - Array of user detail objects returned by the API.
   */
  upsertUserDetails: async (
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
  },

  /**
   * Upsert a single user from a UserSearchResponse object.
   * @param apiUser - User object obtained from a search API call.
   */
  upsertUser: async (apiUser: UserSearchResponse): Promise<void> => {
    const id = String(apiUser.user_id);
    await database.write(async () => {
      const usersCollection = database.get<User>('users');
      let existing: User | null = null;
      try {
        existing = await usersCollection.find(id);
      } catch {
        // Not found – will be created below
      }
      if (existing) {
        await existing.update(u => {
          u.name =
            `${apiUser.firstname} ${apiUser.lastname}`.trim() ||
            apiUser.username;
          u.username = apiUser.username;
          u.firstName = apiUser.firstname;
          u.lastName = apiUser.lastname;
          u.email = apiUser.email ?? undefined;
        });
      } else {
        await usersCollection.create(u => {
          // @ts-ignore
          u._raw.id = id;
          u.name =
            `${apiUser.firstname} ${apiUser.lastname}`.trim() ||
            apiUser.username;
          u.username = apiUser.username;
          u.firstName = apiUser.firstname;
          u.lastName = apiUser.lastname;
          u.email = apiUser.email ?? undefined;
        });
      }
    });
  },

  /**
   * Upsert participant records for a specific chat.
   * @param chatId - Identifier of the chat.
   * @param userIds - Array of user IDs that should be present.
   */
  upsertChatParticipants: async (
    chatId: string,
    userIds: string[],
  ): Promise<void> => {
    if (userIds.length === 0) return;
    await database.write(async () => {
      const participantsCollection =
        database.get<ChatParticipant>('chat_participants');
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
  },

  /**
   * Recalculate and update the last message text of one or multiple chats based on their newest local messages.
   * Assumes it is already running inside a database write transaction.
   * @param chatIdOrIds - The ID or IDs of the chats to update (can be a string, string[], or Set<string>)
   */
  updateChatsLastMessageInTransaction: async (
    chatIdOrIds: string | string[] | Set<string>,
  ): Promise<void> => {
    try {
      const chatsCollection = database.get<Chat>('chats');
      const messagesCollection = database.get<Message>('messages');
      const chatIds =
        typeof chatIdOrIds === 'string'
          ? [chatIdOrIds]
          : Array.from(chatIdOrIds);

      if (chatIds.length === 0) return;

      const chats = await chatsCollection
        .query(Q.where('id', Q.oneOf(chatIds)))
        .fetch();
      const existingMap = new Map(chats.map(c => [c.id, c]));

      const operations: any[] = [];

      for (const id of chatIds) {
        const chat = existingMap.get(id);
        if (!chat) continue;

        const latestMessages = await messagesCollection
          .query(
            Q.where('chat_id', id),
            Q.where('is_deleted_for_me', Q.notEq(true)),
            Q.sortBy('created_at', Q.desc),
            Q.take(1),
          )
          .fetch();

        const latest = latestMessages[0] ?? null;
        let newText: string | undefined = undefined;
        if (latest) {
          newText = latest.isDeletedForEveryone
            ? 'This message was deleted'
            : latest.text;
        }

        operations.push(
          chat.prepareUpdate(c => {
            c.lastMessageText = newText;
            c.updatedAt = Date.now();
          }),
        );
      }

      if (operations.length > 0) {
        await database.batch(...operations);
      }
    } catch (err) {
      console.warn(
        '[DBService] updateChatLastMessageInTransaction failed:',
        err,
      );
    }
  },

  /**
   * Mark a message and all older incoming messages in the same chat as read,
   * then recalculate and update the chat's unread count.
   * @param messageId - The ID of the message that was read.
   */
  markMessageAsRead: async (messageId: string): Promise<void> => {
    try {
      await database.write(async () => {
        const messagesCollection = database.get<Message>('messages');
        const chatsCollection = database.get<Chat>('chats');

        const message = await messagesCollection.find(messageId);
        const chatId = message.chatId;

        // 1. Mark this message and all previous incoming messages as read
        const messagesToUpdate = await messagesCollection
          .query(
            Q.where('chat_id', chatId),
            Q.where('is_mine', false),
            Q.where('status', Q.notEq('read')),
            Q.where('created_at', Q.lte(message.createdAt)),
          )
          .fetch();

        const messageUpdates = messagesToUpdate.map(m =>
          m.prepareUpdate(msg => {
            msg.status = 'read';
          }),
        );
        console.log('🚀 ~ messageUpdates:', messageUpdates);

        // 2. Query remaining unread incoming messages to calculate new unreadCount
        const totalUnreadIncoming = await messagesCollection
          .query(
            Q.where('chat_id', chatId),
            Q.where('is_mine', false),
            Q.where('status', Q.notEq('read')),
          )
          .fetch();

        const remainingUnreadCount = Math.max(
          0,
          totalUnreadIncoming.length - messagesToUpdate.length,
        );

        // 3. Update the chat record
        const chat = await chatsCollection.find(chatId);
        const chatUpdate = chat.prepareUpdate(c => {
          c.unreadCount = remainingUnreadCount;
        });

        await database.batch(...messageUpdates, chatUpdate);
      });
    } catch (err) {
      console.warn('[DBService] markMessageAsRead failed:', err);
    }
  },

  /**
   * Clears the entire WatermelonDB database.
   * Wrapped in a writer transaction as required by WatermelonDB.
   */
  clearDatabase: async (): Promise<void> => {
    try {
      await database.write(async () => {
        await database.unsafeResetDatabase();
      });
      console.log('Successfully cleared WatermelonDB');
    } catch (error) {
      console.error('Failed to clear WatermelonDB:', error);
      throw error;
    }
  },
};

/**
 * Private helper: batch‑upsert participants for all chats.
 * Not exported; used internally by upsertChats.
 */
const batchUpsertAllParticipants = async (
  apiChats: ChatItem[],
): Promise<void> => {
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
    const chatIds = [...new Set(pairs.map(p => p.chatId))];
    const existing = await participantsCollection
      .query(Q.where('chat_id', Q.oneOf(chatIds)))
      .fetch();
    const existingKeys = new Set(existing.map(p => `${p.chatId}:${p.userId}`));
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
