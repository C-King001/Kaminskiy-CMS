export type TenantPlan = 'free' | 'pro' | 'agency'
export type TenantStatus = 'active' | 'suspended'

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: TenantPlan
  status: TenantStatus
  logo_url: string | null
  primary_color: string
  member_count: number
  last_active: string
  created_at: string
  owner_email: string
  owner_name: string
  content_count: number
  team_count: number
}

export interface TenantCreateInput {
  name: string
  slug: string
  plan: TenantPlan
  primary_color: string
  logo_url: string | null
  owner_email: string
  owner_name: string
}

export interface ImpersonationSession {
  tenantId: string
  tenantName: string
  tenantColor: string
}
