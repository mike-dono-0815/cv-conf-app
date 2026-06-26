'use client'

// DROP-IN REPLACEMENT for components/scene/HallStructure.tsx
// Adds: warm noisy event-carpet (with bump), entrance runner, acoustic-tile ceiling,
// textured warm walls + dark baseboards, ceiling TRUSS grid, recessed TROFFER fixtures
// (emissive panels + a few warm point lights), navy pillars with gold caps + low walls,
// HANGING zone banners on rigs, and the CVPR entry banner.
// All large surfaces receiveShadow; pillars/ban-rigs castShadow.

import { useMemo, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

const PILLAR_Z = [-18, -10, -2, 6, 14] as const
const GOLD = '#c9a14a'

function addNoise(ctx: CanvasRenderingContext2D, w: number, h: number, amt: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amt
    d[i] += n; d[i + 1] += n; d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

function useTextures() {
  return useMemo(() => {
    const srgb = (t: THREE.Texture) => { t.colorSpace = THREE.SRGBColorSpace; return t }

    // Warm event carpet — desaturated burgundy/navy checker + fiber noise
    const carpet = (() => {
      const S = 256, c = document.createElement('canvas'); c.width = c.height = S
      const ctx = c.getContext('2d')!
      const cells = 8, cs = S / cells
      for (let y = 0; y < cells; y++) for (let x = 0; x < cells; x++) {
        ctx.fillStyle = ((x + y) % 2 === 0) ? '#6a2b30' : '#2c3349'
        ctx.fillRect(x * cs, y * cs, cs, cs)
      }
      addNoise(ctx, S, S, 26)
      const t = new THREE.CanvasTexture(c)
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 20)
      return srgb(t)
    })()
    const carpetBump = (() => {
      const S = 256, c = document.createElement('canvas'); c.width = c.height = S
      const ctx = c.getContext('2d')!; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, S, S)
      addNoise(ctx, S, S, 90)
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 40)
      return t
    })()
    const wall = (() => {
      const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H
      const ctx = c.getContext('2d')!
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#efe9df'); g.addColorStop(0.5, '#e7e0d4'); g.addColorStop(1, '#ddd5c7')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(120,108,92,0.18)'; ctx.lineWidth = 1.5
      for (let x = 64; x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      addNoise(ctx, W, H, 10)
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1)
      return srgb(t)
    })()
    const ceiling = (() => {
      const S = 256, c = document.createElement('canvas'); c.width = c.height = S
      const ctx = c.getContext('2d')!; ctx.fillStyle = '#cdc6ba'; ctx.fillRect(0, 0, S, S)
      addNoise(ctx, S, S, 14)
      ctx.strokeStyle = 'rgba(90,84,74,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(2, 2, S - 4, S - 4)
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 20)
      return srgb(t)
    })()
    return { carpet, carpetBump, wall, ceiling }
  }, [])
}

function bannerTexture(text: string) {
  const W = 768, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#26304a'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'; ctx.font = 'bold 58px system-ui, sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, H / 2)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

function CvprBanner() {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null)
  const texRef = useRef<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    let cancelled = false
    const W = 2000, H = 300
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')!

    const build = (img: HTMLImageElement | null) => {
      ctx.fillStyle = '#26304a'; ctx.fillRect(0, 0, W, H)
      if (img && img.naturalWidth > 0) {
        const lh = H * 0.75
        const lw = lh * (img.naturalWidth / img.naturalHeight)
        ctx.drawImage(img, (W - lw) / 2, (H - lh) / 2, lw, lh)
      } else {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 160px system-ui'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('CVPR', W / 2, H / 2)
      }
      if (cancelled) return
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      texRef.current?.dispose(); texRef.current = t; setTex(t)
    }

    build(null)
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => { if (!cancelled) build(img) }
    img.src = '/cvpr-logo.svg'
    return () => { cancelled = true; texRef.current?.dispose() }
  }, [])

  return (
    <mesh position={[0, 5.4, 19.7]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[20, 3]} />
      <meshStandardMaterial map={tex ?? undefined} roughness={0.85} />
    </mesh>
  )
}

