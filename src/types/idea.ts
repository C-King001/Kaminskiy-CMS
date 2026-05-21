import type { ContentType } from './content'

export type IdeaStatus = 'raw' | 'promoted'

export interface Idea {
  id: string
  title: string
  description: string | null
  content_type: ContentType | null
  tags: string[]
  status: IdeaStatus
  promoted_card_id: string | null
  owner_id: string
  team_id: string | null
  reference_url: string | null
  created_at: string
  updated_at: string
  owner?: {
    full_name: string | null
    avatar_url: string | null
  }
}
