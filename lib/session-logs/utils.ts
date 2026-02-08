"use server";

import { createClient } from "@/lib/supabase/server";
import type { CleanedAndErroredResult } from "./types";

/**
 * Fetch scholar names from public.users by uid.
 * Returns Map<uid, "First Last">. Missing UIDs are not included.
 */
export async function fetchScholarNamesByUids(
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
 * Enrich a cleaned-and-errored result with scholar names from public.users.
 */
export async function enrichCleanedAndErroredWithNames(
  result: CleanedAndErroredResult
): Promise<CleanedAndErroredResult> {
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
 * Enrich an array of items (e.g. ScholarInRoom or ScholarWithCompletedSession)
 * with scholar names from public.users.
 */
export async function enrichWithScholarNames<
  T extends { scholarUid: string; scholarName?: string | null },
>(items: T[]): Promise<T[]> {
  if (items.length === 0) return items;

  const uids = items.map((r) => r.scholarUid);
  const nameMap = await fetchScholarNamesByUids(uids);

  return items.map((r) => ({
    ...r,
    scholarName: nameMap.get(r.scholarUid) ?? null,
  }));
}
