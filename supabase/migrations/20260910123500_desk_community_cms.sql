-- Applied remotely via Supabase MCP as desk_community_cms.
-- Weekly facts, shop catalogue, enquiries, comments, and learner chat.

CREATE TABLE public.weekly_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  grade integer NOT NULL CHECK (grade = ANY (ARRAY[10, 11, 12])),
  week_label text NOT NULL DEFAULT '',
  week_start date,
  tone text NOT NULL DEFAULT 'green' CHECK (tone = ANY (ARRAY['green'::text, 'teal'::text, 'blue'::text, 'purple'::text, 'orange'::text, 'navy'::text])),
  art text NOT NULL DEFAULT 'leaf' CHECK (art = ANY (ARRAY['cell'::text, 'dna'::text, 'leaf'::text, 'heart'::text, 'microbe'::text, 'eye'::text, 'molecule'::text])),
  image_path text,
  status text NOT NULL DEFAULT 'draft' CHECK (status = ANY (ARRAY['draft'::text, 'approved'::text, 'published'::text])),
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'Notas',
  listing_kind text NOT NULL DEFAULT 'item' CHECK (listing_kind = ANY (ARRAY['item'::text, 'bundle'::text])),
  grade integer CHECK (grade IS NULL OR grade = ANY (ARRAY[10, 11, 12])),
  price integer NOT NULL DEFAULT 0 CHECK (price >= 0),
  was_price integer CHECK (was_price IS NULL OR was_price >= 0),
  bullets text[] NOT NULL DEFAULT '{}'::text[],
  body text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'navy' CHECK (tone = ANY (ARRAY['green'::text, 'teal'::text, 'blue'::text, 'purple'::text, 'orange'::text, 'navy'::text])),
  badge text,
  pages integer CHECK (pages IS NULL OR pages >= 0),
  image_path text,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  reason text NOT NULL DEFAULT 'Algemene navraag',
  product_slug text,
  grade integer CHECK (grade IS NULL OR grade = ANY (ARRAY[10, 11, 12])),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status = ANY (ARRAY['new'::text, 'in_progress'::text, 'done'::text])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  kind text NOT NULL CHECK (kind = ANY (ARRAY['Voorstel'::text, 'Vraag'::text, 'Gedagte'::text, 'Lof'::text, 'Fout gevind'::text])),
  body text NOT NULL,
  grade integer CHECK (grade IS NULL OR grade = ANY (ARRAY[10, 11, 12])),
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_token uuid NOT NULL UNIQUE,
  learner_name text NOT NULL DEFAULT '',
  grade integer CHECK (grade IS NULL OR grade = ANY (ARRAY[10, 11, 12])),
  topic text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status = ANY (ARRAY['open'::text, 'closed'::text])),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  unread_for_admin boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender = ANY (ARRAY['learner'::text, 'admin'::text])),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX weekly_facts_status_published_idx ON public.weekly_facts (status, published_at DESC NULLS LAST);
CREATE INDEX products_published_listing_idx ON public.products (is_published, listing_kind, sort_order);
CREATE INDEX enquiries_status_created_idx ON public.enquiries (status, created_at DESC);
CREATE INDEX comments_status_created_idx ON public.comments (status, created_at DESC);
CREATE INDEX chat_threads_unread_last_idx ON public.chat_threads (unread_for_admin, last_message_at DESC);
CREATE INDEX chat_messages_thread_created_idx ON public.chat_messages (thread_id, created_at);

CREATE TRIGGER weekly_facts_set_updated_at BEFORE UPDATE ON public.weekly_facts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER enquiries_set_updated_at BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER chat_threads_set_updated_at BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.weekly_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published weekly facts are readable by anyone" ON public.weekly_facts FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Signed-in users can read every weekly fact" ON public.weekly_facts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users can insert weekly facts" ON public.weekly_facts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can update weekly facts" ON public.weekly_facts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in users can delete weekly facts" ON public.weekly_facts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Published products are readable by anyone" ON public.products FOR SELECT TO anon USING (is_published);
CREATE POLICY "Signed-in users can read every product" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can update products" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in users can delete products" ON public.products FOR DELETE TO authenticated USING (true);

CREATE POLICY "Anyone can submit an enquiry" ON public.enquiries FOR INSERT TO anon WITH CHECK (status = 'new');
CREATE POLICY "Signed-in users can read every enquiry" ON public.enquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users can insert enquiries" ON public.enquiries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in users can delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (true);

CREATE POLICY "Approved comments are readable by anyone" ON public.comments FOR SELECT TO anon USING (status = 'approved');
CREATE POLICY "Anyone can submit a pending comment" ON public.comments FOR INSERT TO anon WITH CHECK (status = 'pending');
CREATE POLICY "Signed-in users can read every comment" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users can insert comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can update comments" ON public.comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in users can delete comments" ON public.comments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Signed-in users can read every chat thread" ON public.chat_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users can insert chat threads" ON public.chat_threads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can update chat threads" ON public.chat_threads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in users can delete chat threads" ON public.chat_threads FOR DELETE TO authenticated USING (true);

CREATE POLICY "Signed-in users can read every chat message" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in users can insert chat messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can update chat messages" ON public.chat_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in users can delete chat messages" ON public.chat_messages FOR DELETE TO authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.weekly_facts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.enquiries TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.comments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.chat_threads TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.chat_messages TO anon, authenticated;
