
-- 1. Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user's email matches the admin email
  -- Note: We access auth.users directly or rely on auth.jwt() -> email claim
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'michelebonanno1977@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add RLS policy for Admin to view everything
CREATE POLICY "Admins can view all consents"
  ON marketing_consents FOR SELECT
  USING (is_admin());

-- 3. Also allow service_role key to bypass everything (should already be true, but explicit is good)
-- Supabase service_role key bypasses RLS by default, so this might not be strictly necessary,
-- but the issue might be that the client-side dashboard is querying as an 'authenticated' user, not service_role.

-- Simple confirmation
SELECT 'Admin policy created' as status;
