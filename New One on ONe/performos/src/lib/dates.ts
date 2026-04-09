/** Get the Monday of the week for a given date (timezone-safe) */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0); // noon to avoid DST edge cases
  const day = d.getDay();
  // getDay: 0=Sun, 1=Mon, ... 6=Sat
  // We want to go back to Monday (day 1)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Get the last N Mondays including the current week */
export function getLastNMondays(n: number): Date[] {
  const mondays: Date[] = [];
  const today = new Date();
  const currentMonday = getMondayOfWeek(today);

  for (let i = 0; i < n; i++) {
    const monday = new Date(currentMonday);
    monday.setDate(monday.getDate() - i * 7);
    mondays.push(monday);
  }

  return mondays;
}

/** Format a date as DD Month YYYY */
export function formatDate(date: Date): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const day = date.getDate().toString().padStart(2, "0");
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** Format date as YYYY-MM-DD for database (uses local time, not UTC) */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format as "Monday, DD Month" for dropdown display */
export function formatMondayLabel(date: Date): string {
  return `Monday, ${formatDate(date)}`;
}
