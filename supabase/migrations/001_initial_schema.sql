-- ============================================================
-- AzFIT Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. COACHES
-- ============================================================
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  business_name TEXT,
  specialty TEXT,
  years_experience INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{"theme":"dark","unitSystem":"metric","defaultSessionDuration":60}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- ============================================================
-- 2. CLIENTS (JSONB for nested objects — keeps it simple)
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,

  -- Flattened fields for filtering/sorting
  full_name TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Nested data as JSONB
  personal JSONB DEFAULT '{}'::jsonb,
  goals JSONB DEFAULT '{}'::jsonb,
  body_assessment JSONB DEFAULT '{}'::jsonb,
  tdee JSONB DEFAULT '{}'::jsonb,
  medical JSONB DEFAULT '{}'::jsonb,
  nutrition JSONB DEFAULT '{}'::jsonb,
  assessment_history JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- ============================================================
-- 3. PROGRAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',

  -- Full program data as JSONB
  data JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_programs_coach_id ON programs(coach_id);
CREATE INDEX IF NOT EXISTS idx_programs_client_id ON programs(client_id);

-- ============================================================
-- 4. EXERCISES (seed from exercises_db.json)
-- ============================================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT UNIQUE,
  name TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  difficulty TEXT,
  type TEXT,
  video_url TEXT,
  description TEXT,
  safety_notes TEXT,
  met_value NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);

-- ============================================================
-- 5. CLIENT NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_client_id ON client_notes(client_id);

-- ============================================================
-- 6. RLS FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION set_coach_id(coach_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_coach_id', coach_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. ENABLE RLS
-- ============================================================
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Coaches can read/write their own data
DROP POLICY IF EXISTS "Coaches own their data" ON coaches;
CREATE POLICY "Coaches own their data" ON coaches
  FOR ALL USING (id::text = current_setting('app.current_coach_id', true));

-- Coaches can only see their own clients
DROP POLICY IF EXISTS "Coaches own their clients" ON clients;
CREATE POLICY "Coaches own their clients" ON clients
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));

-- Coaches can only see their own programs
DROP POLICY IF EXISTS "Coaches own their programs" ON programs;
CREATE POLICY "Coaches own their programs" ON programs
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));

-- Exercises are public read-only
DROP POLICY IF EXISTS "Exercises public read" ON exercises;
CREATE POLICY "Exercises public read" ON exercises
  FOR SELECT USING (true);

-- Coaches can CRUD their own notes
DROP POLICY IF EXISTS "Coaches own their notes" ON client_notes;
CREATE POLICY "Coaches own their notes" ON client_notes
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));
