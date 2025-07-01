-- Custom ENUM type for user subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro');

-- users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  tier subscription_tier DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 5, -- Free users start with 5 credits
  credits_last_reset TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url TEXT NOT NULL UNIQUE,
  title TEXT,
  channel_name TEXT,
  channel_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  published_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- video_analysis table
CREATE TABLE IF NOT EXISTS video_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT,
  key_takeaways JSONB,
  hashtags JSONB,
  twitter_thread JSONB,
  transcript JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  -- A user can only have one analysis for each video
  CONSTRAINT unique_video_per_user UNIQUE (video_id, user_id)
);

-- user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES video_analysis(id) ON DELETE CASCADE,
    tokens_used INTEGER,
    cost NUMERIC(10, 6), -- Optional: for tracking cost in USD
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- analysis_feedback table
CREATE TABLE IF NOT EXISTS analysis_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES video_analysis(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    -- A user can only give feedback once per analysis
    UNIQUE(analysis_id, user_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_analysis_id ON analysis_feedback(analysis_id);