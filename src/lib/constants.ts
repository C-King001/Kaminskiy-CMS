import type { ContentStatus, ContentType, Platform, UserRole } from '@/types'

export const STATUS_ORDER: ContentStatus[] = [
  'idea',
  'brief_ready',
  'in_design',
  'submitted',
  'in_review',
  'corrections_needed',
  'resubmitted',
  'stuart_approval',
  'sergei_approval',
  'caption_scheduling',
  'scheduled',
  'posted',
]

export const ALLOWED_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  idea: ['brief_ready'],
  brief_ready: ['in_design'],
  in_design: ['submitted'],
  submitted: ['in_review'],
  in_review: ['corrections_needed', 'resubmitted'],
  corrections_needed: ['resubmitted'],
  resubmitted: ['in_review', 'stuart_approval'],
  stuart_approval: ['corrections_needed', 'sergei_approval'],
  sergei_approval: ['corrections_needed', 'caption_scheduling'],
  caption_scheduling: ['scheduled'],
  approved: ['scheduled'],
  scheduled: ['posted'],
  posted: [],
}

export const TRANSITION_ROLES: Record<ContentStatus, UserRole[]> = {
  idea: ['contributor', 'reviewer', 'manager', 'admin'],
  brief_ready: ['contributor', 'reviewer', 'manager', 'admin'],
  in_design: ['contributor', 'reviewer', 'manager', 'admin'],
  submitted: ['reviewer', 'manager', 'admin'],
  in_review: ['reviewer', 'manager', 'admin'],
  corrections_needed: ['contributor', 'reviewer', 'manager', 'admin'],
  resubmitted: ['reviewer', 'manager', 'admin'],
  stuart_approval: ['manager', 'admin'],
  sergei_approval: ['admin'],
  caption_scheduling: ['manager', 'admin'],
  approved: ['manager', 'admin'],
  scheduled: ['manager', 'admin'],
  posted: [],
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  reel: 'Reel',
  static_post: 'Static Post',
  carousel: 'Carousel',
  infographic: 'Infographic',
  ai_video: 'AI Video',
  graphic: 'Graphic',
  youtube_video: 'YouTube Video',
  website_video: 'Website Video',
  tiktok_video: 'TikTok Video',
}

export const CALENDAR_FORMAT_ROWS: ContentType[] = [
  'reel',
  'carousel',
  'static_post',
  'graphic',
  'ai_video',
  'youtube_video',
  'website_video',
  'tiktok_video',
]

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  instagram_feed: 'IG Feed',
  instagram_reel: 'IG Reel',
  instagram_story: 'IG Story',
  facebook: 'Facebook',
  facebook_post: 'FB Post',
  facebook_reel: 'FB Reel',
  youtube_shorts: 'YouTube Shorts',
  youtube_short: 'YT Short',
  youtube_video: 'YouTube',
  tiktok: 'TikTok',
  website: 'Website',
  pinterest: 'Pinterest',
}

export const SELECTABLE_PLATFORMS: Platform[] = [
  'instagram_feed',
  'instagram_reel',
  'instagram_story',
  'facebook_post',
  'facebook_reel',
  'youtube_short',
  'youtube_video',
  'tiktok',
  'website',
  'pinterest',
]

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  brief_ready: 'Brief Ready',
  in_design: 'In Design',
  submitted: 'Submitted',
  in_review: 'In Review',
  corrections_needed: 'Corrections',
  resubmitted: 'Resubmitted',
  stuart_approval: 'Stuart Approval',
  sergei_approval: 'Sergei Approval',
  caption_scheduling: 'Caption & Scheduling',
  approved: 'Approved',
  scheduled: 'Scheduled',
  posted: 'Posted',
}

export const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  reel: '#EC4899',
  static_post: '#3B82F6',
  carousel: '#8B5CF6',
  infographic: '#06B6D4',
  ai_video: '#F97316',
  graphic: '#10B981',
  youtube_video: '#EF4444',
  website_video: '#7C3AED',
  tiktok_video: '#14B8A6',
}

export const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: '#6B7280',
  brief_ready: '#8B5CF6',
  in_design: '#3B82F6',
  submitted: '#6B7280',
  in_review: '#F59E0B',
  corrections_needed: '#EF4444',
  resubmitted: '#8B5CF6',
  stuart_approval: '#F97316',
  sergei_approval: '#EC4899',
  caption_scheduling: '#06B6D4',
  approved: '#22C55E',
  scheduled: '#22C55E',
  posted: '#16A34A',
}

export const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: '#E1306C',
  instagram_feed: '#E1306C',
  instagram_reel: '#833AB4',
  instagram_story: '#F77737',
  facebook: '#1877F2',
  facebook_post: '#1877F2',
  facebook_reel: '#1877F2',
  youtube_shorts: '#FF0000',
  youtube_short: '#FF0000',
  youtube_video: '#FF0000',
  tiktok: '#00F2EA',
  website: '#22C55E',
  pinterest: '#E60023',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  contributor: 'Contributor',
  reviewer: 'Reviewer',
  manager: 'Manager',
  admin: 'Admin',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  contributor: 1,
  reviewer: 2,
  manager: 3,
  admin: 4,
}

export const PLATFORM_ICONS: Record<Platform, string> = {
  instagram: 'instagram',
  instagram_feed: 'instagram',
  instagram_reel: 'instagram',
  instagram_story: 'instagram',
  facebook: 'facebook',
  facebook_post: 'facebook',
  facebook_reel: 'facebook',
  youtube_shorts: 'youtube',
  youtube_short: 'youtube',
  youtube_video: 'youtube',
  tiktok: 'tiktok',
  website: 'globe',
  pinterest: 'pinterest',
}

export const TRANSITION_BUTTON_LABELS: Partial<Record<ContentStatus, string>> = {
  idea: 'Mark Brief Ready',
  brief_ready: 'Send to Design',
  in_design: 'Submit for Review',
  in_review: 'Start Review',
  corrections_needed: 'Request Corrections',
  resubmitted: 'Resubmit',
  stuart_approval: 'Send to Stuart',
  sergei_approval: 'Send to Sergei',
  caption_scheduling: 'Ready to Schedule',
  approved: 'Schedule',
  scheduled: 'Mark Posted',
}

export const KCR_APPROVAL_STAGES: ContentStatus[] = [
  'in_review',
  'stuart_approval',
  'sergei_approval',
  'caption_scheduling',
  'scheduled',
  'posted',
]
