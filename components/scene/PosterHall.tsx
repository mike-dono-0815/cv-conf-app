'use client'

// DROP-IN REPLACEMENT for components/scene/PosterHall.tsx
// Upgrades the easel (two angled front legs + back leg = tripod, white board frame,
// handout tray) and enriches the poster canvas with a heatmap + bar-chart figure block,
// two-column body text, and a footer. Boards/frames cast & receive shadows.
// Keeps the same `papers` prop + buildPosterCanvas signature (logo still loaded from /cvpr-logo.svg).

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Paper } from '@/lib/types'

interface Props { papers: Paper[] }

const POSITIONS: [number, number, number][] = [
  [-26, 0, -12], [-20, 0, -12], [-14, 0, -12], [-23, 0, -6], [-17, 0, -6],
]

const CANVAS_W = 512
const CANVAS_H = 720

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' '); const lines: string[] = []; let cur = ''
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t }
  if (cur) lines.push(cur); return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}

function buildPosterCanvas(paper: Paper, logo: HTMLImageElement | null): HTMLCanvasElement {
  const W = CANVAS_W, H = CANVAS_H
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  const accent = paper.accentColor ?? '#2563eb'

  ctx.fillStyle = '#fbfaf7'; ctx.fillRect(0, 0, W, H)
  // header
  ctx.fillStyle = '#26304a'; ctx.fillRect(0, 0, W, 92)
  ctx.fillStyle = accent; ctx.fillRect(W - 12, 0, 12, 92)
  if (logo && logo.naturalWidth > 0) {
    const lh = 46, lw = Math.min(lh * (logo.naturalWidth / logo.naturalHeight), 180)
    ctx.drawImage(logo, 16, (92 - lh) / 2, lw, lh)
  } else {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Georgia, serif'; ctx.textAlign = 'left'; ctx.fillText('CVPR', 18, 46)
    ctx.font = '600 16px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('2026', 18, 70)
  }
  ctx.textAlign = 'right'; ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('IEEE/CVF Conference on Computer Vision', W - 22, 34)
  ctx.fillText('and Pattern Recognition · Nashville, TN', W - 22, 50)
  ctx.textAlign = 'left'
  let y = 112

  if (paper.highlighted) {
    ctx.fillStyle = '#e8a33d'; ctx.fillRect(0, y - 12, W, 24)
    ctx.fillStyle = '#1a1306'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('★  CVPR 2026 HIGHLIGHT PAPER', W / 2, y + 4); ctx.textAlign = 'left'; y += 26
  }

  ctx.fillStyle = '#15171d'; ctx.font = 'bold 21px system-ui'
  wrap(ctx, paper.title, W - 36).forEach((l) => { ctx.fillText(l, 18, y + 22); y += 27 })
  y += 6
  ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, y); ctx.lineTo(W - 18, y); ctx.stroke(); y += 16

  const authStr = paper.authors.length > 4 ? paper.authors.slice(0, 4).join(', ') + ' et al.' : paper.authors.join(', ')
  ctx.fillStyle = '#5a5e66'; ctx.font = '13px system-ui'
  wrap(ctx, authStr, W - 36).forEach((l) => { ctx.fillText(l, 18, y); y += 18 })
  y += 14

  ctx.fillStyle = accent; ctx.font = 'bold 11px system-ui'; ctx.fillText('A B S T R A C T', 18, y); y += 14
  ctx.fillStyle = '#3a3d44'; ctx.font = '12px system-ui'
  wrap(ctx, paper.abstract, W - 36).slice(0, 6).forEach((l) => { ctx.fillText(l, 18, y); y += 16 })
  y += 8

  // figure blocks: heatmap (left) + bar chart (right)
  const fy = y, halfW = (W - 48) / 2
  ctx.fillStyle = '#eef0f4'; roundRect(ctx, 18, fy, halfW, 150, 6); ctx.fill()
  ctx.fillStyle = '#e7eaf0'; roundRect(ctx, 30 + halfW, fy, halfW, 150, 6); ctx.fill()
  const hs = 14, hx = 30, hy = fy + 12
  for (let r = 0; r < 8; r++) for (let cc = 0; cc < 14; cc++) {
    const v = Math.random(); ctx.fillStyle = `rgba(${38 + v * 200},${48 + v * 90},${74 + v * 30},1)`
    ctx.fillRect(hx + cc * hs, hy + r * hs, hs - 1, hs - 1)
  }
  const bx = 30 + halfW + 14, bw = halfW - 28
  ctx.fillStyle = accent
  for (let i = 0; i < 5; i++) { const bh = 30 + Math.random() * 90; ctx.fillRect(bx + i * (bw / 5), fy + 140 - bh, bw / 5 - 6, bh) }
  y = fy + 162

  ctx.fillStyle = '#3a3d44'; ctx.font = '12px system-ui'
  wrap(ctx, 'Results indicate the proposed approach generalizes to unseen domains with minimal degradation; qualitative comparisons show sharper boundaries and fewer artifacts.', W - 36).slice(0, 3).forEach((l) => { ctx.fillText(l, 18, y); y += 16 })

  // footer
  ctx.fillStyle = accent; ctx.fillRect(0, H - 30, W, 30)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center'
  ctx.fillText('Poster Session · ' + paper.session.split('|')[0].trim(), W / 2, H - 11); ctx.textAlign = 'left'

  return canvas
}

