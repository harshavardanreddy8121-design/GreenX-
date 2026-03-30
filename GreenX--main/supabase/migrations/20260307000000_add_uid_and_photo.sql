-- Add UID and photo_url columns to profiles table

-- 1. Add columns
ALTER TABLE public.profiles 
ADD COLUMN uid VARCHAR(4) UNIQUE,
ADD COLUMN photo_url TEXT DEFAULT '';

-- 2. Function to generate unique 4-digit UID
CREATE OR REPLACE FUNCTION public.generate_uid()
RETURNS VARCHAR(4)
LANGUAGE plpgsql
AS $$
DECLARE
  new_uid VARCHAR(4);
  uid_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 4-digit number (1000-9999)
    new_uid := LPAD((1000 + FLOOR(RANDOM() * 9000))::TEXT, 4, '0');
    
    -- Check if UID already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE uid = new_uid) INTO uid_exists;
    
    -- Exit loop if UID is unique
    EXIT WHEN NOT uid_exists;
  END LOOP;
  
  RETURN new_uid;
END;
$$;

-- 3. Generate UIDs for existing users
UPDATE public.profiles 
SET uid = public.generate_uid() 
WHERE uid IS NULL;

-- 4. Make UID NOT NULL after populating
ALTER TABLE public.profiles 
ALTER COLUMN uid SET NOT NULL;

-- 5. Create index on UID for faster searches
CREATE INDEX idx_profiles_uid ON public.profiles(uid);

-- 6. Create trigger to auto-generate UID for new users
CREATE OR REPLACE FUNCTION public.set_uid_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.uid IS NULL THEN
    NEW.uid := public.generate_uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_uid
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_uid_on_insert();
