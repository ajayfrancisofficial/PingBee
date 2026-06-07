import { Q } from '@nozbe/watermelondb';
import { database } from '../../db';
import Message from '../../db/models/Message';
import Chat from '../../db/models/Chat';
import { useChatStore } from '../../store/chatStore';
import { performOutgoingSync } from '../Sync/OutgoingSync';
import { DBService } from '../DB/DBService';
import { chatApi } from '../../api/RESTApi/chatApi';
import type {
  WsServerMessage,
  ServerEventPayloads,
} from '../../types/ApiTypes/WsApiTypes/wsApitypes';
import { parseDateToMillis } from '../../utils/DateTimeUtils';

export const websocketService = {
  /**
   * Called by the transport layer (websocketApi) when a raw message is received.
   */
  handleIncomingMessage: async (data: WsServerMessage) => {
    const { event, payload } = data;

    try {
      switch (event) {
        case 'RECEIVE_MSG': {
          const p = payload as ServerEventPayloads['RECEIVE_MSG'];
          await database.write(async () => {
            const messagesCollection = database.get<Message>('messages');
            await messagesCollection.create(msg => {
              // @ts-ignore
              msg._raw.id = p.id;
              msg.chatId = p.chatId;
              msg.senderId = p.senderId;
              msg.text = p.text;
              msg.status = 'sent';
              msg.isMine = false;
              msg.createdAt = parseDateToMillis(p.createdAt);
              msg.serverTimestamp = parseDateToMillis(p.serverTimestamp);
              if (p.replyTo) {
                msg.replyToId = p.replyTo;
              }
            });

            const chatsCollection = database.get<Chat>('chats');
            try {
              const chat = await chatsCollection.find(p.chatId);
              await chat.update(c => {
                c.lastMessageText = p.text;
                c.unreadCount += 1;
                c.updatedAt = Date.now();
              });
            } catch (error) {
              // Chat doesn't exist locally (e.g. message from a stranger).
              // Instead of creating a temporary placeholder chat row, we trigger a fetch
              // to sync chats from the REST API to get the correct user details, name, type, and avatar.
              // Note: We use setTimeout(..., 0) to schedule the network request *outside* the active
              // WatermelonDB write transaction, preventing the database lock from being held during the network fetch.
              setTimeout(async () => {
                try {
                  const response = await chatApi.fetchChats();
                  const apiChats = response.data?.chats ?? [];
                  await DBService.upsertChats(apiChats);
                } catch (err) {
                  console.error(
                    '[websocketService] Failed to sync chats for stranger:',
                    err,
                  );
                }
              }, 0);
            }
          });
          break;
        }

        case 'RECEIVE_EDIT_MSG': {
          const p = payload as ServerEventPayloads['RECEIVE_EDIT_MSG'];
          await database.write(async () => {
            try {
              const message = await database
                .get<Message>('messages')
                .find(p.id);
              const oldText = message.text;

              await message.update(m => {
                m.text = p.text;
                m.isEdited = true;
                if (p.editedAt) {
                  m.editedAt = parseDateToMillis(p.editedAt);
                }
                m.editStatus = 'synced';
              });

              const chat = await database
                .get<Chat>('chats')
                .find(message.chatId);
              if (chat.lastMessageText === oldText) {
                await chat.update(c => {
                  c.lastMessageText = p.text;
                  c.updatedAt = Date.now();
                });
              }
            } catch (e) {
              console.warn(
                '[websocketService] Cannot process incoming RECEIVE_EDIT_MSG, message not found:',
                p.id,
              );
            }
          });
          break;
        }

        case 'ACK_EDIT_MSG': {
          const p = payload as ServerEventPayloads['ACK_EDIT_MSG'];
          await database.write(async () => {
            const message = await database.get<Message>('messages').find(p.id);
            await message.update(m => {
              m.editStatus = 'synced';
              m.editedAt = parseDateToMillis(p.editedAt);
            });
          });
          break;
        }

        case 'RECEIVE_DELETE_MSGS': {
          const p = payload as ServerEventPayloads['RECEIVE_DELETE_MSGS'];
          await database.write(async () => {
            const chatIdsToUpdate = new Set<string>();
            for (const item of p.messages) {
              try {
                const message = await database
                  .get<Message>('messages')
                  .find(item.id);
                const chatId = message.chatId;

                await message.update(m => {
                  m.isDeletedForEveryone = true;
                  m.text = 'This message was deleted';
                  m.deletedForEveryoneAt = parseDateToMillis(
                    item.deletedForEveryoneAt,
                  );
                  m.deleteStatus = 'synced';
                });
                chatIdsToUpdate.add(chatId);
              } catch (e) {
                console.warn(
                  '[websocketService] RECEIVE_DELETE_MSGS: message not found:',
                  item.id,
                );
              }
            }

            await DBService.updateChatsLastMessageInTransaction(
              chatIdsToUpdate,
            );
          });
          break;
        }

        case 'ACK_DELETE_MSGS': {
          const p = payload as ServerEventPayloads['ACK_DELETE_MSGS'];
          await database.write(async () => {
            const chatIdsToUpdate = new Set<string>();
            for (const item of p.messages) {
              if (item.error) {
                console.warn(
                  '[websocketService] ACK_DELETE_MSGS error for message:',
                  item.id,
                  item.error,
                );
                continue;
              }

              try {
                const message = await database
                  .get<Message>('messages')
                  .find(item.id);
                const chatId = message.chatId;

                if (
                  item.deleteType === 'deleteForMe' ||
                  item.deleteType === 'both'
                ) {
                  // Destroy locally — message is only hidden for us
                  await message.destroyPermanently();
                } else {
                  await message.update(m => {
                    m.deleteStatus = 'synced';
                    m.text = 'This message was deleted';
                    if (item.deletedForEveryoneAt) {
                      m.deletedForEveryoneAt = parseDateToMillis(
                        item.deletedForEveryoneAt,
                      );
                    }
                  });
                }
                chatIdsToUpdate.add(chatId);
              } catch (e) {
                console.warn(
                  '[websocketService] ACK_DELETE_MSGS: message not found:',
                  item.id,
                );
              }
            }

            await DBService.updateChatsLastMessageInTransaction(
              chatIdsToUpdate,
            );
          });
          break;
        }

        case 'TYPING': {
          const p = payload as ServerEventPayloads['TYPING'];
          const { setTyping } = useChatStore.getState();
          setTyping(p.chatId, p.userId, p.isTyping);
          break;
        }

        case 'ACK_SEND_MSG': {
          const p = payload as ServerEventPayloads['ACK_SEND_MSG'];
          await database.write(async () => {
            const message = await database.get<Message>('messages').find(p.id);
            await message.update(m => {
              m.status = 'sent';
              m.serverTimestamp = parseDateToMillis(p.serverTimestamp);
            });
          });
          break;
        }

        case 'MSG_STATUS': {
          const p = payload as ServerEventPayloads['MSG_STATUS'];
          await database.write(async () => {
            const messagesCollection = database.get<Message>('messages');
            try {
              const message = await messagesCollection.find(p.messageId);

              if (p.status === 'read') {
                // Cascading read status update: mark all previous sent/delivered messages in this chat as read
                const messagesToUpdate = await messagesCollection
                  .query(
                    Q.where('chat_id', message.chatId),
                    Q.where('is_mine', true),
                    Q.where('status', Q.notEq('read')),
                    Q.where('created_at', Q.lte(message.createdAt)),
                  )
                  .fetch();

                const ops = messagesToUpdate.map(m =>
                  m.prepareUpdate(msg => {
                    msg.status = 'read';
                  }),
                );
                await database.batch(...ops);
              } else {
                // Single message status update (e.g. 'delivered')
                await message.update(m => {
                  m.status = p.status as any;
                });
              }
            } catch (err) {
              console.warn(
                '[websocketService] MSG_STATUS: message not found:',
                p.messageId,
              );
            }
          });
          break;
        }

        case 'ERROR': {
          const p = payload as ServerEventPayloads['ERROR'];
          console.error('[websocketService] Server Error:', p.message);
          break;
        }

        default:
          console.log('[websocketService] Unknown event:', event);
      }
    } catch (error) {
      console.error(
        '[websocketService] Error processing incoming message:',
        error,
      );
    }
  },

  /**
   * Called by the transport layer when a connection is established.
   * Triggers necessary synchronization tasks.
   */
  handleConnectionSuccess: () => {
    // 1. Fetch events we missed while offline (incoming first so state is fresh)
    // performIncomingSync();

    // 2. Retry pending outgoing messages
    performOutgoingSync();
  },
};
