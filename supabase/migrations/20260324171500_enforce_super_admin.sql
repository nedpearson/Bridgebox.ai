-- Enforce super_admin role for nedpearson@gmail.com
-- Safely ensures they are backend-recognized without breaking auth for others

CREATE OR REPLACE FUNCTION public.enforce_nedpearson_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'nedpearson@gmail.com' THEN
    NEW.role := 'super_admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_nedpearson_super_admin ON public.profiles;
CREATE TRIGGER ensure_nedpearson_super_admin
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_nedpearson_super_admin();

-- Retroactively set it if the account already exists
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'nedpearson@gmail.com';
