import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Meta sends a signed POST when a user removes the app from their Facebook account.
// Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
//
// Required Vercel env vars:
//   META_APP_SECRET        — Facebook app secret from Meta Developer Dashboard
//   SUPABASE_URL           — same as VITE_SUPABASE_URL
//   SUPABASE_SERVICE_KEY   — service role key (bypasses RLS for deletions)

function b64urlDecode(str: string): Buffer {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

function verifySignedRequest(
  signedRequest: string,
  appSecret: string,
): { user_id: string; issued_at: number } | null {
  const parts = signedRequest.split('.')
  if (parts.length !== 2) return null

  const [encodedSig, encodedPayload] = parts
  const sig = b64urlDecode(encodedSig)
  const expected = createHmac('sha256', appSecret).update(encodedPayload).digest()

  if (!timingSafeEqual(sig, expected)) return null

  try {
    return JSON.parse(b64urlDecode(encodedPayload).toString('utf8'))
  } catch {
    return null
  }
}

export default async function handler(req: any, res: any) {
  // Meta only sends POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const appSecret = process.env.META_APP_SECRET
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!appSecret || !supabaseUrl || !serviceKey) {
    console.error('Missing env vars: META_APP_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  // Body may arrive as parsed object or raw string depending on Vercel config
  let signedRequest: string | undefined
  if (typeof req.body === 'string') {
    signedRequest = new URLSearchParams(req.body).get('signed_request') ?? undefined
  } else if (req.body && typeof req.body === 'object') {
    signedRequest = req.body.signed_request
  }

  if (!signedRequest) {
    return res.status(400).json({ error: 'Missing signed_request' })
  }

  const payload = verifySignedRequest(signedRequest, appSecret)
  if (!payload) {
    return res.status(400).json({ error: 'Invalid signed_request signature' })
  }

  const { user_id } = payload
  const confirmationCode = `kcr-del-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, serviceKey)

  // Delete Facebook/Instagram-related data for this Meta user_id.
  // social_accounts stores connected platform credentials per team.
  // We search by the stored handle or account_name matching the user_id,
  // and also log the raw deletion request for audit purposes.
  await Promise.allSettled([
    supabase
      .from('social_accounts')
      .delete()
      .or(`handle.eq.${user_id},account_name.eq.${user_id}`),
    supabase.from('deletion_requests').insert({
      email: `meta-user-id:${user_id}`,
      reference_code: confirmationCode,
      status: 'pending',
    }),
  ])

  const appUrl = process.env.VITE_APP_URL || 'https://kaminskiy-cms.vercel.app'

  return res.status(200).json({
    url: `${appUrl}/data-deletion`,
    confirmation_code: confirmationCode,
  })
}
