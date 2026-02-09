/**
 * Campus time: week numbering from fall semester start, with winter break
 * counted as a single week. Use for data queries and reporting by campus week.
 *
 * To update the academic calendar each year, edit only: ./config.ts
 * See ./README.md for full documentation.
 */

export {
  CAMPUS_WEEK,
  campusWeekToDateRange,
  dateToCampusWeek,
  EASTERN_TIMEZONE,
  WINTER_BREAK_CAMPUS_WEEK_NUMBER,
} from "./campus-week";
export type { CampusWeekDateRange } from "./campus-week";
export {
  FALL_SEMESTER_FIRST_DAY,
  WINTER_BREAK_FIRST_DAY,
  WINTER_BREAK_LAST_DAY,
  WEEKS_IGNORE_FORMS,
  WEEKS_IGNORE_SESSIONS,
} from "./config";
