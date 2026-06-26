import { NextRequest } from 'next/server'

export const runtime = 'edge'

const ALLOWED_HOSTS = ['arxiv.org', 'img.youtube.com']

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new Response('Missing url', { status: 400 })

  let parsed: URL
  try { parsed = new URL(url) } catch { return new Response('Invalid url', { status: 400 }) }

  const allowed = ALLOWED_HOSTS.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h))
  if (!allowed) return new Response('Host not allowed', { status: 403 })

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CVConf/1.0)' },
    })
    if (!upstream.ok) return new Response('Upstream error', { status: upstream.status })

    const contentType = upstream.headers.get('content-type') ?? 'image/png'
    const buffer = await upstream.arrayBuffer()

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new Response('Proxy error', { status: 502 })
  }
}
