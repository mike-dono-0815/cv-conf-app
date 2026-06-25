'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

const SIGNS = [
  { label: 'Poster Hall',    sub: '5 papers',       arrow: '←', bg: '#1a2b6a', x:  -7 },
  { label: 'Oral Theater',   sub: 'Highlight talk',  arrow: '↑', bg: '#5a1a0a', x:   1 },
  { label: 'Industry Fair',  sub: 'Amazon booth',    arrow: '→', bg: '#0a3d1f', x:   9 },
] as const

const W = 640, H = 240

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function makeTexture(label: string, sub: string, arrow: string, bg: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background panel
  ctx.fillStyle = bg
  ctx.globalAlpha = 0.92
  roundRect(ctx, 6, 6, W - 12, H - 12, 28)
  ctx.fill()
  ctx.globalAlpha = 1

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 3
  roundRect(ctx, 6, 6, W - 12, H - 12, 28)
  ctx.stroke()

  // Arrow
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 130px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(arrow, 108, H / 2 + 6)

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(185, 30)
  ctx.lineTo(185, H - 30)
  ctx.stroke()

  // Label
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 58px system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 210, H / 2 - 22)

  // Sub-label
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = `32px system-ui, sans-serif`
  ctx.fillText(sub, 212, H / 2 + 32)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export function FloorArrows() {
  const textures = useMemo(
    () => SIGNS.map(s => makeTexture(s.label, s.sub, s.arrow, s.bg)),
    []
  )

  return (
    <group>
      {SIGNS.map((sign, i) => (
        <mesh
          key={sign.label}
          position={[sign.x, 0.015, 16]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[5.5, 2.1]} />
          <meshStandardMaterial
            map={textures[i]}
            emissiveMap={textures[i]}
            emissive="#ffffff"
            emissiveIntensity={0.18}
            transparent
            opacity={0.93}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}
