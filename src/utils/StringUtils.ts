/**
 * Helper to get initials from a user's full name.
 * Displays first letter of first name and first letter of last name.
 * If single name, displays the first 2 letters of the name.
 * Returns '?' if name is empty.
 *
 * @param name The full name or display name string
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
