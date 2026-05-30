import { database } from '../../db';
import Message from '../../db/models/Message';
import { websocketApi } from '../../api/WebsocketApi/websocketApi';
import { buildSendMessageEvent } from '../Chat/messageController';

let isSyncing = false;

/**
 * Retries sending all pending messages via WebSocket.
 * Call this when the connection is restored.
 */
export const performOutgoingSync = async () => {
  if (isSyncing || !websocketApi.getIsConnected()) return;
  isSyncing = true;

  try {
    const allMessages = await database.get<Message>('messages').query().fetch();

    const pendingNew = allMessages.filter(m => m.status === 'pending');
    const pendingEdits = allMessages.filter(m => m.editStatus === 'pending');
    const pendingDeletes = allMessages.filter(
      m => m.deleteStatus === 'pending',
    );

    // 1. Sync New Messages
    for (const message of pendingNew) {
      websocketApi.sendRaw(buildSendMessageEvent(message));
    }

    // 2. Sync Edits
    for (const message of pendingEdits) {
      websocketApi.sendRaw({
        event: 'EDIT_MSG',
        payload: {
          id: message.id,
          text: message.text,
          editedAt: new Date(message.editedAt || Date.now()).toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Sync Deletions — send all pending deletes as a single batch
    if (pendingDeletes.length > 0) {
      const nowIso = new Date().toISOString();
      websocketApi.sendRaw({
        event: 'DELETE_MSGS',
        payload: {
          protocolVersion: '1.0',
          messages: pendingDeletes.map(message => {
            let deleteType: 'deleteForMe' | 'deleteForEveryone' | 'both' =
              'deleteForMe';
            if (message.isDeletedForEveryone && message.isDeletedForMe) {
              deleteType = 'both';
            } else if (message.isDeletedForEveryone) {
              deleteType = 'deleteForEveryone';
            }

            return {
              id: message.id,
              deleteType,
              deletedForEveryoneAt: message.deletedForEveryoneAt
                ? new Date(message.deletedForEveryoneAt).toISOString()
                : null,
              deletedForMeAt: message.deletedForMeAt
                ? new Date(message.deletedForMeAt).toISOString()
                : null,
            };
          }),
        },
        timestamp: nowIso,
      });
    }

    const total =
      pendingNew.length + pendingEdits.length + pendingDeletes.length;
    if (total > 0) {
      console.log(`[OutgoingSync] Synced ${total} pending action(s)`);
    }
  } catch (error) {
    console.error('[OutgoingSync] Error during sync:', error);
  } finally {
    isSyncing = false;
  }
};
