# Campus time (lib/time)

This module defines **campus week** semantics: **Monday is the first day of the week** (each week runs Monday–Sunday in UTC). Weeks are numbered from the week that contains the fall semester start and continue through spring, with the entire **winter break** (4–5 calendar weeks) counted as **one** campus week for data collection.

## What to update each year

**Update only this file:** [`config.ts`](./config.ts)

It contains:

- `FALL_SEMESTER_FIRST_DAY` — first day of fall semester (week 1 start)
- `WINTER_BREAK_FIRST_DAY` — first day of winter break
- `WINTER_BREAK_LAST_DAY` — last day of winter break

See the comments in `config.ts` for exact format and rules. No other files in `lib/time` need changes when the academic calendar changes.

## API

- **Constants:** `CAMPUS_WEEK` — semester start, winter break dates, winter break week number, days per week
- **`campusWeekToDateRange(weekNumber)`** — get `{ startDate, endDate }` for a campus week (for querying logs by week)
- **`dateToCampusWeek(date)`** — get the campus week number for a given date (for bucketing or reporting)

All dates are interpreted in UTC (e.g. `created_at` from Supabase).

## Example: pull data for a campus week

```ts
import { campusWeekToDateRange } from "@/lib/time";

const range = campusWeekToDateRange(5);
if (range) {
  const logs = await fetchStudySessionLogs({
    startDate: range.startDate,
    endDate: range.endDate,
  });
}
```

## Example: bucket a log by campus week

```ts
import { dateToCampusWeek } from "@/lib/time";

const week = dateToCampusWeek(new Date(row.created_at));
if (week !== null) {
  // group by week for reports
}
```
