import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Anon key, RLS-scoped to INSERT-only on the `registrations` table (see
// nexus-webapp's supabase/migrations/0012_registrations.sql) — no
// select/update/delete access, and zero access to any other table in
// this project. Safe to ship in the client bundle for that reason.
//
// `createClient` throws synchronously if either arg is missing — confirmed
// live that this previously took down the ENTIRE app bundle at module-load
// time (blank screen, "supabaseUrl is required") when these env vars
// weren't set in the deployment. That defeats the whole point of the
// Supabase write being a non-blocking, best-effort addition alongside
// Sheets — null out instead of throwing; supabaseService.ts treats a null
// client as "not configured" and just skips the insert.
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
