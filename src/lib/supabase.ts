import { createClient } from "@supabase/supabase-js";

// Fallbacks so the UI doesn't crash if env vars are missing in dev
const fallbackUrl = "https://aijlbkjabewrxbabioxz.supabase.co";
const fallbackAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpamxia2phYmV3cnhiYWJpb3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTc4MDYsImV4cCI6MjA2OTE3MzgwNn0.Mm7Fk9OGMkbIATZ61iztTjgYQv0mSenGFFcf7z7q1f8";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || fallbackUrl;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;

if (!(import.meta as any).env?.VITE_SUPABASE_URL || !(import.meta as any).env?.VITE_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing. Using fallback credentials for development.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


