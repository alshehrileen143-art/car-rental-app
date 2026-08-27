const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Normalizes any Date/ISO-string input to a UTC-midnight instant representing
 * that plain calendar date. All server-side date math works in UTC so booking
 * dates are stable regardless of the server process's local timezone.
 */
export function toCalendarDate(date: Date | string): Date {
  if (typeof date === "string") {
    const datePart = date.slice(0, 10);
    return new Date(`${datePart}T00:00:00.000Z`);
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Inclusive calendar-day count between two dates (endDate - startDate, in days). */
export function nightsBetween(startDate: Date | string, endDate: Date | string): number {
  const start = toCalendarDate(startDate).getTime();
  const end = toCalendarDate(endDate).getTime();
  return Math.round((end - start) / MS_PER_DAY);
}

/**
 * Two inclusive date ranges [aStart, aEnd] and [bStart, bEnd] overlap when
 * aStart <= bEnd AND aEnd >= bStart.
 */
export function rangesOverlap(
  aStart: Date | string,
  aEnd: Date | string,
  bStart: Date | string,
  bEnd: Date | string
): boolean {
  const as = toCalendarDate(aStart).getTime();
  const ae = toCalendarDate(aEnd).getTime();
  const bs = toCalendarDate(bStart).getTime();
  const be = toCalendarDate(bEnd).getTime();
  return as <= be && ae >= bs;
}

/** Every calendar day covered by an inclusive [startDate, endDate] range, as "YYYY-MM-DD" strings. */
export function expandRangeToIsoDates(startDate: Date | string, endDate: Date | string): string[] {
  const start = toCalendarDate(startDate).getTime();
  const end = toCalendarDate(endDate).getTime();
  const days: string[] = [];
  for (let t = start; t <= end; t += MS_PER_DAY) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

/** Builds the set of all booked "YYYY-MM-DD" strings across multiple confirmed bookings. */
export function buildBookedDatesSet(
  bookings: { startDate: Date | string; endDate: Date | string }[]
): Set<string> {
  const set = new Set<string>();
  for (const b of bookings) {
    for (const iso of expandRangeToIsoDates(b.startDate, b.endDate)) {
      set.add(iso);
    }
  }
  return set;
}
