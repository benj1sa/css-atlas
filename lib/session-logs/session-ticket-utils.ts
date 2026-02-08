import {
  type SessionLogRow,
  type SessionLogConfig,
  DEFAULT_SESSION_CONFIG,
  type ProcessedTicket,
  type CleanedAndErroredResult,
  type ScholarInRoom,
  type ScholarWithCompletedSession,
  type TicketErrorType,
  type SessionType,
} from "./types";

/**
 * Check if action is Entry or Exit based on config.
 */
function isEntry(row: SessionLogRow, config: SessionLogConfig): boolean {
  return (row.action_type ?? "").trim() === config.entryAction;
}

function isExit(row: SessionLogRow, config: SessionLogConfig): boolean {
  return (row.action_type ?? "").trim() === config.exitAction;
}

/**
 * Options for getCleanedAndErroredTickets.
 * - treatUnclosedEntryAsError: When true, scholars with entry but no exit are
 *   marked as ENTRY_WITHOUT_SAME_DAY_EXIT. Use for closed-period analysis.
 * - sessionType: Filter to only process tickets of this session type
 *   (e.g. "Study Session" or "Front Desk"). Omit to process all.
 */
export interface CleanedAndErroredOptions {
  treatUnclosedEntryAsError?: boolean;
  sessionType?: SessionType | string;
}

/**
 * Core utility: Categorize all tickets by scholar as cleaned or errored.
 * Handles: double exit, double enter, exit before enter, exit without enter,
 * and entry without same-day exit (when treatUnclosedEntryAsError is true).
 *
 * Table-agnostic: works on any array of rows matching SessionLogRow.
 */
function filterBySessionType(
  rows: SessionLogRow[],
  sessionType?: SessionType | string
): SessionLogRow[] {
  if (sessionType == null || sessionType === "") return rows;
  return rows.filter((r) => (r.session_type ?? "").trim() === sessionType);
}

export function getCleanedAndErroredTickets(
  rows: SessionLogRow[],
  config: SessionLogConfig = DEFAULT_SESSION_CONFIG,
  options: CleanedAndErroredOptions = {}
): CleanedAndErroredResult {
  const { treatUnclosedEntryAsError = false, sessionType } = options;
  const filtered = filterBySessionType(rows, sessionType);
  const byScholarUid = new Map<
    string,
    { cleaned: ProcessedTicket[]; errored: ProcessedTicket[]; scholarName: string | null }
  >();
  const allCleaned: ProcessedTicket[] = [];
  const allErrored: ProcessedTicket[] = [];

  // Group by scholar_uid
  const byUid = new Map<string, SessionLogRow[]>();
  for (const row of filtered) {
    const uid = row.scholar_uid ?? "";
    if (!uid) continue;
    if (!byUid.has(uid)) {
      byUid.set(uid, []);
    }
    byUid.get(uid)!.push(row);
  }

  for (const [uid, tickets] of byUid) {
    const sorted = [...tickets].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const scholarName = sorted[0]?.scholar_name ?? null;

    const { cleaned, errored } = processScholarTickets(sorted, config, treatUnclosedEntryAsError);
    byScholarUid.set(uid, { cleaned, errored, scholarName });
    allCleaned.push(...cleaned);
    allErrored.push(...errored);
  }

  return { byScholarUid, allCleaned, allErrored };
}

/**
 * Process a single scholar's tickets chronologically.
 */
function processScholarTickets(
  tickets: SessionLogRow[],
  config: SessionLogConfig,
  treatUnclosedEntryAsError: boolean
): { cleaned: ProcessedTicket[]; errored: ProcessedTicket[] } {
  const cleaned: ProcessedTicket[] = [];
  const errored: ProcessedTicket[] = [];
  let inRoom = false;
  let lastEntryAt: string | null = null;
  let lastActionWasExit = false;

  for (const ticket of tickets) {
    const isEntryTicket = isEntry(ticket, config);
    const isExitTicket = isExit(ticket, config);

    if (!isEntryTicket && !isExitTicket) {
      cleaned.push({ ticket });
      lastActionWasExit = false;
      continue;
    }

    if (isEntryTicket) {
      lastActionWasExit = false;
      if (inRoom) {
        errored.push({ ticket, error: "DOUBLE_ENTER" });
      } else {
        inRoom = true;
        lastEntryAt = ticket.created_at;
        cleaned.push({ ticket });
      }
      continue;
    }

    // isExitTicket
    if (!inRoom) {
      const errorType: TicketErrorType =
        lastActionWasExit ? "DOUBLE_EXIT" : "EXIT_BEFORE_ENTER";
      errored.push({
        ticket,
        error: errorType,
        pairedEntryAt: lastEntryAt ?? undefined,
      });
      lastActionWasExit = true;
    } else {
      lastActionWasExit = true;
      cleaned.push({
        ticket,
        pairedEntryAt: lastEntryAt ?? undefined,
      });
      inRoom = false;
      lastEntryAt = null;
    }
  }

  // Remaining in room = entry without exit catalogued (only error if treating as such)
  if (treatUnclosedEntryAsError && inRoom && lastEntryAt) {
    const lastEntryTicket = tickets.find(
      (t) => t.created_at === lastEntryAt && isEntry(t, config)
    );
    if (lastEntryTicket) {
      const idx = cleaned.findIndex((p) => p.ticket.id === lastEntryTicket.id);
      if (idx >= 0) {
        cleaned.splice(idx, 1);
        errored.push({
          ticket: lastEntryTicket,
          error: "ENTRY_WITHOUT_SAME_DAY_EXIT",
        });
      }
    }
  }

  return { cleaned, errored };
}

