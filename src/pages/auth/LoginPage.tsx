import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginPage() {
  const { session } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [success, setSuccess] = useState(false)

  if (session) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: email.split('@')[0] } },
        })
        if (error) throw error
        setSuccess(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-4">
      {/* Background glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#22c55e]/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#16a34a]/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/kcr-logo.jpg" alt="Kaminskiy Care & Repair" className="h-12 object-contain mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-1">
            Content Management System
          </p>
          <p className="text-[11px] text-white/20 mt-0.5">
            {mode === 'login' ? 'Sign in to manage your content' : 'Create your account'}
          </p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-5 text-center">
            <p className="text-sm text-green-400">Check your email to confirm your account.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div
              className="rounded-2xl border border-white/[0.08] p-6 flex flex-col gap-4"
              style={{ backgroundColor: '#1a1d27' }}
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@kaminskiy.com"
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full justify-center">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </div>

            <p className="text-center text-xs text-white/25">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                className="text-[#22c55e] hover:text-[#4ade80] font-semibold transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
