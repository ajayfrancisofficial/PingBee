import { database } from '../../db';
import Message from '../../db/models/Message';

let lastSyncTimestamp: number = 0;

export const performIncomingSync = async () => {
  try {
    console.log('[IncomingSync] Starting sync since:', lastSyncTimestamp);
    
    // Simulating API call
    const mockNewMessages = [
      {
        id: 'remote-1',
        chatId: '1',
        senderId: '2',
        text: 'Hey! I sent this while you were offline.',
        createdAt: new Date().toISOString(),
        serverTimestamp: Date.now(),
      }
    ];

    if (mockNewMessages.length > 0) {
      await database.write(async () => {
        const messagesCollection = database.get<Message>('messages');
        const messageCreations = mockNewMessages.map(msg => 
          messagesCollection.prepareCreate(m => {
            m.chatId = msg.chatId;
            m.senderId = msg.senderId;
            m.text = msg.text;
            m.status = 'sent';
            m.isMine = false;
            m.createdAt = new Date(msg.createdAt).getTime();
            m.serverTimestamp = msg.serverTimestamp;
          })
        );
        
        await database.batch(...messageCreations);
      });
      
      lastSyncTimestamp = Date.now();
    }
    
    console.log('[IncomingSync] Sync complete');
  } catch (error) {
    console.error('[IncomingSync] Sync failed:', error);
  }
};
