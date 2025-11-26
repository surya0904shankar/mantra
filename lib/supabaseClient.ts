import { createClient } from '@supabase/supabase-js'

// Use Vite environment variables (import.meta.env)
// Fallback to hardcoded keys for preview environment if env vars are missing
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://xnaqnydwiahuzqlndhut.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYXFueWR3aWFodXpxbG5kaHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjAxMzMsImV4cCI6MjA3OTczNjEzM30.ZyKP-KLJNlzA1hk9UXSrFF93BrjE6rfjpveHm50s1Ok';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase Environment Variables are missing. Authentication may fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)