import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface PaperMeta {
  title: string
  shortTitle: string
  firstAuthor: string
  authors: string[]
  abstract: string
  session: string
}

export async function POST(req: NextRequest) {
  const { messages, paper }: { messages: unknown[]; paper: PaperMeta } = await req.json()

  if (!paper?.title) return NextResponse.json({ error: 'Paper not found' }, { status: 404 })

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not set' }, { status: 500 })

  const systemPrompt = `You are ${paper.firstAuthor}, presenting your CVPR 2026 oral talk titled "${paper.title}".

Abstract:
${paper.abstract}

Authors: ${paper.authors.join(', ')}
Session: ${paper.session}

You just finished your talk at the Amazon @ CVPR 2026 oral session. Now you are taking audience questions. Respond as a confident, thoughtful presenter. Give detailed answers about methodology, experimental design, comparisons with baselines, ablation studies, limitations, and future work. If asked about implementation details not in the abstract, extrapolate what a researcher in computer vision and machine learning would know. Be specific, use technical language appropriate for a CVPR audience. Keep answers to 2-4 paragraphs.`

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

  return mistralStreamToCleanSSE(mistralRes)
}

function mistralStreamToCleanSSE(mistralRes: Response): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = mistralRes.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              return
            }
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            } catch { /* skip malformed events */ }
          }
        }
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}
