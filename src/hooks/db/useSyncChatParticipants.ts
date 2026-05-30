import { useEffect, useState } from 'react';
import { chatApi } from '../../api/RESTApi/chatApi';
import { DBService } from '../../services/DB/DBService';
import type { ChatUserDetailsResponse } from '../../types/ApiTypes/RestApiTypes/restApiTypes';

/**
 * Custom hook to synchronize chat participant details (names, avatars, etc.)
 * from the backend to the local WatermelonDB.
 *
 * Returns:
 *  - isLoading   → true while the fetch is in flight
 *  - userDetails → the array of participant profiles returned by the server
 */
export function useSyncChatParticipants(chatId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<
    ChatUserDetailsResponse['data']
  >([]);

  useEffect(() => {
    if (!chatId) return;

    const sync = async () => {
      setIsLoading(true);
      try {
        const response = await chatApi.fetchChatUserDetails(chatId);
        if (response.success && response.data) {
          setUserDetails(response.data);
          await DBService.upsertUserDetails(response.data);
        }
      } catch (err) {
        console.warn(
          `[useSyncChatParticipants] Failed to sync for chat ${chatId}:`,
          err,
        );
      } finally {
        setIsLoading(false);
      }
    };

    sync();
  }, [chatId]);

  return { isLoading, userDetails };
}
