import { database } from '../../db';
import Message from '../../db/models/Message';
import { sendRaw, getIsConnected } from '../websocket';
import { formatMessagePayload } from '../messageController';

let isSyncing = false;

/**
 * Retries sending all pending messages via WebSocket.
 * Call this when the connection is restored.
 */
export const performOutgoingSync = async () => {
  if (isSyncing || !getIsConnected()) return;
  isSyncing = true;

  try {
    const allMessages = await database.get<Message>('messages').query().fetch();

    const pendingNew = allMessages.filter(m => m.status === 'pending');
    const pendingEdits = allMessages.filter(m => m.editStatus === 'pending');
    const pendingDeletes = allMessages.filter(m => m.deleteStatus === 'pending');

    // 1. Sync New Messages
    for (const message of pendingNew) {
      sendRaw(formatMessagePayload(message));
    }

    // 2. Sync Edits
    for (const message of pendingEdits) {
      sendRaw({
        type: 'EDIT_MSG',
        payload: {
          id: message.id,
          text: message.text,
          editedAt: new Date(message.editedAt || Date.now()).toISOString(),
        },
      });
    }

    // 3. Sync Deletions
    for (const message of pendingDeletes) {
      sendRaw({
        type: 'DELETE_MSG',
        payload: {
          id: message.id,
          deleteType: message.deleteType || 'deleteForEveryone',
          deletedAt: new Date(message.deletedAt || Date.now()).toISOString(),
        },
      });
    }

    const total = pendingNew.length + pendingEdits.length + pendingDeletes.length;
    if (total > 0) {
      console.log(`[OutgoingSync] Synced ${total} pending action(s)`);
    }
  } catch (error) {
    console.error('[OutgoingSync] Error during sync:', error);
  } finally {
    isSyncing = false;
  }
};
