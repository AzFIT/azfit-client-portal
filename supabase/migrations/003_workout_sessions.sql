-- Workout Sessions Table
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  client_name TEXT,
  program_name TEXT,
  day_name TEXT,
  phase_name TEXT,
  exercises JSONB DEFAULT '[]',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INT,
  total_volume INT,
  total_sets INT,
  completed_sets INT,
  avg_rpe DECIMAL(3,1),
  coach_notes TEXT,
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_sessions_coach ON workout_sessions(coach_id);
CREATE INDEX idx_workout_sessions_client ON workout_sessions(client_id);
CREATE INDEX idx_workout_sessions_program ON workout_sessions(program_id);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX idx_workout_sessions_created ON workout_sessions(created_at DESC);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY coach_own_sessions ON workout_sessions
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));

-- PRs Table (personal records per client per exercise)
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT,
  load DECIMAL(8,2),
  reps INT,
  estimated_1rm DECIMAL(8,2),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, exercise_id)
);

CREATE INDEX idx_prs_client ON personal_records(client_id);
CREATE INDEX idx_prs_exercise ON personal_records(exercise_id);

ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY coach_own_prs ON personal_records
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));
