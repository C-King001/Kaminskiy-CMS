export type ContentType =
  | 'reel'
  | 'static_post'
  | 'carousel'
  | 'infographic'
  | 'ai_video'
  | 'graphic'
  | 'youtube_video'
  | 'website_video'
  | 'tiktok_video'

export type Platform =
  | 'instagram'
  | 'instagram_feed'
  | 'instagram_reel'
  | 'instagram_story'
  | 'facebook'
  | 'facebook_post'
  | 'facebook_reel'
  | 'youtube_shorts'
  | 'youtube_short'
  | 'youtube_video'
  | 'tiktok'
  | 'website'
  | 'pinterest'

export type ContentStatus =
  | 'idea'
  | 'brief_ready'
  | 'in_design'
  | 'submitted'
  | 'in_review'
  | 'corrections_needed'
  | 'resubmitted'
  | 'stuart_approval'
  | 'sergei_approval'
  | 'caption_scheduling'
  | 'approved'
  | 'scheduled'
  | 'posted'

export interface ContentCard {
  id: string
  content_id: string | null
  title: string
  content_type: ContentType
  platform: Platform
  platforms: string[]
  caption: string | null
  hashtags: string[]
  scheduled_date: string | null
  ready_by: string | null
  notes: string | null
  status: ContentStatus
  drive_link: string | null
  brief_link: string | null
  file_path: string | null
  file_url: string | null
  owner_id: string
  assigned_reviewer_id: string | null
  team_id: string | null
  created_at: string
  updated_at: string
  owner?: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
}

export interface StatusHistory {
  id: string
  card_id: string
  from_status: ContentStatus | null
  to_status: ContentStatus
  changed_by: string
  note: string | null
  created_at: string
  changer?: {
    full_name: string | null
    avatar_url: string | null
  }
}
