import { useState, useCallback } from 'react';
import { chatService } from '../services/Chat/chatService';

export function useConversationActions() {
  const [isStarting, setIsStarting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const startConversation = useCallback(async (userId: number) => {
    setIsStarting(true);
    setSelectedUserId(userId);
    try {
      const response = await chatService.getOrCreateConversation(userId);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsStarting(false);
      setSelectedUserId(null);
    }
  }, []);

  return {
    isStarting,
    selectedUserId,
    startConversation,
  };
}
