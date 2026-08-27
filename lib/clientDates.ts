/**
 * Client-side calendar date helpers. These work purely with LOCAL date
 * components (never UTC conversion) so that the day the user visually clicks
 * in the picker is exactly the day sent to the server, regardless of the
 * browser's timezone offset. The server independently normalizes the same
 * "YYYY-MM-DD" string to UTC (see lib/dateRanges.ts) - the plain string is
 * the timezone-agnostic contract between the two.
 */

export function dateToLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysLocalIso(iso: string, amount: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return dateToLocalIso(new Date(y, m - 1, d + amount));
}

/** Every calendar day covered by an inclusive [fromIso, toIso] range, as "YYYY-MM-DD" strings. */
export function expandLocalRange(fromIso: string, toIso: string): string[] {
  const days: string[] = [];
  let cursor = fromIso;
  let guard = 0;
  while (cursor <= toIso && guard < 3660) {
    days.push(cursor);
    cursor = addDaysLocalIso(cursor, 1);
    guard += 1;
  }
  return days;
}
