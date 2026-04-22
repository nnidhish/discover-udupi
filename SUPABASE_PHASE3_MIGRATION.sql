-- Phase 3 migration — run in Supabase SQL Editor
-- Adds review_votes and reported_reviews tables

-- Table: review_votes
-- Tracks helpful/not-helpful votes per user per review (one vote per user per review)
CREATE TABLE IF NOT EXISTS public.review_votes (
  review_id   UUID        NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type   TEXT        NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- RLS for review_votes
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all votes"
  ON public.review_votes FOR SELECT USING (true);

CREATE POLICY "Users can vote"
  ON public.review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their own vote"
  ON public.review_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own vote"
  ON public.review_votes FOR DELETE
  USING (auth.uid() = user_id);


-- Table: reported_reviews
-- Records which reviews have been flagged and by whom (one report per user per review)
CREATE TABLE IF NOT EXISTS public.reported_reviews (
  review_id   UUID        NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, reporter_id)
);

-- RLS for reported_reviews
ALTER TABLE public.reported_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own reports"
  ON public.reported_reviews FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins only for select/delete (service role bypasses RLS)