export function PosterHall({ papers }: Props) {
  return (
    <group>
      {papers.slice(0, POSITIONS.length).map((paper, i) => (
        <PosterBoard key={paper.id} paper={paper} position={POSITIONS[i]} />
      ))}
    </group>
  )
}

const easelMat = new THREE.MeshStandardMaterial({ color: '#2b3340', roughness: 0.5, metalness: 0.3 })
const frameMat = new THREE.MeshStandardMaterial({ color: '#dfe3e8', roughness: 0.8, metalness: 0 })
const trayPaperMat = new THREE.MeshStandardMaterial({ color: '#f3f1ea', roughness: 0.9 })

function PosterBoard({ paper, position }: { paper: Paper; position: [number, number, number] }) {
  const [x, , z] = position
  const [posterTex, setPosterTex] = useState<THREE.CanvasTexture | null>(null)
  const texRef = useRef<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    const apply = (logo: HTMLImageElement | null) => {
      const tex = new THREE.CanvasTexture(buildPosterCanvas(paper, logo))
      tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true
      texRef.current?.dispose(); texRef.current = tex; setPosterTex(tex)
    }
    apply(null)
    let cancelled = false
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => { if (!cancelled && img.naturalWidth > 0) apply(img) }
    img.src = '/cvpr-logo.svg'
    return () => { cancelled = true }
  }, [paper])
  useEffect(() => () => { texRef.current?.dispose() }, [])

  return (
    <group position={[x, 0, z]}>
      {/* Single back leg easel support */}
      <mesh position={[0, 1.6, -0.55]} rotation={[-0.18, 0, 0]} castShadow material={easelMat}><cylinderGeometry args={[0.035, 0.045, 3.6, 8]} /></mesh>

      {/* Board frame + poster surface */}
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow material={frameMat}><boxGeometry args={[2.9, 3.9, 0.1]} /></mesh>
      <mesh position={[0, 2.1, 0.052]}>
        <planeGeometry args={[2.6, 3.6]} />
        <meshStandardMaterial key={posterTex ? 'tex' : 'plain'} map={posterTex ?? undefined} color="#ffffff" roughness={0.85} metalness={0} />
      </mesh>

      {/* Handout tray */}
      <mesh position={[0, 0.95, 0.45]} castShadow receiveShadow material={easelMat}><boxGeometry args={[1.2, 0.06, 0.3]} /></mesh>
      <mesh position={[0, 1.0, 0.45]} castShadow material={trayPaperMat}><boxGeometry args={[0.5, 0.05, 0.22]} /></mesh>
    </group>
  )
}
