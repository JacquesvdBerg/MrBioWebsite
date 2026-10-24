-- "Ander" for parents and teachers, teacher replies on forum posts,
-- and a desk queue when a password-reset email cannot be delivered.

ALTER TABLE public.profiles
  ADD COLUMN audience text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_audience_check
  CHECK (audience IS NULL OR (audience = 'ander' AND grade IS NULL));

ALTER TABLE public.comments
  ADD COLUMN audience text,
  ADD COLUMN author_role text NOT NULL DEFAULT 'visitor',
  ADD COLUMN parent_id uuid;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_audience_check
  CHECK (audience IS NULL OR (audience = 'ander' AND grade IS NULL));

ALTER TABLE public.comments
  ADD CONSTRAINT comments_author_role_check
  CHECK (author_role = ANY (ARRAY['visitor'::text, 'teacher'::text]));

ALTER TABLE public.comments
  ADD CONSTRAINT comments_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES public.comments (id) ON DELETE CASCADE;

CREATE INDEX comments_parent_created_idx ON public.comments (parent_id, created_at);

-- Visitors can file a pending post. Only an admin can publish, or speak as the teacher.
DROP POLICY IF EXISTS "Anyone can submit a pending comment" ON public.comments;
DROP POLICY IF EXISTS "Signed-in users submit pending comments" ON public.comments;

CREATE POLICY "Anyone can submit a pending comment"
  ON public.comments FOR INSERT TO anon
  WITH CHECK (status = 'pending' AND author_role = 'visitor');

CREATE POLICY "Signed-in users submit pending comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (
    public.jwt_is_admin()
    OR (status = 'pending' AND author_role = 'visitor')
  );

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, grade, audience, kind)
  VALUES (
    NEW.id,
    coalesce(
      nullif(NEW.raw_user_meta_data ->> 'display_name', ''),
      split_part(coalesce(NEW.email, 'leerder'), '@', 1)
    ),
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data ->> 'audience' = 'ander' THEN NULL
      WHEN NEW.raw_user_meta_data ->> 'grade' IN ('8', '9', '10', '11', '12')
        THEN (NEW.raw_user_meta_data ->> 'grade')::integer
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_user_meta_data ->> 'audience' = 'ander' THEN 'ander'
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

-- Failed reset emails land here. The browser cannot read this table.
-- The server writes it with the service role after requireAdmin or from the reset action.
CREATE TABLE public.password_help (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT 'failed',
  status text NOT NULL DEFAULT 'open' CHECK (status = ANY (ARRAY['open'::text, 'done'::text])),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX password_help_open_email_idx ON public.password_help (email) WHERE status = 'open';

ALTER TABLE public.password_help ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.password_help FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.password_help TO service_role;

CREATE POLICY "No API access"
  ON public.password_help
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
