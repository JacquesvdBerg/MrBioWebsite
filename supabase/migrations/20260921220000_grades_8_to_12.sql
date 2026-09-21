-- Allow grades 8 and 9 on learner profiles and catalogue rows.

ALTER TABLE public.profiles DROP CONSTRAINT profiles_grade_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_grade_check
  CHECK (grade IS NULL OR grade = ANY (ARRAY[8, 9, 10, 11, 12]));

ALTER TABLE public.products DROP CONSTRAINT products_grade_check;
ALTER TABLE public.products ADD CONSTRAINT products_grade_check
  CHECK (grade IS NULL OR grade = ANY (ARRAY[8, 9, 10, 11, 12]));

ALTER TABLE public.enquiries DROP CONSTRAINT enquiries_grade_check;
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_grade_check
  CHECK (grade IS NULL OR grade = ANY (ARRAY[8, 9, 10, 11, 12]));

ALTER TABLE public.comments DROP CONSTRAINT comments_grade_check;
ALTER TABLE public.comments ADD CONSTRAINT comments_grade_check
  CHECK (grade IS NULL OR grade = ANY (ARRAY[8, 9, 10, 11, 12]));

ALTER TABLE public.chat_threads DROP CONSTRAINT chat_threads_grade_check;
ALTER TABLE public.chat_threads ADD CONSTRAINT chat_threads_grade_check
  CHECK (grade IS NULL OR grade = ANY (ARRAY[8, 9, 10, 11, 12]));

ALTER TABLE public.weekly_facts DROP CONSTRAINT weekly_facts_grade_check;
ALTER TABLE public.weekly_facts ADD CONSTRAINT weekly_facts_grade_check
  CHECK (grade = ANY (ARRAY[8, 9, 10, 11, 12]));
