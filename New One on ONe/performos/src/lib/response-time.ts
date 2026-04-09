/** Calculate hours between two timestamps */
export function hoursBetween(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
}

/** Format hours into a human-readable string */
export function formatResponseTime(hours: number): string {
  if (hours < 1) return "under one hour";
  if (hours < 24) return `${Math.round(hours)} ${Math.round(hours) === 1 ? "hour" : "hours"}`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"}`;
}
