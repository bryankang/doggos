import { createClient } from "@supabase/supabase-js";
import { Database } from "types/supabase.generated";

export const createSupabaseClient = (
  ...args: Parameters<typeof createClient>
) => {
  return createClient<Database>(...args);
};
