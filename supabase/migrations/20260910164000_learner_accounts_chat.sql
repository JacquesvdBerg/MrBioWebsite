-- Learner accounts, purchases stub, chat bound to users, admin-only CMS writes.

CREATE OR REPLACE FUNCTION public.jwt_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

GRANT EXECUTE ON FUNCTION public.jwt_is_admin() TO anon, authenticated;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  email text,
  grade integer CHECK (grade IS NULL OR grade = ANY (ARRAY[10, 11, 12])),
  kind text NOT NULL DEFAULT 'learner' CHECK (kind = ANY (ARRAY['admin'::text, 'learner'::text])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  product_title text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'paid' CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text])),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX purchases_user_created_idx ON public.purchases (user_id, created_at DESC);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.chat_threads
  ALTER COLUMN visitor_token DROP NOT NULL;

ALTER TABLE public.chat_threads
  DROP CONSTRAINT IF EXISTS chat_threads_visitor_token_key;

ALTER TABLE public.chat_threads
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS last_message text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS unread_for_learner boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS chat_threads_user_last_idx
  ON public.chat_threads (user_id, last_message_at DESC);

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, grade, kind)
  VALUES (
    NEW.id,
    coalesce(
      nullif(NEW.raw_user_meta_data ->> 'display_name', ''),
      split_part(coalesce(NEW.email, 'leerder'), '@', 1)
    ),
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data ->> 'grade' IN ('10', '11', '12')
        THEN (NEW.raw_user_meta_data ->> 'grade')::integer
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_app_meta_data ->> 'role' = 'admin' THEN 'admin'
      ELSE 'learner'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE coalesce(raw_app_meta_data ->> 'role', '') IS DISTINCT FROM 'learner';

INSERT INTO public.profiles (id, display_name, email, kind)
SELECT
  id,
  split_part(coalesce(email, 'admin'), '@', 1),
  email,
  'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET kind = EXCLUDED.kind, email = EXCLUDED.email;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile or admin reads all"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.jwt_is_admin());

CREATE POLICY "Users update own profile fields"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.jwt_is_admin())
  WITH CHECK (
    id = auth.uid()
    AND kind = (SELECT p.kind FROM public.profiles p WHERE p.id = auth.uid())
    OR public.jwt_is_admin()
  );

CREATE POLICY "Admins insert profiles"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.jwt_is_admin());

CREATE POLICY "Users read own purchases"
  ON public.purchases FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.jwt_is_admin());

CREATE POLICY "Admins write purchases"
  ON public.purchases FOR INSERT TO authenticated
  WITH CHECK (public.jwt_is_admin());

CREATE POLICY "Admins update purchases"
  ON public.purchases FOR UPDATE TO authenticated
  USING (public.jwt_is_admin())
  WITH CHECK (public.jwt_is_admin());

CREATE POLICY "Admins delete purchases"
  ON public.purchases FOR DELETE TO authenticated
  USING (public.jwt_is_admin());

DROP POLICY IF EXISTS "Signed-in users can read every weekly fact" ON public.weekly_facts;
DROP POLICY IF EXISTS "Signed-in users can insert weekly facts" ON public.weekly_facts;
DROP POLICY IF EXISTS "Signed-in users can update weekly facts" ON public.weekly_facts;
DROP POLICY IF EXISTS "Signed-in users can delete weekly facts" ON public.weekly_facts;
CREATE POLICY "Signed-in users read published or admin weekly facts" ON public.weekly_facts FOR SELECT TO authenticated USING (status = 'published' OR public.jwt_is_admin());
CREATE POLICY "Admins insert weekly facts" ON public.weekly_facts FOR INSERT TO authenticated WITH CHECK (public.jwt_is_admin());
CREATE POLICY "Admins update weekly facts" ON public.weekly_facts FOR UPDATE TO authenticated USING (public.jwt_is_admin()) WITH CHECK (public.jwt_is_admin());
CREATE POLICY "Admins delete weekly facts" ON public.weekly_facts FOR DELETE TO authenticated USING (public.jwt_is_admin());

