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
 * scholar_name omitted — resolve from public.users by scholar_uid when needed.
 */
export interface StudySessionLogRow {
  id: string;
  created_at: string;
  rep_name: string | null;
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
    action_type: row.action_type,
    rep_name: row.rep_name,
    session_type: row.session_type,
    submitted_by_email: row.submitted_by_email,
  };
}

/**
 * Fetch scholar names from public.users by uid.
 * Returns Map<uid, "First Last">. Missing UIDs are not included.
 */
async function fetchScholarNamesByUids(
  uids: string[]
): Promise<Map<string, string>> {
  if (uids.length === 0) return new Map();

  const supabase = await createClient();
  const uniqueUids = [...new Set(uids)].filter(Boolean);
  const { data, error } = await supabase
    .from("users")
    .select("uid, first_name, last_name")
    .in("uid", uniqueUids);

  if (error) throw error;

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
    if (row.uid && name) {
      map.set(row.uid, name);
    }
  }
  return map;
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
    .select("id, created_at, rep_name, scholar_uid, action_type, session_type, submitted_by_email")
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
 * Scholar names resolved from public.users. Use treatUnclosedEntryAsError: true
 * for closed-period analysis (e.g. yesterday's data).
 */
export async function getStudySessionCleanedAndErrored(
  options?: {
    startDate?: Date;
    endDate?: Date;
    sessionType?: SessionType | string;
  } & CleanedAndErroredOptions
) {
  const rows = await fetchStudySessionLogs(options);
  const result = getCleanedAndErroredTickets(rows, undefined, {
    treatUnclosedEntryAsError: options?.treatUnclosedEntryAsError,
    sessionType: options?.sessionType,
  });

  const uids = Array.from(result.byScholarUid.keys());
  const nameMap = await fetchScholarNamesByUids(uids);

  const enrichedByScholarUid = new Map(result.byScholarUid);
  for (const [uid, data] of enrichedByScholarUid) {
    enrichedByScholarUid.set(uid, {
      ...data,
      scholarName: nameMap.get(uid) ?? null,
    });
  }

  return { ...result, byScholarUid: enrichedByScholarUid };
}

/**
 * Get scholars currently in the room (valid entry, no exit yet)
 * and how long they've been in the room.
 * Scholar names resolved from public.users.
 */
export async function getStudySessionScholarsInRoom(
  options?: ScholarsInRoomOptions & { startDate?: Date; endDate?: Date }
) {
  const rows = await fetchStudySessionLogs(options);
  const result = getScholarsCurrentlyInRoom(rows, undefined, options ?? {});

  const uids = result.map((r) => r.scholarUid);
  const nameMap = await fetchScholarNamesByUids(uids);

  return result.map((r) => ({
    ...r,
    scholarName: nameMap.get(r.scholarUid) ?? null,
  }));
}

/**
 * Get scholars with valid entry-exit pairs and their session duration.
 * Scholar names resolved from public.users.
 */
export async function getStudySessionCompletedSessions(options?: {
  startDate?: Date;
  endDate?: Date;
  sessionType?: SessionType | string;
}) {
  const rows = await fetchStudySessionLogs(options);
  const result = getScholarsWithValidEntryExit(rows, undefined, options ?? {});

  const uids = result.map((r) => r.scholarUid);
  const nameMap = await fetchScholarNamesByUids(uids);

  return result.map((r) => ({
    ...r,
    scholarName: nameMap.get(r.scholarUid) ?? null,
  }));
}
