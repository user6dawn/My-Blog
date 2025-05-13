import { createClient } from '@supabase/supabase-js';

// Use environment variables or default to demo project with restricted access
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sarkknednewghvkyrpig.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcmtrbmVkbmV3Z2h2a3lycGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTUzMjYsImV4cCI6MjA1ODQ5MTMyNn0.4es8oRtYHXonivE6h-GRV9ZDSmQYMugzHzFXCax_3BU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);