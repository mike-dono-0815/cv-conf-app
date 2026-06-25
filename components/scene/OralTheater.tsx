'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { Paper } from '@/lib/types'

interface Props {
  oral: Paper
}

const SEAT_COLOR = '#c0392b'
const SCREEN_COLOR = '#0a0a14'
const PODIUM_COLOR = '#1a2b4a'

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word }
    else { current = test }
  }
  if (current) lines.push(current)
  return lines
}

const SEAT_POSITIONS: [number, number, number][] = [
  [-4.25, 0, -4],  [-2.55, 0, -4],  [-0.85, 0, -4],  [0.85, 0, -4],  [2.55, 0, -4],  [4.25, 0, -4],
  [-4.25, 0, -6],  [-2.55, 0, -6],  [-0.85, 0, -6],  [0.85, 0, -6],  [2.55, 0, -6],  [4.25, 0, -6],
  [-4.25, 0, -8],  [-2.55, 0, -8],  [-0.85, 0, -8],  [0.85, 0, -8],  [2.55, 0, -8],  [4.25, 0, -8],
  [-4.25, 0, -10], [-2.55, 0, -10], [-0.85, 0, -10], [0.85, 0, -10], [2.55, 0, -10], [4.25, 0, -10],
  [-4.25, 0, -12], [-2.55, 0, -12], [-0.85, 0, -12], [0.85, 0, -12], [2.55, 0, -12], [4.25, 0, -12],
]

export function OralTheater({ oral }: Props) {
  const screenTex = useMemo(() => {
    const W = 860, H = 510
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0d1535')
    grad.addColorStop(1, '#1a2550')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'
    let y = 58
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.fillText('★  CVPR 2026 HIGHLIGHT PAPER', W / 2, y)
    y += 52
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px system-ui, sans-serif'
    for (const line of wrapText(ctx, oral.title, W - 80)) { ctx.fillText(line, W / 2, y); y += 40 }
    y += 10
    ctx.fillStyle = '#a0b4d0'
    ctx.font = '23px system-ui, sans-serif'
    ctx.fillText(`${oral.authors[0]} et al.`, W / 2, y)
    y += 36
    ctx.fillStyle = '#5a7a9a'
    ctx.font = '17px system-ui, sans-serif'
    for (const line of wrapText(ctx, oral.abstract.slice(0, 180) + '…', W - 80).slice(0, 4)) { ctx.fillText(line, W / 2, y); y += 24 }
    y += 12
    ctx.fillStyle = '#c0392b'
    ctx.font = '17px system-ui, sans-serif'
    ctx.fillText('Walk to the front row and press E to attend the talk', W / 2, Math.min(y, H - 24))
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [oral])

  return (
    <group>
      {/* Big screen */}
      <mesh position={[1, 3.5, -18]}>
        <boxGeometry args={[9, 5.5, 0.15]} />
        <meshStandardMaterial color={SCREEN_COLOR} />
      </mesh>

      {/* Screen content */}
      <mesh position={[1, 3.5, -17.9]}>
        <boxGeometry args={[8.6, 5.1, 0.05]} />
        <meshStandardMaterial
          key={screenTex ? 'screen-tex' : 'screen-plain'}
          emissiveMap={screenTex ?? undefined}
          emissive="#ffffff"
          emissiveIntensity={0.9}
          color="#000000"
        />
      </mesh>

      {/* Screen light */}
      <pointLight position={[1, 3.5, -15]} intensity={8} distance={18} color="#304060" />

      {/* Podium */}
      <mesh position={[1, 0.5, -13]}>
        <boxGeometry args={[1.2, 1, 0.6]} />
        <meshStandardMaterial color={PODIUM_COLOR} />
      </mesh>
      <mesh position={[1, 1.05, -13]}>
        <boxGeometry args={[1.4, 0.08, 0.7]} />
        <meshStandardMaterial color="#243555" />
      </mesh>

      {/* Speaker avatar (simple geometric person) */}
      <group position={[1, 0, -13.8]}>
        {/* Body */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.35, 0.7, 0.2]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.45, 0]}>
          <sphereGeometry args={[0.18, 8, 6]} />
          <meshStandardMaterial color="#e8c9a0" />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.1, 0.35, 0]}>
          <boxGeometry args={[0.13, 0.7, 0.15]} />
          <meshStandardMaterial color="#1a2b4a" />
        </mesh>
        <mesh position={[0.1, 0.35, 0]}>
          <boxGeometry args={[0.13, 0.7, 0.15]} />
          <meshStandardMaterial color="#1a2b4a" />
        </mesh>
      </group>

      {/* Seats */}
      {SEAT_POSITIONS.map(([x, , z], i) => (
        <Seat key={i} position={[x, 0, z]} />
      ))}

    </group>
  )
}

function Seat({ position }: { position: [number, number, number] }) {
  const [x, y, z] = position
  return (
    <group position={[x, y, z]}>
      {/* Seat base */}
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.7, 0.08, 0.6]} />
        <meshStandardMaterial color={SEAT_COLOR} />
      </mesh>
      {/* Back rest */}
      <mesh position={[0, 0.6, 0.26]}>
        <boxGeometry args={[0.7, 0.6, 0.08]} />
        <meshStandardMaterial color={SEAT_COLOR} />
      </mesh>
      {/* Legs */}
      {[[-0.3, -0.3], [-0.3, 0.3], [0.3, -0.3], [0.3, 0.3]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.12, lz]}>
          <boxGeometry args={[0.05, 0.24, 0.05]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  )
}
