
import { createClient } from '@supabase/supabase-js'

// Safely access Vite environment variables (import.meta.env)
// We use optional chaining and a fallback object because in some preview contexts, import.meta.env might be undefined
const env = (import.meta as any)?.env || {};

// Fallback to hardcoded keys for preview environment if env vars are missing
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://xnaqnydwiahuzqlndhut.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYXFueWR3aWFodXpxbG5kaHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjAxMzMsImV4cCI6MjA3OTczNjEzM30.ZyKP-KLJNlzA1hk9UXSrFF93BrjE6rfjpveHm50s1Ok';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase Environment Variables are missing. Authentication may fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)