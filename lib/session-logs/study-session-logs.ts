"use server";

import { createClient } from "@/lib/supabase/server";
import type { SessionLogRow, SessionType } from "./types";
import {
  getCleanedAndErroredTickets,
  getScholarsCurrentlyInRoom,
  getScholarsWithValidEntryExit,
  type CleanedAndErroredOptions,
  type ScholarsInRoomOptions,
} from "./session-ticket-utils";

/**
 * Supabase row shape for study_session_logs.
 * Maps to SessionLogRow for use with generic utilities.
 */
export interface StudySessionLogRow {
  id: string;
  created_at: string;
  rep_name: string | null;
  scholar_name: string | null;
  scholar_uid: string | null;
  action_type: string | null;
  session_type: string | null;
  submitted_by_email: string | null;
}

function toSessionLogRow(row: StudySessionLogRow): SessionLogRow {
  return {
    id: row.id,
    created_at: row.created_at,
    scholar_uid: row.scholar_uid,
    scholar_name: row.scholar_name,
    action_type: row.action_type,
    rep_name: row.rep_name,
    session_type: row.session_type,
    submitted_by_email: row.submitted_by_email,
  };
}

/**
 * Fetch study session logs. Optional filters.
 * For other tables with similar schema, create a similar fetcher and pass
 * the rows to the generic utilities.
 */
export async function fetchStudySessionLogs(options?: {
  startDate?: Date;
  endDate?: Date;
  /** Filter to this session type (e.g. "Study Session" or "Front Desk") */
  sessionType?: SessionType | string;
}): Promise<SessionLogRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("study_session_logs")
    .select("*")
    .order("created_at", { ascending: true });

  if (options?.startDate) {
    query = query.gte("created_at", options.startDate.toISOString());
  }
  if (options?.endDate) {
    query = query.lte("created_at", options.endDate.toISOString());
  }
  if (options?.sessionType) {
    query = query.eq("session_type", options.sessionType);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) =>
    toSessionLogRow(row as StudySessionLogRow)
  );
}

/**
 * Get cleaned and errored tickets from study_session_logs.
 * Use treatUnclosedEntryAsError: true for closed-period analysis (e.g. yesterday's data).
 */
export async function getStudySessionCleanedAndErrored(
  options?: {
    startDate?: Date;
    endDate?: Date;
    sessionType?: SessionType | string;
  } & CleanedAndErroredOptions
) {
  const rows = await fetchStudySessionLogs(options);
  return getCleanedAndErroredTickets(rows, undefined, {
    treatUnclosedEntryAsError: options?.treatUnclosedEntryAsError,
    sessionType: options?.sessionType,
  });
}

/**
 * Get scholars currently in the room (valid entry, no exit yet)
 * and how long they've been in the room.
 */
export async function getStudySessionScholarsInRoom(
  options?: ScholarsInRoomOptions & { startDate?: Date; endDate?: Date }
) {
  const rows = await fetchStudySessionLogs(options);
  return getScholarsCurrentlyInRoom(rows, undefined, options ?? {});
}

/**
 * Get scholars with valid entry-exit pairs and their session duration.
 */
export async function getStudySessionCompletedSessions(options?: {
  startDate?: Date;
  endDate?: Date;
  sessionType?: SessionType | string;
}) {
  const rows = await fetchStudySessionLogs(options);
  return getScholarsWithValidEntryExit(rows, undefined, options ?? {});
}
