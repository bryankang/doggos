import { config } from "../config";
import { createSupabaseClient } from "./create-supabase-client";

export const supabaseClient = () =>
  createSupabaseClient(
    config().VITE_SUPABASE_URL,
    config().VITE_SUPABASE_ANON_KEY
  );
