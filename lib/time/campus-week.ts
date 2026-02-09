import {
  FALL_SEMESTER_FIRST_DAY,
  WINTER_BREAK_FIRST_DAY,
  WINTER_BREAK_LAST_DAY,
} from "./config";

export const EASTERN_TIMEZONE = "America/New_York";

/** One day in ms */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Parse "YYYY-MM-DD" as midnight Eastern (start of that calendar day in America/New_York).
 * Handles EST/EDT automatically.
 */
function parseEasternDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Invalid date string: ${s}`);
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIMEZONE,
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    second: "numeric",
  });
  const parts = formatter.formatToParts(utcNoon);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const second = parseInt(parts.find((p) => p.type === "second")?.value ?? "0", 10);
  const easternMsSinceMidnight = (hour * 3600 + minute * 60 + second) * 1000;
  const d2 = new Date(utcNoon.getTime() - easternMsSinceMidnight);
  if (Number.isNaN(d2.getTime())) throw new Error(`Invalid date string: ${s}`);
  return d2;
}

const SEMESTER_START = parseEasternDate(FALL_SEMESTER_FIRST_DAY);
const WINTER_START = parseEasternDate(WINTER_BREAK_FIRST_DAY);
const WINTER_END = parseEasternDate(WINTER_BREAK_LAST_DAY);

/**
 * Get day of week in Eastern (0=Sun, 1=Mon, ..., 6=Sat).
 */
function getEasternDayOfWeek(d: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIMEZONE,
    weekday: "short",
  });
  const day = formatter.format(d);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[day] ?? 0;
}

/** Truncate a Date to its Eastern calendar day (midnight Eastern). */
function toEasternDay(d: Date): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(d);
  const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "0", 10);
  const month = parseInt(parts.find((p) => p.type === "month")?.value ?? "1", 10) - 1;
  const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "1", 10);
  return parseEasternDate(
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  );
}

/** Days back to reach Monday from a given Eastern day (Monday=1). */
function daysBackToMondayEastern(d: Date): number {
  return (getEasternDayOfWeek(d) + 6) % 7;
}

/** Monday midnight Eastern of the week containing the given date (interpreted in Eastern). */
function getMondayOfWeekEastern(d: Date): Date {
  const easternDay = toEasternDay(d);
  const back = daysBackToMondayEastern(easternDay);
  return new Date(easternDay.getTime() - back * ONE_DAY_MS);
}

/** Week 1 = Monday–Sunday week (Eastern) that contains FALL_SEMESTER_FIRST_DAY */
const WEEK_1_MONDAY = getMondayOfWeekEastern(SEMESTER_START);

/** First Monday on or after the day after winter break (Eastern; start of first spring week) */
const FIRST_SPRING_MONDAY = (() => {
  const dayAfterBreak = new Date(WINTER_END.getTime() + ONE_DAY_MS);
  const dayOfWeek = getEasternDayOfWeek(dayAfterBreak);
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
  /** Start of the week (inclusive), midnight Eastern */
  startDate: Date;
  /** End of the week (inclusive), midnight Eastern of last day */
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
 * @param date - Any Date (typically created_at from DB); interpreted in Eastern time
 * @returns Campus week number (1-based) or null if before week 1
 */
export function dateToCampusWeek(date: Date): number | null {
  const d = toEasternDay(date);
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
