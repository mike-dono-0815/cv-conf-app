'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

const WALL_MAT = { color: '#e8eaef', roughness: 0.95, metalness: 0 }
const CEILING_MAT = { color: '#d0d4de', roughness: 0.9, metalness: 0 }
const PILLAR_MAT = { color: '#1a2b4a', roughness: 0.6, metalness: 0.1 }

// Classic conference-carpet checkerboard: deep burgundy + deep navy
const CHECKER_A = '#6b1220'
const CHECKER_B = '#1a2b4a'

// Pillar z positions — shared between pillars and wall fill segments
const PILLAR_Z = [-18, -10, -2, 6, 14] as const

// Wall fill segments: centered between each consecutive pair of pillars,
// length = gap between pillar centres minus one pillar width (0.6)
const WALL_FILLS = PILLAR_Z.slice(0, -1).map((z, i) => ({
  centerZ: (z + PILLAR_Z[i + 1]) / 2,
  length: Math.abs(PILLAR_Z[i + 1] - z) - 0.6,
}))

function useCheckerTexture() {
  return useMemo(() => {
    // 2×2 pixel canvas — one checker cell per pixel, tiled by Three.js
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 2
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = CHECKER_A
    ctx.fillRect(0, 0, 1, 1)
    ctx.fillRect(1, 1, 1, 1)
    ctx.fillStyle = CHECKER_B
    ctx.fillRect(1, 0, 1, 1)
    ctx.fillRect(0, 1, 1, 1)

    const tex = new THREE.CanvasTexture(canvas)
    tex.magFilter = THREE.NearestFilter
    tex.minFilter = THREE.NearestFilter
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    // Floor is 60 × 40 world units; each square = 2 × 2 units → 30 × 20 repeats
    tex.repeat.set(30, 20)
    return tex
  }, [])
}

export function HallStructure() {
  const checkerTex = useCheckerTexture()

  return (
    <group>
      {/* Checkerboard carpet floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial map={checkerTex} roughness={0.85} metalness={0} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial {...CEILING_MAT} />
      </mesh>

      {/* Outer walls */}
      <mesh position={[0, 3.5, -20]}>
        <boxGeometry args={[60, 7, 0.3]} />
        <meshStandardMaterial {...WALL_MAT} />
      </mesh>
      <mesh position={[0, 3.5, 20]}>
        <boxGeometry args={[60, 7, 0.3]} />
        <meshStandardMaterial {...WALL_MAT} />
      </mesh>
      <mesh position={[30, 3.5, 0]}>
        <boxGeometry args={[0.3, 7, 40]} />
        <meshStandardMaterial {...WALL_MAT} />
      </mesh>
      <mesh position={[-30, 3.5, 0]}>
        <boxGeometry args={[0.3, 7, 40]} />
        <meshStandardMaterial {...WALL_MAT} />
      </mesh>

      {/* Zone separator pillars */}
      {([-7, 9] as const).map((x) =>
        PILLAR_Z.map((z) => (
          <mesh key={`pillar-${x}-${z}`} position={[x, 3.5, z]}>
            <boxGeometry args={[0.6, 7, 0.6]} />
            <meshStandardMaterial {...PILLAR_MAT} />
          </mesh>
        ))
      )}

      {/* Zone separator walls — fill between each pair of adjacent pillars */}
      {([-7, 9] as const).map((x) =>
        WALL_FILLS.map((seg) => (
          <mesh key={`wall-${x}-${seg.centerZ}`} position={[x, 3.5, seg.centerZ]}>
            <boxGeometry args={[0.6, 7, seg.length]} />
            <meshStandardMaterial {...PILLAR_MAT} />
          </mesh>
        ))
      )}

      {/* Zone banners on north wall */}
      <ZoneBanner position={[-18, 5.5, -19.5]} text="POSTER SESSION" color="#1a2b4a" />
      <ZoneBanner position={[1, 5.5, -19.5]} text="ORAL PRESENTATIONS" color="#8b1a1a" />
      <ZoneBanner position={[19, 5.5, -19.5]} text="INDUSTRY FAIR" color="#663300" />

      {/* CVPR 2026 entry banner */}
      <CvprBanner />

      {/* Ceiling lights */}
      {[-15, 0, 15].map((x) =>
        [-10, 5].map((z) => (
          <group key={`light-${x}-${z}`} position={[x, 6.8, z]}>
            <mesh>
              <boxGeometry args={[3, 0.1, 0.6]} />
              <meshStandardMaterial color="#fffaee" emissive="#fffaee" emissiveIntensity={0.8} />
            </mesh>
            <pointLight position={[0, -0.2, 0]} intensity={15} distance={12} color="#fffaee" />
          </group>
        ))
      )}
    </group>
  )
}

function ZoneBanner({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  const tex = useMemo(() => {
    const W = 1200, H = 80
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = color
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 40px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, W / 2, H / 2)
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [text, color])

  return (
    <mesh position={position}>
      <boxGeometry args={[12, 0.8, 0.1]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  )
}

function CvprBanner() {
  const tex = useMemo(() => {
    const W = 2000, H = 120
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#c0392b'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CVPR 2026', W / 2, H / 2)
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [])

  return (
    <mesh position={[0, 6, 19.5]}>
      <boxGeometry args={[20, 1.2, 0.1]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  )
}
