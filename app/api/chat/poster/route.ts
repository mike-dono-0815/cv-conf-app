import { NextRequest, NextResponse } from 'next/server'
import conferenceData from '@/data/conference.json'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, paperId } = await req.json()

  const paper = [...conferenceData.posters, conferenceData.oral].find(p => p.id === paperId)
  if (!paper) return NextResponse.json({ error: 'Paper not found' }, { status: 404 })

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not set' }, { status: 500 })

  const systemPrompt = `You are ${paper.firstAuthor}, a researcher presenting your CVPR 2026 poster titled "${paper.title}".

Here is your paper's abstract:
${paper.abstract}

Authors: ${paper.authors.join(', ')}
Presented at: ${paper.session}

Respond as the author would at a real poster session — knowledgeable, enthusiastic, and ready to explain the work in depth. Discuss methodology, experimental results, limitations, and future directions. If asked something beyond the abstract, extrapolate thoughtfully based on what a researcher in this area would know. Keep responses conversational and focused (2-4 paragraphs max).`

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
      max_tokens: 800,
      temperature: 0.7,
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
