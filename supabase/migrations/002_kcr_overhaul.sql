-- KCR CMS overhaul: extended enums, new columns
-- Run this in the Supabase SQL Editor

-- 1. New content_type values
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'graphic';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'youtube_video';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'website_video';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'tiktok_video';

-- 2. New platform values
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'instagram_feed';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'instagram_reel';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'instagram_story';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'facebook_post';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'facebook_reel';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'youtube_short';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'youtube_video';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'tiktok';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'website';
ALTER TYPE platform ADD VALUE IF NOT EXISTS 'pinterest';

-- 3. New content_status values for KCR approval pipeline
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'idea';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'brief_ready';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'in_design';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'stuart_approval';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'sergei_approval';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'caption_scheduling';

-- 4. New columns on content_cards
ALTER TABLE content_cards
  ADD COLUMN IF NOT EXISTS content_id text,
  ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{}';

-- 5. Back-fill platforms array from existing platform value
UPDATE content_cards SET platforms = ARRAY[platform::text] WHERE platforms = '{}' OR platforms IS NULL;
