import {
  FALL_SEMESTER_FIRST_DAY,
  WINTER_BREAK_FIRST_DAY,
  WINTER_BREAK_LAST_DAY,
} from "./config";

/** Parse "YYYY-MM-DD" as UTC midnight */
function parseUtcDate(s: string): Date {
  const d = new Date(s + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date string: ${s}`);
  return d;
}

const SEMESTER_START = parseUtcDate(FALL_SEMESTER_FIRST_DAY);
const WINTER_START = parseUtcDate(WINTER_BREAK_FIRST_DAY);
const WINTER_END = parseUtcDate(WINTER_BREAK_LAST_DAY);

/** One day in ms */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Monday = 1 in getUTCDay(); days back to reach Monday from a given UTC day */
function daysBackToMonday(d: Date): number {
  return (d.getUTCDay() + 6) % 7;
}

/** Monday of the week containing the given date (UTC midnight). */
function getMondayOfWeek(d: Date): Date {
  const back = daysBackToMonday(d);
  return new Date(d.getTime() - back * ONE_DAY_MS);
}

/** Week 1 = Monday–Sunday week that contains FALL_SEMESTER_FIRST_DAY */
const WEEK_1_MONDAY = getMondayOfWeek(SEMESTER_START);

/** First Monday on or after the day after winter break (start of first spring week) */
const FIRST_SPRING_MONDAY = (() => {
  const dayAfterBreak = new Date(WINTER_END.getTime() + ONE_DAY_MS);
  const dayOfWeek = dayAfterBreak.getUTCDay();
  const daysUntilMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
  return new Date(dayAfterBreak.getTime() + daysUntilMonday * ONE_DAY_MS);
})();

/** Campus week number for the full winter break period (all 4–5 calendar weeks count as this one) */
export const WINTER_BREAK_CAMPUS_WEEK_NUMBER = (() => {
  const dayBeforeWinter = new Date(WINTER_START.getTime() - ONE_DAY_MS);
  const daysFromWeek1 = Math.floor(
    (dayBeforeWinter.getTime() - WEEK_1_MONDAY.getTime()) / ONE_DAY_MS
  );
  return Math.floor(daysFromWeek1 / 7) + 2;
})();

/** Truncate a Date to UTC calendar day (midnight UTC) */
function toUtcDay(d: Date): Date {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return t;
}

/**
 * Constants describing campus week behavior for use in data queries.
 * Use these when building date ranges to pull data by campus week.
 */
export const CAMPUS_WEEK = {
  /** Monday of week 1 (week 1 = Monday–Sunday containing fall semester start) */
  WEEK_1_MONDAY,
  /** First day of the fall semester */
  SEMESTER_START_DATE: SEMESTER_START,
  /** First calendar day of winter break */
  WINTER_BREAK_START_DATE: WINTER_START,
  /** Last calendar day of winter break */
  WINTER_BREAK_END_DATE: WINTER_END,
  /** First Monday of spring (first Monday on or after day after winter break) */
  FIRST_SPRING_MONDAY,
  /** The single campus week number that represents the entire winter break */
  WINTER_BREAK_WEEK_NUMBER: WINTER_BREAK_CAMPUS_WEEK_NUMBER,
  /** Length of a normal campus week in days (winter break is variable but counts as one week) */
  DAYS_PER_WEEK: 7,
} as const;

export type CampusWeekDateRange = {
  /** Campus week number (1-based, winter break is one number) */
  weekNumber: number;
  /** Start of the week (inclusive), UTC midnight */
  startDate: Date;
  /** End of the week (inclusive), UTC midnight */
  endDate: Date;
};

/**
 * Convert a campus week number to the date range (start and end dates, inclusive).
 * Use these dates with startDate/endDate filters when pulling session logs or other data.
 *
 * - Week 1 = Monday–Sunday week that contains FALL_SEMESTER_FIRST_DAY.
 * - Winter break week = [WINTER_BREAK_FIRST_DAY, WINTER_BREAK_LAST_DAY] (one logical week).
 * - Spring weeks = consecutive Monday–Sunday weeks starting the first Monday after winter break.
 *
 * @param weekNumber - Campus week (1-based)
 * @returns The date range for that week, or null if weekNumber &lt; 1
 */
export function campusWeekToDateRange(weekNumber: number): CampusWeekDateRange | null {
  if (weekNumber < 1) return null;

  if (weekNumber < WINTER_BREAK_CAMPUS_WEEK_NUMBER) {
    const startMs = WEEK_1_MONDAY.getTime() + (weekNumber - 1) * 7 * ONE_DAY_MS;
    const startDate = new Date(startMs);
    const endDate = new Date(startMs + 6 * ONE_DAY_MS);
    return { weekNumber, startDate, endDate };
  }

  if (weekNumber === WINTER_BREAK_CAMPUS_WEEK_NUMBER) {
    return {
      weekNumber,
      startDate: new Date(WINTER_START.getTime()),
      endDate: new Date(WINTER_END.getTime()),
    };
  }

  const weeksAfterBreak = weekNumber - WINTER_BREAK_CAMPUS_WEEK_NUMBER - 1;
  const startMs = FIRST_SPRING_MONDAY.getTime() + weeksAfterBreak * 7 * ONE_DAY_MS;
  const startDate = new Date(startMs);
  const endDate = new Date(startMs + 6 * ONE_DAY_MS);
  return { weekNumber, startDate, endDate };
}

/**
 * Get the campus week number for a given date.
 * Use this to bucket logs or events by campus week for reporting.
 *
 * - Dates before week 1 (Monday of week containing semester start) return null.
 * - Any date inside winter break (inclusive) returns the single winter-break week number.
 * - Fall: week = 1-based Monday–Sunday index from week 1.
 * - Spring: week = winter break week + 1 + weeks from first spring Monday (dates before
 *   that Monday fall in the first spring week).
 *
 * @param date - Any Date (typically created_at from DB); UTC date part is used
 * @returns Campus week number (1-based) or null if before week 1
 */
export function dateToCampusWeek(date: Date): number | null {
  const d = toUtcDay(date);
  const t = d.getTime();

  if (t < WEEK_1_MONDAY.getTime()) return null;

  if (t >= WINTER_START.getTime() && t <= WINTER_END.getTime()) {
    return WINTER_BREAK_CAMPUS_WEEK_NUMBER;
  }

  if (t < WINTER_START.getTime()) {
    const days = Math.floor((t - WEEK_1_MONDAY.getTime()) / ONE_DAY_MS);
    return Math.floor(days / 7) + 1;
  }

  if (t < FIRST_SPRING_MONDAY.getTime()) {
    return WINTER_BREAK_CAMPUS_WEEK_NUMBER + 1;
  }

  const daysFromSpringStart = Math.floor(
    (t - FIRST_SPRING_MONDAY.getTime()) / ONE_DAY_MS
  );
  return WINTER_BREAK_CAMPUS_WEEK_NUMBER + 1 + Math.floor(daysFromSpringStart / 7);
}
