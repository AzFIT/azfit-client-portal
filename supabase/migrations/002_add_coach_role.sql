-- Add role column to coaches table
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'coach' CHECK (role IN ('admin', 'coach'));

-- Update existing coaches to have 'coach' role
UPDATE coaches SET role = 'coach' WHERE role IS NULL;

-- ───────────────────────────────────────────────────────────
-- Admin RPC Functions (SECURITY DEFINER bypasses RLS)
-- ───────────────────────────────────────────────────────────

-- Returns true if the current coach (by app.current_coach_id) is an admin
CREATE OR REPLACE FUNCTION is_current_coach_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM coaches
    WHERE id::text = current_setting('app.current_coach_id', true)
    AND role = 'admin'
  );
$$;

-- Admin stats overview
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verify admin
  IF NOT is_current_coach_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  SELECT jsonb_build_object(
    'total_coaches', (SELECT COUNT(*) FROM coaches),
    'total_clients', (SELECT COUNT(*) FROM clients),
    'total_programs', (SELECT COUNT(*) FROM programs),
    'total_exercises', (SELECT COUNT(*) FROM exercises),
    'active_clients', (SELECT COUNT(*) FROM clients WHERE status = 'active'),
    'paused_clients', (SELECT COUNT(*) FROM clients WHERE status = 'paused'),
    'archived_clients', (SELECT COUNT(*) FROM clients WHERE status = 'archived'),
    'recent_signups', (
      SELECT COUNT(*) FROM coaches
      WHERE created_at >= NOW() - INTERVAL '30 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- List all coaches with client counts (admin only)
CREATE OR REPLACE FUNCTION get_all_coaches_with_stats()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  business_name TEXT,
  specialty TEXT,
  role TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  client_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT is_current_coach_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.full_name,
    c.email,
    c.business_name,
    c.specialty,
    c.role,
    c.last_login,
    c.created_at,
    COUNT(cl.id) AS client_count
  FROM coaches c
  LEFT JOIN clients cl ON cl.coach_id = c.id::text
  GROUP BY c.id
  ORDER BY c.created_at DESC;
END;
$$;
