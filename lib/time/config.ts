/**
 * Campus academic calendar configuration
 * ======================================
 *
 * This is the ONLY file you need to update when the academic calendar changes
 * (typically once per fall semester). All campus-week logic in lib/time uses
 * these values.
 *
 * WHAT TO CHANGE EACH YEAR
 * -----------------------
 * 1. FALL_SEMESTER_FIRST_DAY
 *    - The first day of the fall semester (first day of classes).
 *    - Format: "YYYY-MM-DD". Week 1 is the Monday–Sunday week that contains this date.
 *
 * 2. WINTER_BREAK_FIRST_DAY
 *    - The first calendar day of winter break (e.g. last day of fall classes + 1,
 *      or the Monday when break officially starts).
 *
 * 3. WINTER_BREAK_LAST_DAY
 *    - The last calendar day of winter break (e.g. day before spring classes resume).
 *    - All calendar days in [WINTER_BREAK_FIRST_DAY, WINTER_BREAK_LAST_DAY] are
 *      treated as a single "campus week" for data collection (winter break can
 *      be 4–5 real weeks but counts as one).
 *
 * RULES
 * -----
 * - Monday is the first day of the week. Each campus week runs Monday–Sunday (UTC).
 * - Week 1 is the Monday–Sunday week that contains FALL_SEMESTER_FIRST_DAY.
 * - Fall weeks count 1, 2, 3, ... (each Monday–Sunday) up to the week before winter break.
 * - The entire winter break span is one campus week (one week number).
 * - Spring weeks resume on the first Monday on or after the day after WINTER_BREAK_LAST_DAY,
 *   and continue with consecutive Monday–Sunday weeks.
 *
 * Example (2024–25):
 *   Fall starts Aug 26 → weeks 1–16 (or so).
 *   Winter break Dec 16 – Jan 12 → that whole period = one campus week (e.g. 17).
 *   Spring Jan 13 onward → weeks 18, 19, ...
 */

export const FALL_SEMESTER_FIRST_DAY = "2025-09-01";
export const WINTER_BREAK_FIRST_DAY = "2025-12-16";
export const WINTER_BREAK_LAST_DAY = "2026-01-28";
