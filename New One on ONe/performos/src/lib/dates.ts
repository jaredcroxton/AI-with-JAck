/** Get the Monday of the week for a given date */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
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

/** Format date as YYYY-MM-DD for database */
export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Format as "Monday, DD Month" for dropdown display */
export function formatMondayLabel(date: Date): string {
  return `Monday, ${formatDate(date)}`;
}
