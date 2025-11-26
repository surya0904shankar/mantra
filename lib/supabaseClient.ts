
import { createClient } from '@supabase/supabase-js'

// We check for environment variables first (Production/Vercel)
// We fall back to the provided keys for the preview environment so it doesn't crash here.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xnaqnydwiahuzqlndhut.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYXFueWR3aWFodXpxbG5kaHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjAxMzMsImV4cCI6MjA3OTczNjEzM30.ZyKP-KLJNlzA1hk9UXSrFF93BrjE6rfjpveHm50s1Ok';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
