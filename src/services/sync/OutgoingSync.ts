import { database } from '../../db';
import Message from '../../db/models/Message';
import { sendMessage } from '../websocket';

let isSyncing = false;

const broadcastMessage = (message: Message) => {
  sendMessage({
    type: 'MSG',
    payload: {
      tempId: message.id,
      chatId: message.chatId,
      text: message.text,
      senderId: message.senderId,
      createdAt: new Date(message.createdAt).toISOString(),
    }
  });
};

export const performOutgoingSync = async () => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const pendingMessages = await database
      .get<Message>('messages')
      .query()
      .fetch();

    const filteredPending = pendingMessages.filter(m => m.status === 'pending');

    for (const message of filteredPending) {
      sendMessage(message);
    }
  } catch (error) {
    console.error('[OutgoingSync] Error during sync:', error);
  } finally {
    isSyncing = false;
  }
};
