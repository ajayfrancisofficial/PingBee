import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useUserStore } from '../store/userStore';
import { useOnlineUsersStore } from '../store/onlineUsersStore';
import { database } from '../db';
import ChatParticipant from '../db/models/ChatParticipant';

interface UseChatOnlineStatusProps {
  chatId: string;
  chatType?: 'individual' | 'group';
  routeOtherUserId?: string;
}

export const useChatOnlineStatus = ({
  chatId,
  chatType,
  routeOtherUserId,
}: UseChatOnlineStatusProps) => {
  const { userId } = useUserStore();
  const [resolvedOtherUserId, setResolvedOtherUserId] = useState<string | null>(
    routeOtherUserId ?? null,
  );

  useEffect(() => {
    // Only resolve if it's an individual chat and we don't already have it
    if (chatType !== 'individual' || routeOtherUserId || !userId) return;

    const resolve = async () => {
      try {
        const participants = await database
          .get<ChatParticipant>('chat_participants')
          .query(
            Q.where('chat_id', chatId),
            Q.where('user_id', Q.notEq(String(userId))),
          )
          .fetch();
        if (participants.length > 0) {
          setResolvedOtherUserId(participants[0].userId);
        }
      } catch (err) {
        console.warn(
          '[useChatOnlineStatus] Failed to resolve otherUserId:',
          err,
        );
      }
    };
    resolve();
  }, [chatId, chatType, routeOtherUserId, userId]);

  const isOnline = useOnlineUsersStore(state =>
    chatType === 'individual' && resolvedOtherUserId
      ? state.onlineUserIds.has(resolvedOtherUserId)
      : false,
  );

  return { isOnline, resolvedOtherUserId };
};
