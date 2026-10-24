-- Addresses from the footer signup. The public site writes through the
-- service role. Only an admin can read or remove a row.

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
);

CREATE INDEX newsletter_subscribers_created_idx
  ON public.newsletter_subscribers (created_at DESC);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.newsletter_subscribers FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.newsletter_subscribers TO authenticated;
GRANT ALL ON TABLE public.newsletter_subscribers TO service_role;

CREATE POLICY "Admins read newsletter subscribers"
  ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.jwt_is_admin());

CREATE POLICY "Admins delete newsletter subscribers"
  ON public.newsletter_subscribers FOR DELETE TO authenticated
  USING (public.jwt_is_admin());
