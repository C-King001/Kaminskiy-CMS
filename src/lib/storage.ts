import { supabase } from './supabase'

const BUCKET = 'content-uploads'

export async function uploadFile(
  userId: string,
  cardId: string,
  file: File
): Promise<{ path: string; url: string }> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${userId}/${cardId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
