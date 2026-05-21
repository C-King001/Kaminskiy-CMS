import { useState } from 'react'
import { uploadFile, deleteFile } from '@/lib/storage'
import { useAuthStore } from '@/store/authStore'

export function useFileUpload(cardId: string) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const profile = useAuthStore((s) => s.profile)

  const upload = async (file: File): Promise<{ path: string; url: string } | null> => {
    if (!profile) return null
    setUploading(true)
    setError(null)
    try {
      const result = await uploadFile(profile.id, cardId, file)
      return result
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  const remove = async (path: string) => {
    try {
      await deleteFile(path)
    } catch (e) {
      console.error('Failed to delete file:', e)
    }
  }

  return { upload, remove, uploading, error }
}
