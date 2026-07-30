-- ====================================================================
-- TRAINING SESSION BOOKING & APPROVAL SYSTEM - SUPABASE DATABASE SCHEMA
-- ====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  staff_id VARCHAR(100) UNIQUE NOT NULL,
  department VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRAINERS TABLE
CREATE TABLE IF NOT EXISTS public.trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  specialty VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRAINING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trainer VARCHAR(255) NOT NULL,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  venue VARCHAR(255) NOT NULL,
  session_date DATE NOT NULL,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('morning', 'afternoon')),
  max_seats INT NOT NULL CHECK (max_seats > 0),
  booked_seats INT NOT NULL DEFAULT 0 CHECK (booked_seats >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'closed', 'cancelled')),
  registration_open DATE NOT NULL,
  registration_close DATE NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unq_session_date_slot_venue UNIQUE (venue, session_date, session_type)
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'waitlisted')),
  approval_notes TEXT,
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES public.profiles(id),
  approved_date TIMESTAMPTZ,
  qr_code_token VARCHAR(255) UNIQUE DEFAULT uuid_generate_v4()::text,
  attendance_status VARCHAR(20) DEFAULT 'pending' CHECK (attendance_status IN ('pending', 'present', 'late', 'absent', 'excused')),
  attendance_marked_at TIMESTAMPTZ,
  attendance_marked_by UUID REFERENCES public.profiles(id),
  CONSTRAINT unq_user_session_active UNIQUE (user_id, session_id)
);

-- 5. WAITLIST TABLE
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unq_session_waitlist_user UNIQUE (session_id, user_id)
);

-- 6. ORGANIZATION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  organization_name VARCHAR(255) NOT NULL DEFAULT 'GovTech Training Academy',
  website_name VARCHAR(255) NOT NULL DEFAULT 'Training Portal',
  logo_url TEXT DEFAULT 'https://images.unsplash.com/photo-1542744094-3a317272018a?w=150&auto=format&fit=crop&q=80',
  banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
  primary_color VARCHAR(50) DEFAULT '#2563eb',
  secondary_color VARCHAR(50) DEFAULT '#4f46e5',
  footer_text TEXT DEFAULT '© 2026 Training Session Booking & Approval System. All rights reserved.',
  contact_email VARCHAR(255) DEFAULT 'support@training.gov.my',
  phone VARCHAR(50) DEFAULT '+60 3-8000 8000',
  address TEXT DEFAULT 'Level 5, Block B, Federal Government Administrative Centre, Putrajaya, Malaysia',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id),
  admin_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  target VARCHAR(255) NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Organization Settings Policies
CREATE POLICY "Public org settings read" ON public.organization_settings FOR SELECT USING (true);
CREATE POLICY "Admin update org settings" ON public.organization_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Training Sessions Policies
CREATE POLICY "Public training sessions read" ON public.training_sessions FOR SELECT USING (true);
CREATE POLICY "Admin write training sessions" ON public.training_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings Policies
CREATE POLICY "Users read own bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Users update own bookings before approval" ON public.bookings FOR UPDATE USING (
  (auth.uid() = user_id AND status = 'pending') OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins full access bookings" ON public.bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications Policies
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Audit Logs Policies
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ====================================================================
-- AUTOMATIC SEAT COUNTER & WAITLIST TRIGGERS
-- ====================================================================

-- Function to recalculate booked seats
CREATE OR REPLACE FUNCTION public.sync_session_booked_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.training_sessions
    SET booked_seats = (
      SELECT COUNT(*) FROM public.bookings
      WHERE session_id = NEW.session_id AND status = 'approved'
    )
    WHERE id = NEW.session_id;

    -- Update session status if full
    UPDATE public.training_sessions
    SET status = CASE 
      WHEN booked_seats >= max_seats THEN 'closed'
      ELSE 'available'
    END
    WHERE id = NEW.session_id AND status != 'cancelled';
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.training_sessions
    SET booked_seats = (
      SELECT COUNT(*) FROM public.bookings
      WHERE session_id = OLD.session_id AND status = 'approved'
    )
    WHERE id = OLD.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_sync_booked_seats
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.sync_session_booked_seats();

-- Initialize Organization Settings
INSERT INTO public.organization_settings (id, organization_name, website_name)
VALUES (1, 'GovTech Training Academy', 'Training Portal')
ON CONFLICT (id) DO NOTHING;
