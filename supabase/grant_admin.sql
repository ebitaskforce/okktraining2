-- ====================================================================
-- GRANT ADMIN PRIVILEGES TO SPECIFIC SUPABASE USER UID
-- UID: caf244c1-c959-4588-86b5-bff7e59b8fc9
-- ====================================================================

-- Step 1: Update existing profile if row exists
UPDATE public.profiles
SET 
  role = 'admin', 
  is_active = true, 
  updated_at = NOW()
WHERE id = 'caf244c1-c959-4588-86b5-bff7e59b8fc9';

-- Step 2: Insert or sync profile from auth.users if missing
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
WHERE id = 'caf244c1-c959-4588-86b5-bff7e59b8fc9'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- Step 3: Verify the update
SELECT id, full_name, email, role, is_active 
FROM public.profiles 
WHERE id = 'caf244c1-c959-4588-86b5-bff7e59b8fc9';
