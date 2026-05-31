import { useState, useEffect } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../../db';
import User from '../../db/models/User';
import { LocalMessage } from './useLocalMessages';

export function useResolvedSenderNames(
  messages: LocalMessage[],
  userId: string | number | null,
) {
  const [senderNames, setSenderNames] = useState<Map<string, string>>(
    new Map(),
  );

  // Get unique IDs, sorted to keep the hook dependencies stable
  const replySenderIds = messages
    .map(m => m.replyMessage?.senderId)
    .filter(Boolean) as string[];

  const allIds = [...messages.map(m => m.senderId), ...replySenderIds].filter(
    id => id !== String(userId),
  );

  const uniqueIdsStr = [...new Set(allIds)].sort().join(',');

  useEffect(() => {
    if (userId === null || !uniqueIdsStr) return;

    const ids = uniqueIdsStr.split(',');

    const subscription = database
      .get<User>('users')
      .query(Q.where('id', Q.oneOf(ids)))
      .observe()
      .subscribe({
        next: users => {
          setSenderNames(prev => {
            const nextMap = new Map(prev);
            users.forEach(u => nextMap.set(u.id, u.displayName));
            return nextMap;
          });
        },
        error: err => {
          console.warn(
            '[useResolvedSenderNames] sender name observation failed:',
            err,
          );
        },
      });

    return () => subscription.unsubscribe();
  }, [uniqueIdsStr, userId]);

  return senderNames;
}
