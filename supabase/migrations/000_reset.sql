-- ============================================================
-- RESET: Drop all AzFIT tables and start fresh
-- Run this first if you had a failed migration
-- ============================================================

DROP TABLE IF EXISTS client_notes CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;
DROP FUNCTION IF EXISTS set_coach_id(TEXT) CASCADE;
