-- =========================================================================
-- ESQUEMA DE BASE DE DATOS PARA GASTAMOSPORIGUAL
-- Pegá este script en el "SQL Editor" de tu panel de Supabase y ejecutalo.
-- =========================================================================

-- 1. Tabla de Perfiles (Se vincula con la tabla interna de Auth de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso para perfiles
CREATE POLICY "Permitir lectura pública de perfiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualización a los propios usuarios" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger automático para crear perfil cuando se registra un usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Borrar trigger si existe y crearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Tabla de Grupos
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso total a todos con anon key" ON public.groups
  FOR ALL USING (true) WITH CHECK (true);


-- 3. Tabla de Integrantes de Grupo
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT NOT NULL,
  email TEXT, -- Correo para invitar y auto-vincular
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(group_id, member_name)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso total a todos con anon key" ON public.group_members
  FOR ALL USING (true) WITH CHECK (true);


-- 4. Tabla de Gastos
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_by TEXT NOT NULL, -- Nombre del integrante en el grupo
  category TEXT NOT NULL,
  split_type TEXT NOT NULL, -- 'equal', 'equal-select', 'custom'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso total a todos con anon key" ON public.expenses
  FOR ALL USING (true) WITH CHECK (true);


-- 5. Tabla de Divisiones de Gasto (splits)
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT NOT NULL,
  share_amount NUMERIC(12,2) NOT NULL CHECK (share_amount >= 0),
  UNIQUE(expense_id, member_name)
);

ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso total a todos con anon key" ON public.expense_splits
  FOR ALL USING (true) WITH CHECK (true);