DROP POLICY IF EXISTS "Signed-in users can read every product" ON public.products;
DROP POLICY IF EXISTS "Signed-in users can insert products" ON public.products;
DROP POLICY IF EXISTS "Signed-in users can update products" ON public.products;
DROP POLICY IF EXISTS "Signed-in users can delete products" ON public.products;
CREATE POLICY "Signed-in users read published or admin products" ON public.products FOR SELECT TO authenticated USING (is_published OR public.jwt_is_admin());
CREATE POLICY "Admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.jwt_is_admin());
CREATE POLICY "Admins update products" ON public.products FOR UPDATE TO authenticated USING (public.jwt_is_admin()) WITH CHECK (public.jwt_is_admin());
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated USING (public.jwt_is_admin());

DROP POLICY IF EXISTS "Signed-in users can read every enquiry" ON public.enquiries;
DROP POLICY IF EXISTS "Signed-in users can insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Signed-in users can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Signed-in users can delete enquiries" ON public.enquiries;
CREATE POLICY "Admins read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.jwt_is_admin());
CREATE POLICY "Signed-in users submit enquiries" ON public.enquiries FOR INSERT TO authenticated WITH CHECK (status = 'new' OR public.jwt_is_admin());
CREATE POLICY "Admins update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.jwt_is_admin()) WITH CHECK (public.jwt_is_admin());
CREATE POLICY "Admins delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (public.jwt_is_admin());

DROP POLICY IF EXISTS "Signed-in users can read every comment" ON public.comments;
DROP POLICY IF EXISTS "Signed-in users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Signed-in users can update comments" ON public.comments;
DROP POLICY IF EXISTS "Signed-in users can delete comments" ON public.comments;
CREATE POLICY "Signed-in users read approved or admin comments" ON public.comments FOR SELECT TO authenticated USING (status = 'approved' OR public.jwt_is_admin());
CREATE POLICY "Signed-in users submit pending comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (status = 'pending' OR public.jwt_is_admin());
CREATE POLICY "Admins update comments" ON public.comments FOR UPDATE TO authenticated USING (public.jwt_is_admin()) WITH CHECK (public.jwt_is_admin());
CREATE POLICY "Admins delete comments" ON public.comments FOR DELETE TO authenticated USING (public.jwt_is_admin());

DROP POLICY IF EXISTS "Signed-in users can read every chat thread" ON public.chat_threads;
DROP POLICY IF EXISTS "Signed-in users can insert chat threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Signed-in users can update chat threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Signed-in users can delete chat threads" ON public.chat_threads;
CREATE POLICY "Users read own chat threads" ON public.chat_threads FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.jwt_is_admin());
CREATE POLICY "Learners insert own chat threads" ON public.chat_threads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own or admin chat threads" ON public.chat_threads FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.jwt_is_admin())
  WITH CHECK (user_id = auth.uid() OR public.jwt_is_admin());
CREATE POLICY "Admins delete chat threads" ON public.chat_threads FOR DELETE TO authenticated
  USING (public.jwt_is_admin());

DROP POLICY IF EXISTS "Signed-in users can read every chat message" ON public.chat_messages;
DROP POLICY IF EXISTS "Signed-in users can insert chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Signed-in users can update chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Signed-in users can delete chat messages" ON public.chat_messages;
CREATE POLICY "Users read own chat messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (
    public.jwt_is_admin()
    OR EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id AND t.user_id = auth.uid()
    )
  );
CREATE POLICY "Users insert chat messages" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    (
      sender = 'learner'
      AND EXISTS (
        SELECT 1 FROM public.chat_threads t
        WHERE t.id = thread_id AND t.user_id = auth.uid()
      )
    )
    OR (public.jwt_is_admin() AND sender = 'admin')
  );
CREATE POLICY "Admins update chat messages" ON public.chat_messages FOR UPDATE TO authenticated
  USING (public.jwt_is_admin())
  WITH CHECK (public.jwt_is_admin());
CREATE POLICY "Admins delete chat messages" ON public.chat_messages FOR DELETE TO authenticated
  USING (public.jwt_is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.purchases TO authenticated;
