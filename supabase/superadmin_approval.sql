CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own" ON profiles FOR SELECT USING (id = auth.uid());

CREATE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE TABLE faculty_change_requests (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action             text NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  target_id          uuid,
  payload            jsonb,
  status             text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_by_email text,
  reviewed_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by_email  text,
  review_note        text,
  created_at         timestamptz DEFAULT now(),
  reviewed_at        timestamptz
);

ALTER TABLE faculty_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_own" ON faculty_change_requests
  FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "select_own_or_superadmin" ON faculty_change_requests
  FOR SELECT USING (
    requested_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "update_superadmin_only" ON faculty_change_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

DROP POLICY IF EXISTS "auth_write" ON faculty_members;

CREATE POLICY "superadmin_write" ON faculty_members
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));
