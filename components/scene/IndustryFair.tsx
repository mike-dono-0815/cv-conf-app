'use client'

// DROP-IN REPLACEMENT for components/scene/IndustryFair.tsx
// Upgrades booth materials (slight metalness on dark panels + orange stripe),
// adds a lit laptop, an angled "We're Hiring" card, a roll-up banner stand, a warm
// booth light, and swaps the box-person for the refined <Figure/> recruiter with a name badge.
// Keeps the same `booth` prop + amazon back-wall content.

import { useMemo } from 'react'
import * as THREE from 'three'
import { Figure } from './Figure'
import type { BoothData } from '@/lib/types'

interface Props { booth: BoothData }

const AMZ_ORANGE = '#ff9900'
const AMZ_DARK = '#232f3e'

function textTex(opts: { w: number; h: number; bg: string; fg: string; lines: string[]; sizes: number[]; weights?: string[] }) {
  const { w, h, bg, fg, lines, sizes, weights = [] } = opts
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d')!
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const step = h / (lines.length + 1)
  lines.forEach((ln, i) => { ctx.fillStyle = fg; ctx.font = `${weights[i] || 'bold'} ${sizes[i]}px system-ui, sans-serif`; ctx.fillText(ln, w / 2, step * (i + 1)) })
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

export function IndustryFair({ booth }: Props) {
  const backWallTex = useMemo(() => {
    const W = 1400, H = 600, c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')!
    ctx.fillStyle = AMZ_DARK; ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'; ctx.fillStyle = AMZ_ORANGE
    ctx.font = '900 150px system-ui, sans-serif'; ctx.fillText('amazon', W / 2, 185)
    ctx.font = '600 44px system-ui, sans-serif'; ctx.fillText('science', W / 2, 252)
    ctx.strokeStyle = 'rgba(255,153,0,0.3)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(120, 278); ctx.lineTo(W - 120, 278); ctx.stroke()
    const quote = '"Join us in pioneering solutions to complex challenges that not only delight our customers but also help define the future of technology."'
    ctx.font = '28px system-ui, sans-serif'
    const maxW = W - 200; let line = '', y = 328
    for (const word of quote.split(' ')) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, W / 2, y); line = word; y += 46 }
      else line = test
    }
    if (line) ctx.fillText(line, W / 2, y)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }, [])
  const hireTex = useMemo(() => textTex({ w: 500, h: 130, bg: AMZ_ORANGE, fg: '#ffffff', lines: ["We're Hiring!"], sizes: [56] }), [])
  const bannerTex = useMemo(() => textTex({ w: 320, h: 440, bg: AMZ_DARK, fg: AMZ_ORANGE, lines: ['Amazon', 'Computer', 'Vision'], sizes: [50, 40, 40], weights: ['bold', '500', '500'] }), [])
  const badgeTex = useMemo(() => textTex({ w: 400, h: 110, bg: '#ffffff', fg: '#111', lines: [`${booth.recruiterName} — Recruiter`], sizes: [34] }), [booth.recruiterName])

  const mats = useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ map: backWallTex, roughness: 0.7 }),
    stripe: new THREE.MeshStandardMaterial({ color: AMZ_ORANGE, roughness: 0.5, metalness: 0.2 }),
    dark: new THREE.MeshStandardMaterial({ color: AMZ_DARK, roughness: 0.7 }),
    counterTop: new THREE.MeshStandardMaterial({ color: '#11161d', roughness: 0.3, metalness: 0.4 }),
    counterBody: new THREE.MeshStandardMaterial({ color: '#1a2530', roughness: 0.7 }),
    screen: new THREE.MeshStandardMaterial({ color: '#111', emissive: '#13243f', emissiveIntensity: 0.6 }),
    metal: new THREE.MeshStandardMaterial({ color: '#6f7378', roughness: 0.35, metalness: 0.85 }),
  }), [backWallTex])

  return (
    <group>
      {/* Back wall + orange stripe */}
      <mesh position={[20, 3, -18]} castShadow receiveShadow material={mats.wall}><boxGeometry args={[14, 6, 0.3]} /></mesh>
      <mesh position={[20, 5.7, -17.78]} material={mats.stripe}><boxGeometry args={[14, 0.8, 0.14]} /></mesh>

      {/* Side panels */}
      <mesh position={[13.2, 3, -16]} material={mats.dark}><boxGeometry args={[0.2, 6, 4]} /></mesh>
      <mesh position={[26.8, 3, -16]} material={mats.dark}><boxGeometry args={[0.2, 6, 4]} /></mesh>

      {/* Counter */}
      <mesh position={[20, 1.0, -13]} castShadow receiveShadow material={mats.counterTop}><boxGeometry args={[10, 0.14, 1.3]} /></mesh>
      <mesh position={[20, 0.5, -13]} castShadow material={mats.counterBody}><boxGeometry args={[9.8, 0.92, 1.05]} /></mesh>

      {/* Laptop */}
      <mesh position={[18, 1.45, -13.3]} material={mats.screen}><boxGeometry args={[1.2, 0.78, 0.05]} /></mesh>
      <mesh position={[18, 1.08, -13.05]} material={mats.metal}><boxGeometry args={[1.2, 0.05, 0.5]} /></mesh>

      {/* "We're Hiring" card */}
      <mesh position={[22, 1.35, -12.9]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[2, 0.52]} />
        <meshStandardMaterial map={hireTex} />
      </mesh>

      {/* Warm booth light */}
      <pointLight position={[20, 5, -14]} color="#fff3e0" intensity={1.4} distance={18} decay={2} />

      {/* Roll-up banner stand */}
      <mesh position={[27, 1, -12.4]} material={mats.metal}><boxGeometry args={[0.06, 2, 0.06]} /></mesh>
      <mesh position={[27, 3, -12.4]}>
        <planeGeometry args={[1.5, 2.1]} />
        <meshStandardMaterial map={bannerTex} side={THREE.DoubleSide} />
      </mesh>

      {/* Recruiter + name badge */}
      <Figure position={[20, 0, -14.6]} shirt="#ff9900" pants="#232f3e" skin="#c8a882" />
      <mesh position={[20, 1.15, -14.42]}>
        <planeGeometry args={[0.9, 0.25]} />
        <meshBasicMaterial map={badgeTex} toneMapped={false} />
      </mesh>
    </group>
  )
}
