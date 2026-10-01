-- Applied.AI Database Schema & Production Security (Row Level Security)
-- Run this script in Supabase Dashboard -> SQL Editor -> New Query

-- -------------------------------------------------------------
-- 1. Table: job_analyses
-- -------------------------------------------------------------
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

-- Enable RLS
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Users can read own analyses" ON job_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON job_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON job_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON job_analyses;

-- Strictly scoped policies for authenticated users
CREATE POLICY "Users can read own analyses" ON job_analyses 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON job_analyses 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON job_analyses 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON job_analyses 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- -------------------------------------------------------------
-- 2. Table: user_projects
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  stack TEXT[],
  github_url TEXT,
  key_features TEXT[],
  challenges_solved TEXT[]
);

-- Enable RLS
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Users can read own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON user_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON user_projects;

-- Strictly scoped policies for authenticated users
CREATE POLICY "Users can read own projects" ON user_projects 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON user_projects 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON user_projects 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON user_projects 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
