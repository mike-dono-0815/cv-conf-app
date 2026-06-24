import { NextRequest, NextResponse } from 'next/server'
import conferenceData from '@/data/conference.json'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not set' }, { status: 500 })

  const { booth } = conferenceData

  const systemPrompt = `You are ${booth.recruiterName}, a technical recruiter for ${booth.team} at Amazon, staffing the Amazon booth at CVPR 2026 in Nashville.

About the team:
${booth.description}

Current open roles you're recruiting for:
${booth.openRoles.map(r => `- ${r}`).join('\n')}

Be warm, enthusiastic, and informative. Talk about:
- Amazon's world-scale computer vision research and products (Rekognition, Just Walk Out, Alexa Vision, fulfillment robotics)
- The research culture and publishing at top venues (CVPR, ICCV, NeurIPS, ECCV)
- What it's like to work at Amazon's CV teams
- The open roles listed above
- The interview process (behavioral + technical coding + system design)

Do NOT make up specific salary numbers. Keep responses conversational, 1-3 paragraphs. Be genuinely interested in the candidate's background.`

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
