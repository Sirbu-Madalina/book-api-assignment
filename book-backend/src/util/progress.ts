export function getProgressPercent(
  currentPage: number,
  totalPages: number
): number {
  // If the values are invalid, like zero or negative, it returns 0 to avoid errors
  if (totalPages <= 0) return 0;
  if (currentPage <= 0) return 0;

  return Math.min(100, Math.round((currentPage / totalPages) * 100));
}