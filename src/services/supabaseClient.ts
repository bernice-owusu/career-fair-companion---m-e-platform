import { createClient } from '@supabase/supabase-js';

// Anon key, RLS-scoped to INSERT-only on the `registrations` table (see
// nexus-webapp's supabase/migrations/0012_registrations.sql) — no
// select/update/delete access, and zero access to any other table in
// this project. Safe to ship in the client bundle for that reason.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
