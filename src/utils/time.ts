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
