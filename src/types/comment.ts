export interface Comment {
  id: string
  card_id: string
  author_id: string
  body: string
  parent_id: string | null
  resolved: boolean
  created_at: string
  updated_at: string
  author?: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
  replies?: Comment[]
}

export interface Notification {
  id: string
  recipient_id: string
  actor_id: string | null
  card_id: string | null
  type: 'status_change' | 'comment' | 'correction_needed' | 'approved' | 'review_requested'
  message: string
  read: boolean
  created_at: string
  actor?: {
    full_name: string | null
    avatar_url: string | null
  }
  card?: {
    title: string
  }
}
