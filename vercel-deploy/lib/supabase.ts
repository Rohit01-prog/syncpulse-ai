import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pzxkrzvculpgxsibafnx.supabase.co";
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  "sb_publishable_-9Lo6rhtP5BH-aOInOi4XQ_fUJ2N7-i";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
