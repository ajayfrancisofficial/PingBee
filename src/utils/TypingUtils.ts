/**
 * Formats typing user IDs and resolved names into a group-aware or individual-aware typing text.
 *
 * @param userIds List of user IDs who are typing.
 * @param senderNames A map of userId to displayName.
 * @param chatType Optional chat type: 'individual' or 'group'. Defaults to 'group'.
 */
export function getTypingText(
  userIds: string[],
  senderNames: Map<string, string>,
  chatType: 'individual' | 'group' = 'group',
): string {
  if (userIds.length === 0) return '';

  if (chatType === 'individual') {
    return 'typing\u2026';
  }

  const names = userIds.map(id => senderNames.get(id) ?? null);
  if (names.some(n => n === null)) {
    return 'typing\u2026';
  }

  const resolved = names as string[];
  if (resolved.length === 1) {
    return `${resolved[0]} is typing\u2026`;
  }
  if (resolved.length === 2) {
    return `${resolved[0]} and ${resolved[1]} are typing\u2026`;
  }
  const remainingCount = resolved.length - 2;
  return `${resolved[0]}, ${resolved[1]} and ${remainingCount} other${
    remainingCount > 1 ? 's' : ''
  } are typing\u2026`;
}
