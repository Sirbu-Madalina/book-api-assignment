export function getDeadlineText(targetDate: string): string {
  const today = new Date();
  const deadline = new Date(targetDate);

  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffInMs = deadline.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return "Overdue";
  if (diffInDays === 0) return "Due today";
  if (diffInDays === 1) return "1 day left";

  return `${diffInDays} days left`;
}