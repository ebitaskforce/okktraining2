-- ====================================================================
-- PROMOTE USER TO ADMIN ROLE BY EMAIL
-- USER EMAIL: nezek_raj2990@yahoo.com
-- ====================================================================

-- 1. Update existing profile in public.profiles
UPDATE public.profiles
SET 
  role = 'admin', 
  is_active = true, 
  updated_at = NOW()
WHERE LOWER(email) = 'nezek_raj2990@yahoo.com';

-- 2. Insert or sync profile from auth.users if missing
INSERT INTO public.profiles (
  id, 
  full_name, 
  staff_id, 
  department, 
  phone, 
  email, 
  role, 
  is_active
)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'System Administrator'),
  'ADM-' || UPPER(SUBSTRING(id::text, 1, 6)),
  'Information Technology & Cyber Security',
  '+60 3-8000 8000',
  email,
  'admin',
  true
FROM auth.users
WHERE LOWER(email) = 'nezek_raj2990@yahoo.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- 3. Verify
SELECT id, full_name, email, role, is_active 
FROM public.profiles 
WHERE LOWER(email) = 'nezek_raj2990@yahoo.com';
