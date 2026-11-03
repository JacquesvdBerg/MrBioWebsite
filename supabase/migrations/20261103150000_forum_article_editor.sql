-- Articles are written in a rich editor now. The formatted text is kept as
-- HTML next to the plain text (which stays for excerpts and emails), and an
-- article from a signed-in visitor remembers who wrote it so they can see
-- whether it was approved. Writing an article needs an account; quick posts
-- on the forum still do not.

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS body_html text,
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS comments_author_id_idx ON public.comments (author_id);

DROP POLICY IF EXISTS "Anyone can submit a pending comment" ON public.comments;
DROP POLICY IF EXISTS "Signed-in users submit pending comments" ON public.comments;

CREATE POLICY "Anyone can submit a pending comment"
  ON public.comments FOR INSERT TO anon
  WITH CHECK (
    status = 'pending'
    AND author_role = 'visitor'
    AND image_path IS NULL
    AND author_id IS NULL
    AND kind <> 'Artikel'
  );

CREATE POLICY "Signed-in users submit pending comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (
    public.jwt_is_admin()
    OR (
      status = 'pending'
      AND author_role = 'visitor'
      AND image_path IS NULL
      AND (author_id IS NULL OR author_id = auth.uid())
      AND (kind <> 'Artikel' OR author_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authors read their own posts" ON public.comments;

CREATE POLICY "Authors read their own posts"
  ON public.comments FOR SELECT TO authenticated
  USING (author_id = auth.uid());
