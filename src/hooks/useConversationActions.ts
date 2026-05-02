import { useState, useCallback } from 'react';
import { chatApi } from '../api/RESTApi/chatApi';

export function useConversationActions() {
  const [isStarting, setIsStarting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const startConversation = useCallback(async (userId: number) => {
    setIsStarting(true);
    setSelectedUserId(userId);
    try {
      const response = await chatApi.getOrCreateConversation(userId);
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
