/**
 * Formats a millisecond timestamp into a short "h:mm AM/PM" time string
 * for use inside message bubbles.
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${period}`;
}

/**
 * Formats a Date object into a human-readable day label for the chat date separator.
 * Returns "Today", "Yesterday", or a full date string like "26 May 2026".
 */
export function formatSeparatorDate(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Safely parses any date/timestamp representation into a millisecond timestamp.
 * Handles ISO strings, Unix timestamps (seconds or milliseconds) as strings or numbers.
 */
export const parseDateToMillis = (val: string | number | undefined | null): number => {
  if (!val) return Date.now();

  // If it's a number, check if it's in seconds vs milliseconds
  if (typeof val === 'number') {
    return val < 9999999999 ? val * 1000 : val;
  }

  // If it's a numeric string, parse it as a number first
  const parsed = Number(val);
  if (!isNaN(parsed) && val.trim() !== '') {
    return parsed < 9999999999 ? parsed * 1000 : parsed;
  }

  // Fall back to standard date parsing for ISO/date strings
  const date = new Date(val);
  const time = date.getTime();
  return isNaN(time) ? Date.now() : time;
};
