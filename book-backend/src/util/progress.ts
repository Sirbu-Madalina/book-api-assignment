export function getProgressPercent(
  currentPage: number,
  totalPages: number
): number {
  if (totalPages <= 0) return 0;
  if (currentPage <= 0) return 0;

  return Math.min(100, Math.round((currentPage / totalPages) * 100));
}