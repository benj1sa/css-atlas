"use server";

import { createClient } from "@/lib/supabase/server";
import type { SessionLogRow, SessionType } from "./types";
import { SESSION_TYPE_FRONT_DESK } from "./types";
import {
  getCleanedAndErroredTickets,
  getScholarsCurrentlyInRoom,
  getScholarsWithValidEntryExit,
  type CleanedAndErroredOptions,
  type ScholarsInRoomOptions,
} from "./session-ticket-utils";
import {
  enrichCleanedAndErroredWithNames,
  enrichWithScholarNames,
} from "./utils";

/**
 * Supabase row shape for front_desk_logs.
 * scholar_name omitted — resolve from public.users by scholar_uid when needed.
 */
export interface FrontDeskLogRow {
  id: string;
  created_at: string;
  rep_name: string | null;
  scholar_uid: string | null;
  action_type: string | null;
  session_type: string | null;
  submitted_by_email: string | null;
}

function toSessionLogRow(row: FrontDeskLogRow): SessionLogRow {
  return {
    id: row.id,
    created_at: row.created_at,
    scholar_uid: row.scholar_uid,
    action_type: row.action_type,
    rep_name: row.rep_name,
    session_type: row.session_type ?? SESSION_TYPE_FRONT_DESK,
    submitted_by_email: row.submitted_by_email,
  };
}

/**
 * Fetch front desk logs from front_desk_logs table. Optional filters.
 */
export async function fetchFrontDeskLogs(options?: {
  startDate?: Date;
  endDate?: Date;
  /** Filter to this session type if table has session_type */
  sessionType?: SessionType | string;
}): Promise<SessionLogRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("front_desk_logs")
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
    toSessionLogRow(row as FrontDeskLogRow)
  );
}

/**
 * Get cleaned and errored tickets from front_desk_logs.
 * Scholar names resolved from public.users. Use treatUnclosedEntryAsError: true
 * for closed-period analysis (e.g. yesterday's data).
 */
export async function getFrontDeskCleanedAndErrored(
  options?: {
    startDate?: Date;
    endDate?: Date;
    sessionType?: SessionType | string;
  } & CleanedAndErroredOptions
) {
  const rows = await fetchFrontDeskLogs(options);
  const result = getCleanedAndErroredTickets(rows, undefined, {
    treatUnclosedEntryAsError: options?.treatUnclosedEntryAsError,
    sessionType: options?.sessionType ?? SESSION_TYPE_FRONT_DESK,
  });
  return enrichCleanedAndErroredWithNames(result);
}

/**
 * Get scholars currently in the room (valid entry, no exit yet)
 * and how long they've been in the room.
 * Scholar names resolved from public.users.
 */
export async function getFrontDeskScholarsInRoom(
  options?: ScholarsInRoomOptions & { startDate?: Date; endDate?: Date }
) {
  const rows = await fetchFrontDeskLogs(options);
  const result = getScholarsCurrentlyInRoom(rows, undefined, {
    ...options,
    sessionType: options?.sessionType ?? SESSION_TYPE_FRONT_DESK,
  });
  return enrichWithScholarNames(result);
}

/**
 * Get scholars with valid entry-exit pairs and their session duration.
 * Scholar names resolved from public.users.
 */
export async function getFrontDeskCompletedSessions(options?: {
  startDate?: Date;
  endDate?: Date;
  sessionType?: SessionType | string;
}) {
  const rows = await fetchFrontDeskLogs(options);
  const result = getScholarsWithValidEntryExit(rows, undefined, {
    ...options,
    sessionType: options?.sessionType ?? SESSION_TYPE_FRONT_DESK,
  });
  return enrichWithScholarNames(result);
}
