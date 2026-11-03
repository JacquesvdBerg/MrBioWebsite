-- Articles on the forum. The teacher writes them on the desk, with an
-- optional photo; visitors can share an interesting article with a link, and
-- it waits for approval like any other post. Each article has its own page.

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_kind_check;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_kind_check
  CHECK (kind = ANY (ARRAY['Voorstel'::text, 'Vraag'::text, 'Gedagte'::text, 'Lof'::text, 'Fout gevind'::text, 'Artikel'::text]));

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS image_path text,
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS comments_slug_key ON public.comments (slug);

ALTER TABLE public.comments
  ADD CONSTRAINT comments_article_check
  CHECK (kind <> 'Artikel' OR (title IS NOT NULL AND slug IS NOT NULL));

ALTER TABLE public.comments
  ADD CONSTRAINT comments_link_url_check
  CHECK (link_url IS NULL OR link_url ~* '^https?://');

-- Visitors may share a link but not attach a photo. Only the desk adds photos.
DROP POLICY IF EXISTS "Anyone can submit a pending comment" ON public.comments;
DROP POLICY IF EXISTS "Signed-in users submit pending comments" ON public.comments;

CREATE POLICY "Anyone can submit a pending comment"
  ON public.comments FOR INSERT TO anon
  WITH CHECK (status = 'pending' AND author_role = 'visitor' AND image_path IS NULL);

CREATE POLICY "Signed-in users submit pending comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (
    public.jwt_is_admin()
    OR (status = 'pending' AND author_role = 'visitor' AND image_path IS NULL)
  );
