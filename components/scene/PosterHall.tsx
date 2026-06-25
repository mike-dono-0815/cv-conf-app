'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Paper } from '@/lib/types'

interface Props {
  papers: Paper[]
}

// Board positions: 3 in back row (z=-12), 2 in front row (z=-6)
const POSITIONS: [number, number, number][] = [
  [-26, 2, -12],
  [-20, 2, -12],
  [-14, 2, -12],
  [-23, 2, -6],
  [-17, 2, -6],
]

const EASEL_COLOR = '#2c3e50'
const CANVAS_W = 512
const CANVAS_H = 709  // matches 2.6 : 3.6 aspect ratio

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function buildPosterCanvas(paper: Paper, logo: HTMLImageElement | null): HTMLCanvasElement {
  const W = CANVAS_W
  const H = CANVAS_H
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const accent = paper.accentColor ?? '#1a2b4a'

  // White background
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, W, H)

  // ── Navy header ──
  const headerH = 90
  ctx.fillStyle = '#1a2b4a'
  ctx.fillRect(0, 0, W, headerH)

  // Right accent stripe
  ctx.fillStyle = accent
  ctx.fillRect(W - 14, 0, 14, headerH)

  // CVPR logo (white SVG on navy)
  if (logo && logo.naturalWidth > 0) {
    const logoH = 50
    const logoW = logoH * (logo.naturalWidth / logo.naturalHeight)
    const clampedW = Math.min(logoW, 210)
    ctx.drawImage(logo, 14, (headerH - logoH) / 2, clampedW, logoH)
  } else {
    // Text fallback
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px Georgia, serif'
    ctx.fillText('CVPR', 14, 52)
  }

  // Conference details (top-right of header)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '9px system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('IEEE/CVF Conference on', W - 22, 26)
  ctx.fillText('Computer Vision and', W - 22, 40)
  ctx.fillText('Pattern Recognition', W - 22, 54)
  ctx.fillText('Nashville, TN · June 2026', W - 22, 70)
  ctx.textAlign = 'left'

  let y = headerH + 10

  // ── Highlight badge ──
  if (paper.highlighted) {
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(0, y, W, 22)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('★  CVPR 2026 HIGHLIGHT PAPER', W / 2, y + 15)
    ctx.textAlign = 'left'
    y += 30
  } else {
    y += 6
  }

  // ── Paper title ──
  ctx.fillStyle = '#0d1117'
  ctx.font = 'bold 18px system-ui, sans-serif'
  const titleLines = wrapText(ctx, paper.title, W - 32)
  const titleLineH = 24
  titleLines.forEach((line, i) => ctx.fillText(line, 16, y + titleLineH + i * titleLineH))
  y += titleLineH + titleLines.length * titleLineH + 10

  // ── Accent rule ──
  ctx.strokeStyle = accent
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(16, y)
  ctx.lineTo(W - 16, y)
  ctx.stroke()
  y += 12

  // ── Authors ──
  const authStr = paper.authors.length > 4
    ? paper.authors.slice(0, 4).join(', ') + ' et al.'
    : paper.authors.join(', ')
  ctx.fillStyle = '#444444'
  ctx.font = '12px system-ui, sans-serif'
  const authLines = wrapText(ctx, authStr, W - 32)
  authLines.forEach((line, i) => ctx.fillText(line, 16, y + 14 + i * 17))
  y += 14 + authLines.length * 17 + 12

  // ── Abstract label ──
  ctx.fillStyle = accent
  ctx.font = 'bold 10px system-ui, sans-serif'
  ctx.fillText('A B S T R A C T', 16, y)
  y += 14

  // ── Abstract body ──
  ctx.fillStyle = '#2a2a2a'
  ctx.font = '11.5px system-ui, sans-serif'
  const bottomBarH = 34
  const absLines = wrapText(ctx, paper.abstract, W - 32)
  const lineH = 15
  const availH = H - bottomBarH - 4 - y
  const maxLines = Math.min(absLines.length, Math.floor(availH / lineH))

  absLines.slice(0, maxLines).forEach((line, i) => {
    ctx.fillText(line, 16, y + lineH + i * lineH)
  })
  if (absLines.length > maxLines && maxLines > 0) {
    // Overwrite last line with truncation indicator
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(16, y + (maxLines - 1) * lineH + 2, W - 32, lineH + 2)
    ctx.fillStyle = '#888888'
    ctx.fillText(absLines[maxLines - 1].slice(0, -3) + '…', 16, y + lineH + (maxLines - 1) * lineH)
  }

  // ── Bottom accent bar ──
  ctx.fillStyle = accent
  ctx.fillRect(0, H - bottomBarH, W, bottomBarH)
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = '9.5px system-ui, sans-serif'
  ctx.textAlign = 'center'
  const sessionShort = paper.session.split('|')[0].trim()
  ctx.fillText(sessionShort, W / 2, H - bottomBarH + 14)
  ctx.font = 'bold 9px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText(paper.session.split('|').slice(1).join(' | ').trim(), W / 2, H - bottomBarH + 26)
  ctx.textAlign = 'left'

  return canvas
}

export function PosterHall({ papers }: Props) {
  return (
    <group>
      {papers.map((paper, i) => (
        <PosterBoard key={paper.id} paper={paper} position={POSITIONS[i]} />
      ))}
    </group>
  )
}

function PosterBoard({ paper, position }: { paper: Paper; position: [number, number, number] }) {
  const [x, y, z] = position
  const [posterTex, setPosterTex] = useState<THREE.CanvasTexture | null>(null)
  const texRef = useRef<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    // Generate the poster immediately so boards are never blank
    const applyCanvas = (logo: HTMLImageElement | null) => {
      const canvas = buildPosterCanvas(paper, logo)
      const tex = new THREE.CanvasTexture(canvas)
      tex.needsUpdate = true
      texRef.current?.dispose()
      texRef.current = tex
      setPosterTex(tex)
    }

    applyCanvas(null)

    // Upgrade with the actual logo if it loads with real dimensions
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!cancelled && img.naturalWidth > 0) applyCanvas(img)
    }
    img.src = '/cvpr-logo.svg'

    return () => { cancelled = true }
  }, [paper])

  useEffect(() => () => { texRef.current?.dispose() }, [])

  return (
    <group position={[x, 0, z]}>
      {/* Easel leg */}
      <mesh position={[0, 1, -0.2]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.06, 2.2, 0.06]} />
        <meshStandardMaterial color={EASEL_COLOR} />
      </mesh>

      {/* Poster board with canvas texture */}
      <mesh position={[0, y, 0]}>
        <boxGeometry args={[2.6, 3.6, 0.06]} />
        <meshStandardMaterial
          key={posterTex ? 'poster-tex' : 'poster-plain'}
          map={posterTex ?? undefined}
          color="#ffffff"
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  )
}
