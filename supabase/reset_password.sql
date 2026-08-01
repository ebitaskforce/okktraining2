-- ====================================================================
-- RESET PASSWORD FOR SUPABASE AUTH USER
-- UID: caf244c1-c959-4588-86b5-bff7e59b8fc9
-- NEW PASSWORD: admin@123
-- ====================================================================

-- Run in Supabase SQL Editor:
UPDATE auth.users
SET 
  encrypted_password = extensions.crypt('admin@123', extensions.gen_salt('bf')),
  updated_at = NOW()
WHERE id = 'caf244c1-c959-4588-86b5-bff7e59b8fc9';

-- Verify update:
SELECT id, email, updated_at 
FROM auth.users 
WHERE id = 'caf244c1-c959-4588-86b5-bff7e59b8fc9';
