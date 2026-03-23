-- INSTRUCTIONS FOR SETTING UP SUPER ADMIN
-- 1. Sign up on your live site (or use Supabase Dashboard -> Authentication -> Add User)
--    with Email: nedpearson@gmail.com
--    and Password: 1980Colbert$
--
-- 2. Run this SQL query directly in your Supabase SQL Editor to elevate the account:

UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'nedpearson@gmail.com';
