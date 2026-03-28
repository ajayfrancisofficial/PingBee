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
    const pendingMessages = await database
      .get<Message>('messages')
      .query()
      .fetch();

    const filteredPending = pendingMessages.filter(m => m.status === 'pending');

    for (const message of filteredPending) {
      const payload = formatMessagePayload(message);
      sendRaw(payload);
    }

    console.log(
      `[OutgoingSync] Sent ${filteredPending.length} pending message(s)`,
    );
  } catch (error) {
    console.error('[OutgoingSync] Error during sync:', error);
  } finally {
    isSyncing = false;
  }
};
