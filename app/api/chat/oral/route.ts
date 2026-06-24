import { NextRequest, NextResponse } from 'next/server'
import conferenceData from '@/data/conference.json'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, paperId } = await req.json()

  const paper = conferenceData.oral.id === paperId ? conferenceData.oral : null
  if (!paper) return NextResponse.json({ error: 'Paper not found' }, { status: 404 })

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not set' }, { status: 500 })

  const systemPrompt = `You are ${paper.firstAuthor}, presenting your CVPR 2026 oral talk titled "${paper.title}" — a Highlight paper.

Abstract:
${paper.abstract}

Authors: ${paper.authors.join(', ')}
Session: ${paper.session}

You just finished your talk at the oral session. Now you are taking audience questions. Respond as a confident, thoughtful presenter. Give detailed answers about methodology, experimental design, comparisons with baselines, ablation studies, limitations, and future work. If asked about implementation details not in the abstract, extrapolate what a researcher in 3D vision and generative modeling would know. Be specific, use technical language appropriate for a CVPR audience. Keep answers to 2-4 paragraphs.`

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
      max_tokens: 900,
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
