import { createSupabaseClient } from "./create-supabase-client";

export const supabaseServerClient = () =>
  createSupabaseClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
