import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { SuperAdminShell, SuperAdminRoute } from '@/components/superadmin/SuperAdminShell'
import { ToastProvider } from '@/components/ui/Toast'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { CalendarPage } from '@/pages/CalendarPage'
import { IdeaBankPage } from '@/pages/IdeaBankPage'
import { ContentCardDetailPage } from '@/pages/ContentCardDetailPage'
import { AdminPage } from '@/pages/AdminPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { TenantsPage } from '@/pages/superadmin/TenantsPage'
import { BillingPage } from '@/pages/superadmin/BillingPage'
import { GlobalAnalyticsPage } from '@/pages/superadmin/GlobalAnalyticsPage'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* SuperAdmin portal */}
          <Route
            path="/superadmin"
            element={
              <SuperAdminRoute>
                <SuperAdminShell />
              </SuperAdminRoute>
            }
          >
            <Route index element={<Navigate to="/superadmin/tenants" replace />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="analytics" element={<GlobalAnalyticsPage />} />
          </Route>

          {/* Main app */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="ideas" element={<IdeaBankPage />} />
            <Route path="content/new" element={<ContentCardDetailPage mode="create" />} />
            <Route path="content/:id" element={<ContentCardDetailPage mode="edit" />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
