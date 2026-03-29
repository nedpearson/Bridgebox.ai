-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" 
ON public.bb_profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);
