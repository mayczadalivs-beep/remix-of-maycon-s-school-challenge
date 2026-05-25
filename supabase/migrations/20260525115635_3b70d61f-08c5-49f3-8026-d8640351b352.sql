
CREATE TABLE public.scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  survived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT player_name_len CHECK (char_length(player_name) BETWEEN 1 AND 20),
  CONSTRAINT score_range CHECK (score >= 0 AND score <= 10000)
);

CREATE INDEX scores_score_idx ON public.scores (score DESC, created_at ASC);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores"
  ON public.scores FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scores"
  ON public.scores FOR INSERT
  WITH CHECK (true);