export interface ScholarsInRoomOptions {
  /** Filter to this session type (e.g. "Study Session" or "Front Desk") */
  sessionType?: SessionType | string;
  /** Timestamp for "current" time (default: now). Use for historical queries. */
  asOf?: Date;
}

/**
 * Get scholars currently in the room (valid entry without exit).
 * Uses getCleanedAndErroredTickets - pass only the cleaned tickets that are entries
 * and have no following exit in the same scholar's sequence.
 */
export function getScholarsCurrentlyInRoom(
  rows: SessionLogRow[],
  config: SessionLogConfig = DEFAULT_SESSION_CONFIG,
  options: ScholarsInRoomOptions = {}
): ScholarInRoom[] {
  const { sessionType, asOf = new Date() } = options;
  const { byScholarUid } = getCleanedAndErroredTickets(rows, config, {
    sessionType,
  });
  const result: ScholarInRoom[] = [];

  for (const [uid, { cleaned, scholarName }] of byScholarUid) {
    const entryTickets = cleaned.filter(
      (p) => (p.ticket.action_type ?? "").trim() === config.entryAction
    );
    const exitTickets = cleaned.filter(
      (p) => (p.ticket.action_type ?? "").trim() === config.exitAction
    );

    if (entryTickets.length === 0) continue;

    // Pair entries with exits chronologically
    const entries = [...entryTickets].sort(
      (a, b) =>
        new Date(a.ticket.created_at).getTime() -
        new Date(b.ticket.created_at).getTime()
    );
    const exits = [...exitTickets].sort(
      (a, b) =>
        new Date(a.ticket.created_at).getTime() -
        new Date(b.ticket.created_at).getTime()
    );

    let exitIdx = 0;
    let lastUnmatchedEntry: ProcessedTicket | null = null;

    for (const entry of entries) {
      const entryTime = new Date(entry.ticket.created_at).getTime();
      // Find next exit after this entry
      while (
        exitIdx < exits.length &&
        new Date(exits[exitIdx].ticket.created_at).getTime() <= entryTime
      ) {
        exitIdx++;
      }
      if (exitIdx < exits.length) {
        exitIdx++; // consumed this exit
        lastUnmatchedEntry = null;
      } else {
        lastUnmatchedEntry = entry;
      }
    }

    if (lastUnmatchedEntry) {
      const entryAt = lastUnmatchedEntry.ticket.created_at;
      const timeInRoomMs = asOf.getTime() - new Date(entryAt).getTime();
      result.push({
        scholarUid: uid,
        scholarName,
        entryTicket: lastUnmatchedEntry.ticket,
        entryAt,
        timeInRoomMs: Math.max(0, timeInRoomMs),
        sessionType: lastUnmatchedEntry.ticket.session_type ?? undefined,
      });
    }
  }

  return result;
}

export interface ValidEntryExitOptions {
  /** Filter to this session type */
  sessionType?: SessionType | string;
}

/**
 * Get scholars with valid entry-exit pairs and their session duration.
 */
export function getScholarsWithValidEntryExit(
  rows: SessionLogRow[],
  config: SessionLogConfig = DEFAULT_SESSION_CONFIG,
  options: ValidEntryExitOptions = {}
): ScholarWithCompletedSession[] {
  const { sessionType } = options;
  const { byScholarUid } = getCleanedAndErroredTickets(rows, config, {
    sessionType,
  });
  const result: ScholarWithCompletedSession[] = [];

  for (const [uid, { cleaned, scholarName }] of byScholarUid) {
    const entryTickets = cleaned
      .filter((p) => (p.ticket.action_type ?? "").trim() === config.entryAction)
      .sort(
        (a, b) =>
          new Date(a.ticket.created_at).getTime() -
          new Date(b.ticket.created_at).getTime()
      );
    const exitTickets = cleaned
      .filter((p) => (p.ticket.action_type ?? "").trim() === config.exitAction)
      .sort(
        (a, b) =>
          new Date(a.ticket.created_at).getTime() -
          new Date(b.ticket.created_at).getTime()
      );

    for (const exit of exitTickets) {
      const exitTime = new Date(exit.ticket.created_at).getTime();
      const pairedEntryAt = exit.pairedEntryAt;
      if (!pairedEntryAt) continue;

      const entry = entryTickets.find(
        (e) => e.ticket.created_at === pairedEntryAt
      );
      if (!entry) continue;

      const entryTime = new Date(pairedEntryAt).getTime();
      const durationMs = exitTime - entryTime;

      result.push({
        scholarUid: uid,
        scholarName,
        entryTicket: entry.ticket,
        exitTicket: exit.ticket,
        entryAt: pairedEntryAt,
        exitAt: exit.ticket.created_at,
        durationMs,
        sessionType: entry.ticket.session_type ?? undefined,
      });
    }
  }

  return result;
}
