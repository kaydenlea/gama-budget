import { createClient } from "@supabase/supabase-js";
import type { Database } from "@gama/supabase-types";
import { readConfiguredSupabaseEnv } from "../../config/env";
import { secureStoreSessionAdapter } from "../storage/secure-store";

const { supabaseUrl, supabaseAnonKey } = readConfiguredSupabaseEnv();

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreSessionAdapter,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      "x-gama-client": "mobile"
    }
  }
});
