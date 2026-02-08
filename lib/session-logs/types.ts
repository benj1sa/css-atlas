/**
 * Session log types - designed to work with study_session_logs and similar tables.
 * The minimal row shape allows different tables to be used interchangeably.
 */

/** Eastern timezone for all date logic (handles EST/EDT) */
export const EASTERN_TIMEZONE = "America/New_York";

/**
 * Session types - study session vs front desk.
 */
export const SESSION_TYPE_STUDY = "Study Session";
export const SESSION_TYPE_FRONT_DESK = "Front Desk";

export type SessionType = typeof SESSION_TYPE_STUDY | typeof SESSION_TYPE_FRONT_DESK;

export const SESSION_TYPES: SessionType[] = [
  SESSION_TYPE_STUDY,
  SESSION_TYPE_FRONT_DESK,
];

/**
 * Minimal row shape that session log tables must satisfy.
 * Extra columns (rep_name, etc.) are preserved in outputs.
 */
export interface SessionLogRow {
  id: string;
  created_at: string;
  scholar_uid: string | null;
  scholar_name: string | null;
  action_type: string | null;
  session_type?: string | null;
  [key: string]: unknown;
}

/**
 * Configuration for matching entry/exit actions.
 * Override when using tables with different action type values.
 */
export interface SessionLogConfig {
  entryAction: string;
  exitAction: string;
}

export const DEFAULT_SESSION_CONFIG: SessionLogConfig = {
  entryAction: "Entry",
  exitAction: "Exit",
};

/**
 * Error types for invalid ticket sequences.
 */
export type TicketErrorType =
  | "DOUBLE_EXIT"           // Exited twice without re-entering
  | "DOUBLE_ENTER"          // Entered twice without exiting
  | "EXIT_BEFORE_ENTER"     // Exit ticket before any entry
  | "EXIT_WITHOUT_ENTER"    // Exit with no matching entry
  | "ENTRY_WITHOUT_SAME_DAY_EXIT"; // Entry has no exit catalogued

/**
 * A ticket with its processing result - either clean or errored.
 */
export interface ProcessedTicket {
  ticket: SessionLogRow;
  error?: TicketErrorType;
  /** For clean exit tickets: when the matching entry occurred */
  pairedEntryAt?: string;
}

/**
 * Result of cleaning/categorizing tickets by scholar.
 */
export interface CleanedAndErroredResult {
  byScholarUid: Map<
    string,
    {
      cleaned: ProcessedTicket[];
      errored: ProcessedTicket[];
      scholarName: string | null;
    }
  >;
  allCleaned: ProcessedTicket[];
  allErrored: ProcessedTicket[];
}

/**
 * Scholar currently in the room (valid entry, no exit yet).
 */
export interface ScholarInRoom {
  scholarUid: string;
  scholarName: string | null;
  entryTicket: SessionLogRow;
  entryAt: string;
  /** Duration in milliseconds */
  timeInRoomMs: number;
  /** Session type when filtered */
  sessionType?: string | null;
}

/**
 * Scholar with a completed entry-exit pair.
 */
export interface ScholarWithCompletedSession {
  scholarUid: string;
  scholarName: string | null;
  entryTicket: SessionLogRow;
  exitTicket: SessionLogRow;
  entryAt: string;
  exitAt: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Session type when filtered */
  sessionType?: string | null;
}
