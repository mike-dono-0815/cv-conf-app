'use client'

// DROP-IN REPLACEMENT for components/scene/OralTheater.tsx
// Upgrades: bezel + bright basic-material screen (reads as a lit display), stage platform,
// podium with gold top, warm speaker SPOTLIGHT, RAKED seating on risers with fabric-textured
// red chairs on metal stems, and the refined <Figure/> speaker.
// Keeps the same `oral` prop + screen content layout.

import { useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Figure } from './Figure'
import { AMAZON_TALKS } from '@/lib/amazonTalks'

const SEAT_ROWS = [-4, -6, -8, -10, -12]
const SEAT_X = [-4.25, -2.55, -0.85, 0.85, 2.55, 4.25]

function fabricTexture(hex: string) {
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S
  const ctx = c.getContext('2d')!; ctx.fillStyle = hex; ctx.fillRect(0, 0, S, S)
  const img = ctx.getImageData(0, 0, S, S); const d = img.data
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 30; d[i] += n; d[i + 1] += n; d[i + 2] += n }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

  function buildScreenCanvas(logo: HTMLImageElement | null): THREE.CanvasTexture {
    const W = 1024, H = 600, c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0d1535'); g.addColorStop(1, '#1c2a55')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    // Header — CVPR logo left, title right
    if (logo && logo.naturalWidth > 0) {
      const lh = 38, lw = lh * (logo.naturalWidth / logo.naturalHeight)
      ctx.drawImage(logo, 30, (58 - lh) / 2, lw, lh)
    }
    ctx.textAlign = 'right'
    ctx.fillStyle = '#e8a33d'; ctx.font = 'bold 22px system-ui'
    ctx.fillText('AMAZON @ CVPR 2026 — ORAL SESSION', W - 30, 38)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(30, 58, W - 60, 1)

    // Talk list
    const talkH = (H - 68 - 42) / AMAZON_TALKS.length
    AMAZON_TALKS.forEach((talk, i) => {
      const y = 68 + i * talkH
      ctx.textAlign = 'left'
      ctx.fillStyle = '#e8a33d'; ctx.font = 'bold 17px system-ui'
      ctx.fillText(`${i + 1}`, 36, y + talkH * 0.42)
      const title = talk.shortTitle.length > 46 ? talk.shortTitle.slice(0, 46) + '…' : talk.shortTitle
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 19px system-ui'
      ctx.fillText(title, 66, y + talkH * 0.4)
      ctx.fillStyle = '#7a9bc4'; ctx.font = '14px system-ui'
      ctx.fillText(`${talk.firstAuthor} et al.`, 66, y + talkH * 0.72)
      if (i < AMAZON_TALKS.length - 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(30, y + talkH); ctx.lineTo(W - 30, y + talkH); ctx.stroke()
      }
    })

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(30, H - 42, W - 60, 1)
    ctx.textAlign = 'center'; ctx.fillStyle = '#c0392b'; ctx.font = '17px system-ui'
    ctx.fillText('Sit in the front row and press E to select a talk', W / 2, H - 16)

    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }

export function OralTheater() {
  const [screenTex, setScreenTex] = useState<THREE.CanvasTexture>(() => buildScreenCanvas(null))

  useEffect(() => {
    const img = new Image()
    img.onload = () => { if (img.naturalWidth) setScreenTex(buildScreenCanvas(img)) }
    img.src = '/cvpr-logo.svg'
  }, [])

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

      {/* Raked seating — back rows highest, front rows at stage level */}
      {SEAT_ROWS.map((z, ri) => {
        const rise = (SEAT_ROWS.length - 1 - ri) * 0.22
        return (
          <group key={z}>
            {SEAT_X.map((x) => (
              <group key={x} position={[x + 1, rise, z]}>
                <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={seatFabric}><boxGeometry args={[0.72, 0.12, 0.62]} /></mesh>
                <mesh position={[0, 0.86, 0.28]} castShadow material={seatFabric}><boxGeometry args={[0.72, 0.7, 0.1]} /></mesh>
                <mesh position={[0, 0.25, 0]} material={stemMat}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /></mesh>
              </group>
            ))}
            {rise > 0 && (
              <mesh position={[1, rise / 2, z]} receiveShadow material={riserMat}><boxGeometry args={[9.0, rise + 0.02, 1.7]} /></mesh>
            )}
          </group>
        )
      })}

      {/* Side staircases — step down from back row (highest, z=−4) to front (stage level, z=−12) */}
      {([-4.0, 6.0] as const).map((sx) => (
        <group key={sx}>
          {/* Half-step landing: bridges the aisle (y=0) up to the back-row platform */}
          <mesh position={[sx, 0.22, -2.5]} receiveShadow material={riserMat}>
            <boxGeometry args={[1.0, 0.44, 1.0]} />
          </mesh>
          {/* One step block per elevated row, matching its rise height */}
          {SEAT_ROWS.map((z, ri) => {
            const rise = (SEAT_ROWS.length - 1 - ri) * 0.22
            return rise > 0 ? (
              <mesh key={z} position={[sx, rise / 2, z]} receiveShadow material={riserMat}>
                <boxGeometry args={[1.0, rise, 2.0]} />
              </mesh>
            ) : null
          })}
        </group>
      ))}
    </group>
  )
}
