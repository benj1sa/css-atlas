/**
 * Session logs module - generic utilities for entry/exit ticket tables.
 *
 * Use with study_session_logs or any table with similar schema:
 * - id, created_at, scholar_uid, scholar_name, action_type (Entry/Exit)
 *
 * For a new table: create a fetcher that returns SessionLogRow[], then pass
 * to getCleanedAndErroredTickets, getScholarsCurrentlyInRoom, or getScholarsWithValidEntryExit.
 */

export {
  getCleanedAndErroredTickets,
  getScholarsCurrentlyInRoom,
  getScholarsWithValidEntryExit,
  type CleanedAndErroredOptions,
  type ScholarsInRoomOptions,
  type ValidEntryExitOptions,
} from "./session-ticket-utils";

export {
  DEFAULT_SESSION_CONFIG,
  EASTERN_TIMEZONE,
  SESSION_TYPE_STUDY,
  SESSION_TYPE_FRONT_DESK,
  SESSION_TYPES,
} from "./types";

export type {
  SessionLogRow,
  SessionLogConfig,
  SessionType,
  TicketErrorType,
  ProcessedTicket,
  CleanedAndErroredResult,
  ScholarInRoom,
  ScholarWithCompletedSession,
} from "./types";

export {
  fetchStudySessionLogs,
  getStudySessionCleanedAndErrored,
  getStudySessionScholarsInRoom,
  getStudySessionCompletedSessions,
} from "./study-session-logs";

export type { StudySessionLogRow } from "./study-session-logs";

export {
  fetchFrontDeskLogs,
  getFrontDeskCleanedAndErrored,
  getFrontDeskScholarsInRoom,
  getFrontDeskCompletedSessions,
} from "./front-desk-logs";

export type { FrontDeskLogRow } from "./front-desk-logs";
