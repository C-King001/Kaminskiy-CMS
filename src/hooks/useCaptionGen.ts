import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContentType, Platform } from '@/types'

export function useCaptionGen() {
  const [captions, setCaptions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (params: {
    title: string
    contentType: ContentType
    platform: Platform
    notes?: string
  }) => {
    setLoading(true)
    setError(null)
    setCaptions([])
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-captions', {
        body: params,
      })
      if (fnError) throw fnError
      const parsed = Array.isArray(data) ? data : JSON.parse(data)
      setCaptions(parsed.slice(0, 3))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Caption generation failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setCaptions([])
    setError(null)
  }

  return { captions, loading, error, generate, reset }
}
