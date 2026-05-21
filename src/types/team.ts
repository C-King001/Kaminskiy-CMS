export interface Team {
  id: string
  name: string
  slug: string
  color: string
  description: string | null
  created_at: string
}

export interface TeamMembership {
  id: string
  team_id: string
  user_id: string
  joined_at: string
  team?: Team
}

export interface SocialAccount {
  id: string
  team_id: string
  platform: string
  handle: string | null
  account_name: string | null
  profile_url: string | null
  updated_at: string
}
