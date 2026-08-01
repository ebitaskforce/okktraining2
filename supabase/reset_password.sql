-- ====================================================================
-- RESET PASSWORD FOR USER UID: caf244c1-c959-4588-86b5-bff7e59b8fc9
-- NEW PASSWORD: admin@123
-- ====================================================================

-- Step 1: Ensure pgcrypto extension is active for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Update encrypted_password in Supabase auth.users table
UPDATE auth.users
SET 
  encrypted_password = crypt('admin@123', gen_salt('bf')),
  updated_at = NOW()
WHERE id = 'caf244c1-c959-4588-86b5-bff7e59b8fc9';

-- Step 3: Verify the account status
SELECT id, email, updated_at, role 
FROM auth.users 
WHERE id = 'caf244c1-c959-4588-86b5-bff7e59b8fc9';
