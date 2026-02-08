import type { User } from "@supabase/supabase-js";

/**
 * Row from your public.users table in Supabase.
 *
 * IMPORTANT: `uid` in this table is NOT the same as Supabase Auth's user.id
 * (auth.users.id). They are separate identifiers from different systems.
 * Profile lookup should use email (or another shared field), not auth user id.
 */
export type UserProfile = {
  id: number;
  created_at: string | null;
  uid: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  cohort: number | null;
  status: string | null;
  app_role: string | null;
  program_role: string | null;
  fd_required: number | null;
  ss_required: number | null;
  mentee_count: number | null;
};

/**
 * Auth user + profile from public.users. Use getCurrentUserWithProfile() to fetch.
 */
export type UserWithProfile = {
  user: User;
  profile: UserProfile | null;
};
