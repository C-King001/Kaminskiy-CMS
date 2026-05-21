import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore } from '@/store/teamStore'

// Apply dark mode before React renders to prevent flash
const darkMode = (() => {
  try {
    const stored = localStorage.getItem('cms-ui')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed?.state?.darkMode ?? true
    }
  } catch {
    // ignore
  }
  return true
})()
document.documentElement.classList.toggle('dark', darkMode)

// Bootstrap auth state
const { setSession, setLoading, fetchProfile } = useAuthStore.getState()

const { fetchTeams, fetchMyMemberships } = useTeamStore.getState()

async function bootstrapSession(session: Parameters<typeof setSession>[0]) {
  setSession(session)
  if (session) {
    await fetchProfile(session.user.id)
    await fetchTeams()
    await fetchMyMemberships(session.user.id)
  }
}

supabase.auth.getSession().then(({ data: { session } }) => {
  bootstrapSession(session).finally(() => setLoading(false))
})

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    bootstrapSession(session)
  } else {
    setSession(null)
    useAuthStore.setState({ profile: null })
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
