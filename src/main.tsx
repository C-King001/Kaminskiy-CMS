import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

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

supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session)
  if (session) fetchProfile(session.user.id)
  setLoading(false)
})

supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session)
  if (session) fetchProfile(session.user.id)
  else useAuthStore.setState({ profile: null })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
