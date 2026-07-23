'use client'

// DROP-IN REPLACEMENT for components/scene/OralTheater.tsx
// Upgrades: bezel + bright basic-material screen (reads as a lit display), stage platform,
// podium with gold top, warm speaker SPOTLIGHT, RAKED seating on risers with fabric-textured
// red chairs on metal stems, and the refined <Figure/> speaker.
// Keeps the same `oral` prop + screen content layout.

import { useMemo } from 'react'
import * as THREE from 'three'
import { Figure } from './Figure'
import type { Paper } from '@/lib/types'

interface Props { oral: Paper }

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' '); const lines: string[] = []; let cur = ''
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t }
  if (cur) lines.push(cur); return lines
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}

const SEAT_ROWS = [-4, -6, -8, -10, -12]
const SEAT_X = [-4.25, -2.55, -0.85, 0.85, 2.55, 4.25]

function fabricTexture(hex: string) {
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S
  const ctx = c.getContext('2d')!; ctx.fillStyle = hex; ctx.fillRect(0, 0, S, S)
  const img = ctx.getImageData(0, 0, S, S); const d = img.data
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 30; d[i] += n; d[i + 1] += n; d[i + 2] += n }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t
}

export function OralTheater({ oral }: Props) {
  const screenTex = useMemo(() => {
    const W = 1024, H = 600, c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0d1535'); g.addColorStop(1, '#1c2a55')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.textAlign = 'center'
    ctx.fillStyle = '#e8a33d'; ctx.font = 'bold 26px system-ui'; ctx.fillText('★  CVPR 2026 ORAL', W / 2, 80)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 40px system-ui'
    wrap(ctx, oral.title, W - 120).forEach((l, i) => ctx.fillText(l, W / 2, 150 + i * 48))
    ctx.fillStyle = '#9fb4d6'; ctx.font = '24px system-ui'; ctx.fillText(`${oral.authors[0]} et al.`, W / 2, 300)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; roundRect(ctx, 90, 340, W - 180, 180, 10); ctx.fill()
    ctx.fillStyle = '#6f86ad'; ctx.font = '18px system-ui'; ctx.textAlign = 'left'
    wrap(ctx, oral.abstract, W - 260).slice(0, 3).forEach((t, i) => ctx.fillText('• ' + t, 120, 380 + i * 40))
    ctx.textAlign = 'center'; ctx.fillStyle = '#c0392b'; ctx.font = '18px system-ui'
    ctx.fillText('Walk to the front row and press E to attend', W / 2, H - 30)
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t
  }, [oral])

  const seatFabric = useMemo(() => new THREE.MeshStandardMaterial({ map: fabricTexture('#a33028'), roughness: 0.95 }), [])
  const bezelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0a0a12', roughness: 0.4, metalness: 0.3 }), [])
  const stageMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2118', roughness: 0.8 }), [])
  const podiumMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a3350', roughness: 0.55, metalness: 0.15 }), [])
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9a14a', roughness: 0.4, metalness: 0.7 }), [])
  const stemMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6f7378', roughness: 0.35, metalness: 0.85 }), [])
  const riserMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#39414f', roughness: 0.9 }), [])

  const spotTarget = useMemo(() => { const o = new THREE.Object3D(); o.position.set(1, 1, -14.2); return o }, [])

  return (
    <group>
      {/* Screen bezel + lit screen */}
      <mesh position={[1, 3.6, -18]} castShadow material={bezelMat}><boxGeometry args={[9.6, 6.0, 0.2]} /></mesh>
      <mesh position={[1, 3.6, -17.88]}>
        <planeGeometry args={[8.8, 5.2]} />
        <meshBasicMaterial map={screenTex} toneMapped={false} />
      </mesh>
      <pointLight position={[1, 3.6, -15]} color="#3a5a9a" intensity={1.3} distance={20} decay={2} />

      {/* Stage + podium */}
      <mesh position={[1, 0.2, -15.5]} receiveShadow material={stageMat}><boxGeometry args={[13, 0.4, 4]} /></mesh>
      <mesh position={[1, 0.95, -13.6]} castShadow material={podiumMat}><boxGeometry args={[1.3, 1.1, 0.7]} /></mesh>
      <mesh position={[1, 1.52, -13.6]} material={goldMat}><boxGeometry args={[1.5, 0.08, 0.85]} /></mesh>

      {/* Warm speaker spotlight */}
      <spotLight position={[1, 6.4, -12]} target={spotTarget} angle={0.5} penumbra={0.5} intensity={6} distance={16} decay={1.5} color="#fff0d0" />
      <primitive object={spotTarget} />

      {/* Speaker */}
      <Figure position={[1, 0, -14.2]} shirt="#2c3e50" pants="#26304a" skin="#e8c9a0" rotationY={0.02} />

      {/* Raked seating */}
      {SEAT_ROWS.map((z, ri) => {
        const rise = ri * 0.22
        return (
          <group key={z}>
            {SEAT_X.map((x) => (
              <group key={x} position={[x + 1, rise, z]}>
                <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={seatFabric}><boxGeometry args={[0.72, 0.12, 0.62]} /></mesh>
                <mesh position={[0, 0.86, 0.28]} castShadow material={seatFabric}><boxGeometry args={[0.72, 0.7, 0.1]} /></mesh>
                <mesh position={[0, 0.25, 0]} material={stemMat}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /></mesh>
              </group>
            ))}
            {ri > 0 && (
              <mesh position={[1, rise / 2, z]} receiveShadow material={riserMat}><boxGeometry args={[11, rise + 0.02, 1.7]} /></mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
