-- Server-only secrets, such as the OpenAI API key the teacher sets under
-- Admin > Instellings. RLS is on with no policies and anon/authenticated have
-- no grants, so only the service role (the Next.js server) can read or write.

CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.app_secrets FROM anon, authenticated;
GRANT ALL ON TABLE public.app_secrets TO service_role;
