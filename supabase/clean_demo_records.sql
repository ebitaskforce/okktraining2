-- ====================================================================
-- CLEANUP DEMO / DUMMY RECORDS IN SUPABASE DATABASE
-- Keeps admin profiles intact, removes dummy bookings, sessions, and trainers
-- ====================================================================

-- 1. Delete all bookings
DELETE FROM public.bookings;

-- 2. Delete all waitlist entries
DELETE FROM public.waitlist;

-- 3. Delete all demo training sessions
DELETE FROM public.training_sessions;

-- 4. Delete all demo trainers
DELETE FROM public.trainers;

-- 5. Delete non-admin profiles (preserves admin users)
DELETE FROM public.profiles WHERE role != 'admin';

-- 6. Delete all notifications and audit logs
DELETE FROM public.notifications;
DELETE FROM public.audit_logs;
