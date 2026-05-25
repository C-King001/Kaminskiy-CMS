import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tenant, TenantCreateInput, TenantPlan, TenantStatus, ImpersonationSession } from '@/types/tenant'

const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Kaminskiy Care & Repair',
    slug: 'kcr',
    plan: 'agency',
    status: 'active',
    logo_url: null,
    primary_color: '#22c55e',
    member_count: 8,
    last_active: new Date().toISOString(),
    created_at: '2025-01-15T00:00:00Z',
    owner_email: 'admin@kcr.com',
    owner_name: 'Stuart Kaminskiy',
    content_count: 142,
    team_count: 3,
  },
  {
    id: 'tenant-2',
    name: 'Apex Digital Media',
    slug: 'apex',
    plan: 'pro',
    status: 'active',
    logo_url: null,
    primary_color: '#3b82f6',
    member_count: 4,
    last_active: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2025-03-01T00:00:00Z',
    owner_email: 'hello@apexdigital.co',
    owner_name: 'Priya Menon',
    content_count: 67,
    team_count: 2,
  },
  {
    id: 'tenant-3',
    name: 'Bright Social Co.',
    slug: 'bright-social',
    plan: 'free',
    status: 'active',
    logo_url: null,
    primary_color: '#f59e0b',
    member_count: 2,
    last_active: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2025-04-10T00:00:00Z',
    owner_email: 'info@brightsocial.io',
    owner_name: 'Marcus Webb',
    content_count: 18,
    team_count: 1,
  },
  {
    id: 'tenant-4',
    name: 'Northgate Studios',
    slug: 'northgate',
    plan: 'pro',
    status: 'suspended',
    logo_url: null,
    primary_color: '#8b5cf6',
    member_count: 5,
    last_active: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2025-02-20T00:00:00Z',
    owner_email: 'ops@northgatestudios.com',
    owner_name: 'Ella Hartman',
    content_count: 53,
    team_count: 2,
  },
  {
    id: 'tenant-5',
    name: 'Solaris Brand Lab',
    slug: 'solaris',
    plan: 'agency',
    status: 'active',
    logo_url: null,
    primary_color: '#f97316',
    member_count: 12,
    last_active: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    created_at: '2024-11-05T00:00:00Z',
    owner_email: 'team@solarisbrand.com',
    owner_name: 'Diego Varela',
    content_count: 231,
    team_count: 4,
  },
]

interface SuperAdminState {
  tenants: Tenant[]
  loading: boolean
  impersonating: ImpersonationSession | null
  fetchTenants: () => Promise<void>
  createTenant: (input: TenantCreateInput) => Promise<Tenant>
  updateTenantStatus: (id: string, status: TenantStatus) => void
  updateTenantPlan: (id: string, plan: TenantPlan) => void
  startImpersonation: (tenant: Tenant) => void
  stopImpersonation: () => void
}

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, _get) => ({
      tenants: MOCK_TENANTS,
      loading: false,
      impersonating: null,

      fetchTenants: async () => {
        set({ loading: true })
        // TODO: replace with supabase query when tenants table is available
        // const { data } = await supabase.from('tenants').select('*')
        await new Promise((r) => setTimeout(r, 300))
        set({ loading: false })
      },

      createTenant: async (input) => {
        const newTenant: Tenant = {
          id: `tenant-${Date.now()}`,
          name: input.name,
          slug: input.slug,
          plan: input.plan,
          status: 'active',
          logo_url: input.logo_url,
          primary_color: input.primary_color,
          member_count: 1,
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          owner_email: input.owner_email,
          owner_name: input.owner_name,
          content_count: 0,
          team_count: 1,
        }
        set((s) => ({ tenants: [newTenant, ...s.tenants] }))
        return newTenant
      },

      updateTenantStatus: (id, status) => {
        set((s) => ({
          tenants: s.tenants.map((t) => (t.id === id ? { ...t, status } : t)),
        }))
      },

      updateTenantPlan: (id, plan) => {
        set((s) => ({
          tenants: s.tenants.map((t) => (t.id === id ? { ...t, plan } : t)),
        }))
      },

      startImpersonation: (tenant) => {
        set({
          impersonating: {
            tenantId: tenant.id,
            tenantName: tenant.name,
            tenantColor: tenant.primary_color,
          },
        })
      },

      stopImpersonation: () => {
        set({ impersonating: null })
      },
    }),
    {
      name: 'superadmin-store',
      partialize: (s) => ({ impersonating: s.impersonating }),
    }
  )
)