export function HallStructure() {
  const tex = useTextures()

  const mats = useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ map: tex.wall, roughness: 0.95, metalness: 0 }),
    ceil: new THREE.MeshStandardMaterial({ map: tex.ceiling, roughness: 1, metalness: 0 }),
    base: new THREE.MeshStandardMaterial({ color: '#23262d', roughness: 0.6, metalness: 0.2 }),
    pillar: new THREE.MeshStandardMaterial({ color: '#2a3350', roughness: 0.55, metalness: 0.15 }),
    truss: new THREE.MeshStandardMaterial({ color: '#3c3f47', roughness: 0.5, metalness: 0.7 }),
    metal: new THREE.MeshStandardMaterial({ color: '#6f7378', roughness: 0.35, metalness: 0.85 }),
    gold: new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.4, metalness: 0.7 }),
    floor: new THREE.MeshStandardMaterial({ map: tex.carpet, bumpMap: tex.carpetBump, bumpScale: 0.04, roughness: 0.98, metalness: 0 }),
    runner: new THREE.MeshStandardMaterial({ color: '#3a1318', roughness: 1 }),
    trofferPanel: new THREE.MeshStandardMaterial({ color: '#fff4e2', emissive: '#fff0d8', emissiveIntensity: 1.4 }),
    trofferFrame: new THREE.MeshStandardMaterial({ color: '#cfd2d6', roughness: 0.4, metalness: 0.5 }),
  }), [tex])

  const troffers = useMemo(() => {
    const out: [number, number][] = []
    for (const x of [-19, -9.5, 0, 9.5, 19]) for (const z of [-12, -2, 8]) out.push([x, z])
    return out
  }, [])

  return (
    <group>
      {/* Carpet + entrance runner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mats.floor}>
        <planeGeometry args={[60, 40]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow material={mats.runner}>
        <planeGeometry args={[5, 38]} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7, 0]} material={mats.ceil}>
        <planeGeometry args={[60, 40]} />
      </mesh>

      {/* Walls */}
      {([[0, 3.5, -20, 60, 7, 0.4], [0, 3.5, 20, 60, 7, 0.4], [30, 3.5, 0, 0.4, 7, 40], [-30, 3.5, 0, 0.4, 7, 40]] as const).map((w, i) => (
        <mesh key={i} position={[w[0], w[1], w[2]]} receiveShadow material={mats.wall}>
          <boxGeometry args={[w[3], w[4], w[5]]} />
        </mesh>
      ))}

      {/* Baseboards */}
      {([[0, -19.78, 60, 0.3], [0, 19.78, 60, 0.3]] as const).map(([x, z, w, d], i) => (
        <mesh key={`bbz${i}`} position={[x, 0.175, z]} receiveShadow material={mats.base}><boxGeometry args={[w, 0.35, d]} /></mesh>
      ))}
      {([[-29.78, 0, 0.3, 40], [29.78, 0, 0.3, 40]] as const).map(([x, z, w, d], i) => (
        <mesh key={`bbx${i}`} position={[x, 0.175, z]} receiveShadow material={mats.base}><boxGeometry args={[w, 0.35, d]} /></mesh>
      ))}

      {/* Ceiling truss grid */}
      {[-14, -7, 0, 7, 14].map((z) => (
        <mesh key={`tx${z}`} position={[0, 6.78, z]} material={mats.truss}><boxGeometry args={[60, 0.18, 0.18]} /></mesh>
      ))}
      {[-20, -10, 0, 10, 20].map((x) => (
        <mesh key={`tz${x}`} position={[x, 6.84, 0]} material={mats.truss}><boxGeometry args={[0.18, 0.18, 40]} /></mesh>
      ))}

      {/* Recessed troffer fixtures */}
      {troffers.map(([x, z], i) => (
        <group key={`tr${i}`}>
          <mesh position={[x, 6.7, z]} material={mats.trofferFrame}><boxGeometry args={[3.4, 0.12, 1.2]} /></mesh>
          <mesh position={[x, 6.66, z]} material={mats.trofferPanel}><boxGeometry args={[3.2, 0.08, 1.0]} /></mesh>
        </group>
      ))}
      {/* Warm pools (cheap, unshadowed) */}
      {([[-19, -2], [0, -2], [19, -2], [-9.5, 8], [9.5, 8], [0, -12]] as const).map(([x, z], i) => (
        <pointLight key={`pl${i}`} position={[x, 6.4, z]} color="#ffe6c0" intensity={0.9} distance={26} decay={2} />
      ))}

      {/* Zone separator pillars (gold caps) + low walls */}
      {([-7, 9] as const).map((x) => (
        <group key={`col${x}`}>
          {PILLAR_Z.map((z) => (
            <group key={z}>
              <mesh position={[x, 3.5, z]} castShadow receiveShadow material={mats.pillar}><boxGeometry args={[0.6, 7, 0.6]} /></mesh>
              <mesh position={[x, 6.6, z]} material={mats.gold}><boxGeometry args={[0.78, 0.16, 0.78]} /></mesh>
            </group>
          ))}
          {PILLAR_Z.slice(0, -1).map((z, i) => {
            const cz = (z + PILLAR_Z[i + 1]) / 2
            const len = Math.abs(PILLAR_Z[i + 1] - z) - 0.6
            return <mesh key={`lw${i}`} position={[x, 0.55, cz]} castShadow receiveShadow material={mats.pillar}><boxGeometry args={[0.4, 1.1, len]} /></mesh>
          })}
        </group>
      ))}

      {/* Hanging zone banners on rigs */}
      <HangingBanner x={-18} z={-10} text="POSTER SESSION" metal={mats.metal} />
      <HangingBanner x={1} z={-10} text="ORAL PRESENTATIONS" metal={mats.metal} />
      <HangingBanner x={20} z={-10} text="INDUSTRY FAIR" metal={mats.metal} />

      {/* CVPR entry banner (south wall) */}
      <CvprBanner />
    </group>
  )
}

function HangingBanner({ x, z, text, metal }: { x: number; z: number; text: string; metal: THREE.Material }) {
  const map = useMemo(() => bannerTexture(text), [text])
  return (
    <group>
      <mesh position={[x, 4.9, z]}>
        <planeGeometry args={[7.2, 2.4]} />
        <meshStandardMaterial map={map} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[x, 6.15, z]} material={metal}><boxGeometry args={[7.4, 0.08, 0.08]} /></mesh>
      {[-3.4, 3.4].map((dx) => (
        <mesh key={dx} position={[x + dx, 5.65, z]} material={metal}><boxGeometry args={[0.03, 1.0, 0.03]} /></mesh>
      ))}
    </group>
  )
}
