'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { BoothData } from '@/lib/types'

interface Props {
  booth: BoothData
}

const AMAZON_ORANGE = '#ff9900'
const AMAZON_DARK = '#232f3e'

export function IndustryFair({ booth }: Props) {
  const backWallTex = useMemo(() => {
    const W = 1400, H = 600
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = AMAZON_DARK
    ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'
    ctx.fillStyle = AMAZON_ORANGE
    ctx.font = '900 150px system-ui, sans-serif'
    ctx.fillText('amazon', W / 2, 210)
    ctx.font = 'bold 36px system-ui, sans-serif'
    const quote = '“Join us in pioneering solutions to complex challenges that not only delight our customers but also help define the future of technology.”'
    const maxW = W - 120
    let line = '', y = 310
    for (const word of quote.split(' ')) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, W / 2, y); line = word; y += 50 }
      else { line = test }
    }
    if (line) ctx.fillText(line, W / 2, y)
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [])

  const bannerTex = useMemo(() => {
    const W = 300, H = 400
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = AMAZON_DARK
    ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'
    ctx.fillStyle = AMAZON_ORANGE
    ctx.font = 'bold 56px system-ui, sans-serif'
    ctx.fillText('Amazon', W / 2, 130)
    ctx.fillStyle = '#aaaaaa'
    ctx.font = '34px system-ui, sans-serif'
    ctx.fillText('Computer Vision &', W / 2, 220)
    ctx.fillText('Rekognition', W / 2, 270)
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [])

  const hiringTex = useMemo(() => {
    const W = 500, H = 120
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = AMAZON_ORANGE
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 56px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText("We're Hiring!", W / 2, H / 2)
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [])

  const nameBadgeTex = useMemo(() => {
    const W = 400, H = 100
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#111111'
    ctx.font = 'bold 52px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(booth.recruiterName, W / 2, H / 2)
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [booth.recruiterName])

  return (
    <group>
      {/* Booth back wall */}
      <mesh position={[20, 3, -18]}>
        <boxGeometry args={[14, 6, 0.3]} />
        <meshStandardMaterial map={backWallTex} />
      </mesh>

      {/* Orange top stripe */}
      <mesh position={[20, 5.7, -17.8]}>
        <boxGeometry args={[14, 0.8, 0.1]} />
        <meshStandardMaterial color={AMAZON_ORANGE} />
      </mesh>

      {/* Side panels */}
      <mesh position={[13.2, 3, -16]}>
        <boxGeometry args={[0.2, 6, 4]} />
        <meshStandardMaterial color={AMAZON_DARK} />
      </mesh>
      <mesh position={[26.8, 3, -16]}>
        <boxGeometry args={[0.2, 6, 4]} />
        <meshStandardMaterial color={AMAZON_DARK} />
      </mesh>

      {/* Counter table */}
      <mesh position={[20, 0.9, -13]}>
        <boxGeometry args={[10, 0.12, 1.2]} />
        <meshStandardMaterial color={AMAZON_DARK} />
      </mesh>
      <mesh position={[20, 0.45, -13]}>
        <boxGeometry args={[9.8, 0.9, 1]} />
        <meshStandardMaterial color="#1a2530" />
      </mesh>

      {/* Display stand / laptop-like */}
      <mesh position={[18, 1.2, -13.2]}>
        <boxGeometry args={[1.2, 0.8, 0.06]} />
        <meshStandardMaterial color="#111" emissive="#0d1a30" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[18, 0.98, -13]}>
        <boxGeometry args={[1.2, 0.06, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Open role cards on counter */}
      <mesh position={[22, 1.1, -12.95]}>
        <planeGeometry args={[2, 0.5]} />
        <meshStandardMaterial map={hiringTex} />
      </mesh>

      {/* Recruiter avatar */}
      <group position={[20, 0, -14.5]}>
        {/* Body */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.38, 0.72, 0.22]} />
          <meshStandardMaterial color="#ff9900" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.19, 8, 6]} />
          <meshStandardMaterial color="#c8a882" />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.11, 0.35, 0]}>
          <boxGeometry args={[0.13, 0.7, 0.16]} />
          <meshStandardMaterial color="#232f3e" />
        </mesh>
        <mesh position={[0.11, 0.35, 0]}>
          <boxGeometry args={[0.13, 0.7, 0.16]} />
          <meshStandardMaterial color="#232f3e" />
        </mesh>
        {/* Name badge */}
        <mesh position={[0, 1.0, 0.14]}>
          <planeGeometry args={[1.4, 0.35]} />
          <meshStandardMaterial map={nameBadgeTex} />
        </mesh>
      </group>

      {/* Booth light */}
      <pointLight position={[20, 5, -14]} intensity={12} distance={16} color="#fff8f0" />

      {/* Banner stand */}
      <mesh position={[27, 1.5, -14]}>
        <boxGeometry args={[0.06, 3, 0.06]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[27, 3, -14]}>
        <boxGeometry args={[1.5, 2, 0.05]} />
        <meshStandardMaterial map={bannerTex} />
      </mesh>
    </group>
  )
}
