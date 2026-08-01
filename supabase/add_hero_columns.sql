-- ====================================================================
-- ADD HERO BANNER & WORDING COLUMNS TO SUPABASE ORGANIZATION SETTINGS TABLE
-- ====================================================================

ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'Empowering Excellence Through Specialized Training',
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Welcome to GovTech Training Academy. Browse upcoming professional development courses, register for morning or afternoon slots, and track your booking approvals seamlessly.',
ADD COLUMN IF NOT EXISTS hero_badge_text TEXT DEFAULT 'Official Government Training & Capacity Building Platform';

-- Verify columns
SELECT * FROM public.organization_settings WHERE id = 1;
