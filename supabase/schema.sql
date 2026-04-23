-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates the table that stores all JD analysis history.

CREATE TABLE IF NOT EXISTS job_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  role_title TEXT NOT NULL,
  summary TEXT,
  match_score INTEGER DEFAULT 0,
  analysis_data JSONB NOT NULL
);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;

-- If table already exists, this adds the column safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_analyses' AND column_name='user_id') THEN
        ALTER TABLE job_analyses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;
-- Enable Row Level Security (required by Supabase)
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
-- Users can only read their own analyses
CREATE POLICY "Users can read own analyses" ON job_analyses 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses" ON job_analyses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses" ON job_analyses 
  FOR DELETE USING (auth.uid() = user_id);
