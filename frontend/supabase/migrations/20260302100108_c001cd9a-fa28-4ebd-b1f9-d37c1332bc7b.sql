
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'landowner', 'fieldmanager', 'expert', 'worker');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Farms table
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  village TEXT NOT NULL DEFAULT '',
  total_land NUMERIC NOT NULL DEFAULT 0,
  crop TEXT DEFAULT '',
  growth_stage TEXT DEFAULT '',
  expected_revenue NUMERIC DEFAULT 0,
  profit_share NUMERIC DEFAULT 0,
  crop_health_score NUMERIC DEFAULT 0,
  sowing_date DATE,
  harvest_date DATE,
  soil_ph NUMERIC DEFAULT 0,
  soil_nitrogen NUMERIC DEFAULT 0,
  soil_phosphorus NUMERIC DEFAULT 0,
  soil_potassium NUMERIC DEFAULT 0,
  soil_organic_carbon NUMERIC DEFAULT 0,
  soil_moisture NUMERIC DEFAULT 0,
  contract_summary TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- 6. Farm assignments (who is assigned to which farm and in what capacity)
CREATE TABLE public.farm_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (farm_id, user_id, role)
);
ALTER TABLE public.farm_assignments ENABLE ROW LEVEL SECURITY;

-- 7. Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_required BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 8. Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out TIMESTAMPTZ,
  note TEXT DEFAULT ''
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 9. Diagnostics table (expert reports)
CREATE TABLE public.diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  expert_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pest_risk TEXT DEFAULT 'low',
  disease_risk TEXT DEFAULT 'low',
  prescription TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

-- 10. Equipment requests
CREATE TABLE public.equipment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'other',
  item_name TEXT NOT NULL,
  quantity TEXT DEFAULT '1',
  urgency TEXT DEFAULT 'medium',
  note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_requests ENABLE ROW LEVEL SECURITY;

-- 11. Motor / irrigation status
CREATE TABLE public.motor_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  motor_on BOOLEAN DEFAULT false,
  pump_type TEXT DEFAULT '',
  last_toggled TIMESTAMPTZ,
  toggled_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.motor_status ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- Profiles: users can read own, admins can read all
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User roles: admins manage, users can read own
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Farms: admins full access, assigned users can read
CREATE POLICY "Admins manage farms" ON public.farms FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assigned users read farms" ON public.farms FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.farm_assignments WHERE farm_id = farms.id AND user_id = auth.uid())
);

-- Farm assignments: admins manage, users can read own
CREATE POLICY "Admins manage assignments" ON public.farm_assignments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Fieldmanagers manage assignments" ON public.farm_assignments FOR ALL USING (public.has_role(auth.uid(), 'fieldmanager'));
CREATE POLICY "Users read own assignments" ON public.farm_assignments FOR SELECT USING (user_id = auth.uid());

-- Tasks: admins + fieldmanagers manage, assigned workers read/update
CREATE POLICY "Admins manage tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Fieldmanagers manage tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'fieldmanager'));
CREATE POLICY "Workers read own tasks" ON public.tasks FOR SELECT USING (assigned_to = auth.uid());
CREATE POLICY "Workers update own tasks" ON public.tasks FOR UPDATE USING (assigned_to = auth.uid());

-- Attendance: users insert own, admins + fieldmanagers read all
CREATE POLICY "Users insert own attendance" ON public.attendance FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users read own attendance" ON public.attendance FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins read attendance" ON public.attendance FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Fieldmanagers read attendance" ON public.attendance FOR SELECT USING (public.has_role(auth.uid(), 'fieldmanager'));

-- Diagnostics: experts manage, admins + assigned users read
CREATE POLICY "Experts manage diagnostics" ON public.diagnostics FOR ALL USING (public.has_role(auth.uid(), 'expert'));
CREATE POLICY "Admins read diagnostics" ON public.diagnostics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assigned users read diagnostics" ON public.diagnostics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.farm_assignments WHERE farm_id = diagnostics.farm_id AND user_id = auth.uid())
);

-- Equipment requests: users create own, admins + fieldmanagers manage all
CREATE POLICY "Users create own requests" ON public.equipment_requests FOR INSERT WITH CHECK (requested_by = auth.uid());
CREATE POLICY "Users read own requests" ON public.equipment_requests FOR SELECT USING (requested_by = auth.uid());
CREATE POLICY "Admins manage requests" ON public.equipment_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Fieldmanagers manage requests" ON public.equipment_requests FOR ALL USING (public.has_role(auth.uid(), 'fieldmanager'));

-- Motor status: admins manage, assigned users read/update
CREATE POLICY "Admins manage motors" ON public.motor_status FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Workers update motors" ON public.motor_status FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.farm_assignments fa WHERE fa.farm_id = motor_status.farm_id AND fa.user_id = auth.uid() AND fa.role = 'worker')
);
CREATE POLICY "Assigned users read motors" ON public.motor_status FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.farm_assignments WHERE farm_id = motor_status.farm_id AND user_id = auth.uid())
);

-- 12. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;
