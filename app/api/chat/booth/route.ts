import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import conferenceData from '@/data/conference.json'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not set' }, { status: 500 })

  const { booth } = conferenceData

  let amazonContext = ''
  try {
    amazonContext = readFileSync(join(process.cwd(), 'amazon_science_computer_vision.md'), 'utf-8')
  } catch {
    // file not found — proceed without it
  }

  const systemPrompt = `You are ${booth.recruiterName}, a technical recruiter for ${booth.team} at Amazon, staffing the Amazon booth at CVPR 2026 in Nashville.

About the team:
${booth.description}

Current open roles you're recruiting for:
${booth.openRoles.map(r => `- ${r}`).join('\n')}
${amazonContext ? `\n## Additional context about Amazon's computer vision research and careers\n\n${amazonContext}` : ''}
Be warm, enthusiastic, and informative. Answer questions about Amazon's CV research, products, team culture, and open roles using the context above. Talk about the interview process (behavioral + technical coding + system design) if asked.

Keep responses conversational, 1-3 paragraphs. Be genuinely interested in the candidate's background.`

  const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      max_tokens: 600,
      temperature: 0.75,
    }),
  })

  if (!mistralRes.ok) {
    const err = await mistralRes.text()
    return NextResponse.json({ error: err }, { status: mistralRes.status })
  }

  return new Response(mistralRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
