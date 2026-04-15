export function getDeadlineText(targetDate: string): string {
  const today = new Date();
  const deadline = new Date(targetDate);

  // hours, minutes, seconds, milliseconds, it resets the time to midnight so only the date is compared, not the exact time
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  //calculates the difference between the deadline and today in milliseconds
  const diffInMs = deadline.getTime() - today.getTime();
  //math.ceil is used in order to round the number, to not show 0.6 days left
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return "Overdue";
  if (diffInDays === 0) return "Due today";
  if (diffInDays === 1) return "1 day left";

  return `${diffInDays} days left`;
}