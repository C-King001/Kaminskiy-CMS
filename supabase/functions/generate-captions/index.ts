import Anthropic from 'npm:@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, contentType, platform, notes } = await req.json()

    if (!title) {
      return new Response(JSON.stringify({ error: 'title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const platformLabel: Record<string, string> = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      youtube_shorts: 'YouTube Shorts',
    }

    const typeLabel: Record<string, string> = {
      reel: 'Reel',
      static_post: 'Static Post',
      carousel: 'Carousel',
      infographic: 'Infographic',
      ai_video: 'AI Video',
    }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system:
        'You are an expert social media copywriter. When asked, return ONLY a valid JSON array of exactly 3 caption strings. No keys, no markdown, no explanation — just the raw JSON array.',
      messages: [
        {
          role: 'user',
          content: `Generate 3 distinct caption options for a ${typeLabel[contentType] ?? contentType} post on ${platformLabel[platform] ?? platform}.
Title: ${title}
Notes: ${notes ?? 'none'}

Make each caption unique in tone:
1. Professional and authoritative
2. Playful and conversational
3. Compelling and action-driven

Each caption should be 1-3 sentences. Include a call-to-action where appropriate. Return ONLY a JSON array of 3 strings.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
    const captions = JSON.parse(text)

    return new Response(JSON.stringify(captions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Caption generation error:', error)
    return new Response(JSON.stringify({ error: 'Caption generation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
