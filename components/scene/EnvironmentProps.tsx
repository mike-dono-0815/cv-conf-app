'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Plant, PlantType } from './Plants'

const GOLD = '#c9a14a'
const BIN_GREEN = '#2b6b3f'
const BIN_BLUE = '#2456a6'

type PlantSpec = { t: PlantType; p: [number, number, number]; ry?: number; s?: number }
const PLANTS: PlantSpec[] = [
  // Corners — tall statement pieces
  { t: 'fiddleLeafFig', p: [-29, 0,  23], ry: 0.8 },
  { t: 'arecaPalm',     p: [ 29, 0,  23], ry: -0.5 },
  { t: 'arecaPalm',     p: [-29, 0, -19], ry: 0.3 },
  { t: 'fiddleLeafFig', p: [ 29, 0, -19], ry: -0.8 },
  // West wall — poster hall
  { t: 'bostonFern',    p: [-29, 0,   8], ry: 0.4 },
  { t: 'monstera',      p: [-29, 0,  -2], ry: 0.5 },
  { t: 'snakePlant',    p: [-29, 0, -12], ry: 1.0 },
  // East wall — industry fair
  { t: 'bamboo',        p: [ 29, 0,   8], ry: -0.4 },
  { t: 'topiaryBall',   p: [ 29, 0,  -2] },
  { t: 'bostonFern',    p: [ 29, 0, -12], ry: 0.6 },
  // North wall
  { t: 'snakePlant',    p: [-21, 0, -19], ry: 2.0 },
  { t: 'bamboo',        p: [ 20, 0, -19], ry: -1.0 },
  // South lobby
  { t: 'monstera',      p: [-16, 0,  23], ry: 1.5 },
  { t: 'topiaryBall',   p: [ 22, 0,  23] },
  // Catering tables — small potted plants
  { t: 'bostonFern',    p: [-29.3, 0.93, 10], s: 0.38 },
  { t: 'topiaryBall',   p: [ 27, 0.93, 12], s: 0.38 },
]

// [x, z, color] — green recycling + blue trash in pairs.
// Signs occupy x:−9.75..−4.25, −1.75..3.75, 6.25..11.75 at z≈15–17, so all bin z values
// are ≤9 or ≥18, and no x values fall inside those ranges at those z bands.
const BIN_POSITIONS: [number, number, string][] = [
  // West wall — poster hall (z=6 pair moved south of catering table to avoid overlapping poster board)
  [-29.2, 12.5, BIN_GREEN], [-28.4, 12.5, BIN_BLUE],
  [-29.2, -8, BIN_GREEN], [-28.4, -8, BIN_BLUE],
  // West wall — far north pair
  [-29.2, -16, BIN_GREEN], [-28.4, -16, BIN_BLUE],
  // East wall — industry fair, two pairs
  [28.4, 6, BIN_GREEN], [29.2, 6, BIN_BLUE],
  [28.4, -8, BIN_GREEN], [29.2, -8, BIN_BLUE],
  // East wall — far north pair
  [28.4, -16, BIN_GREEN], [29.2, -16, BIN_BLUE],
  // North wall — poster area
  [-22, -18.5, BIN_GREEN], [-21.2, -18.5, BIN_BLUE],
  // North wall — industry area
  [21, -18.5, BIN_GREEN], [21.8, -18.5, BIN_BLUE],
  // Zone-separator side, poster entrance (z=9 clears signs at z≈15–17)
  [-8.5, 9, BIN_GREEN], [-7.7, 9, BIN_BLUE],
  // Zone-separator side, industry entrance
  [10.2, 9, BIN_GREEN], [11.0, 9, BIN_BLUE],
  // South lobby — near registration desk, against south wall
  [-15, 22.5, BIN_GREEN], [-14.2, 22.5, BIN_BLUE],
]

// [x, z] — against walls or near high-traffic areas
const COOLER_POSITIONS: [number, number][] = [
  [-29.3, 2],   // poster hall, west wall mid
  [-29.3, -14], // poster hall, west wall north
  [29.3, 2],    // industry fair, east wall
  [-12.5, 13],  // lobby, beside registration desk
]

export function EnvironmentProps() {
  const mats = useMemo(() => ({
    metal: new THREE.MeshStandardMaterial({ color: '#6f7378', roughness: 0.35, metalness: 0.85 }),
    deskBody: new THREE.MeshStandardMaterial({ color: '#2a3350', roughness: 0.6 }),
    gold: new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.4, metalness: 0.6 }),
    white: new THREE.MeshStandardMaterial({ color: '#f3f1ea', roughness: 0.9 }),
    coolerBody: new THREE.MeshStandardMaterial({ color: '#e8eaec', roughness: 0.4 }),
    water: new THREE.MeshStandardMaterial({ color: '#9fd4f0', transparent: true, opacity: 0.55, roughness: 0.1 }),
    belt: new THREE.MeshStandardMaterial({ color: '#7a2c34', roughness: 0.8 }),
    binDark: new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.5 }),
  }), [])

  const regTex = useMemo(() => {
    const W = 512, H = 120, c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#26304a'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 52px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('REGISTRATION', W / 2, H / 2)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }, [])

  return (
    <group>
      {/* Plants — corners, walls, and catering tables */}
      {PLANTS.map((p, i) => (
        <Plant key={`pl${i}`} type={p.t} position={p.p} rotationY={p.ry ?? 0} scale={p.s ?? 1} />
      ))}

      {/* Bins — green recycling + blue trash in pairs */}
      {BIN_POSITIONS.map(([x, z, color], i) => (
        <Bin key={`bin${i}`} x={x} z={z} color={color} mats={mats} />
      ))}

      {/* Entrance lane: stanchions + belts */}
      {([[-2.6, 14], [-2.6, 10], [2.6, 14], [2.6, 10]] as const).map(([x, z], i) => (
        <Stanchion key={`st${i}`} x={x} z={z} mats={mats} />
      ))}
      <Belt x1={-2.6} z1={14} x2={-2.6} z2={10} mats={mats} />
      <Belt x1={2.6} z1={14} x2={2.6} z2={10} mats={mats} />

      {/* Registration desk — aligned with end of zone-separator walls (z=14) */}
      <group position={[-10, 0, 14]}>
        <mesh position={[0, 0.52, 0]} castShadow receiveShadow material={mats.deskBody}><boxGeometry args={[4, 1.05, 1]} /></mesh>
        <mesh position={[0, 1.06, 0]} material={mats.gold}><boxGeometry args={[4.2, 0.1, 1.2]} /></mesh>
        <mesh position={[0, 2.2, -0.4]}><planeGeometry args={[3.4, 0.8]} /><meshStandardMaterial map={regTex} /></mesh>
        <mesh position={[0, 2.2, -0.41]} rotation={[0, Math.PI, 0]}><planeGeometry args={[3.4, 0.8]} /><meshStandardMaterial color="#26304a" roughness={0.9} /></mesh>
        {[-1.6, 1.6].map((dx) => (
          <mesh key={dx} position={[dx, 1.65, -0.3]} material={mats.metal}><boxGeometry args={[0.06, 1.2, 0.06]} /></mesh>
        ))}
      </group>

      {/* Water coolers */}
      {COOLER_POSITIONS.map(([x, z], i) => (
        <Cooler key={`co${i}`} x={x} z={z} mats={mats} />
      ))}

      {/* Catering tables — poster hall break area + industry fair break area */}
      <CateringTable x={-29.3} z={10} rotY={Math.PI / 2} mats={mats} />
      <CateringTable x={27} z={12} mats={mats} />
    </group>
  )
}


function Bin({ x, z, color, mats }: { x: number; z: number; color: string; mats: any }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.22, 0.8, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.82, 0]} material={mats.binDark}><cylinderGeometry args={[0.28, 0.28, 0.08, 16]} /></mesh>
    </group>
  )
}

function Stanchion({ x, z, mats }: { x: number; z: number; mats: any }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.03, 0]} castShadow material={mats.metal}><cylinderGeometry args={[0.22, 0.26, 0.06, 16]} /></mesh>
      <mesh position={[0, 0.53, 0]} castShadow material={mats.metal}><cylinderGeometry args={[0.04, 0.04, 1.0, 12]} /></mesh>
      <mesh position={[0, 1.04, 0]} material={mats.metal}><sphereGeometry args={[0.06, 12, 8]} /></mesh>
    </group>
  )
}

function Belt({ x1, z1, x2, z2, mats }: { x1: number; z1: number; x2: number; z2: number; mats: any }) {
  const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz)
  return (
    <mesh position={[(x1 + x2) / 2, 0.9, (z1 + z2) / 2]} rotation={[0, Math.atan2(-dz, dx), 0]} material={mats.belt}>
      <boxGeometry args={[len, 0.05, 0.02]} />
    </mesh>
  )
}

function Cooler({ x, z, mats }: { x: number; z: number; mats: any }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={mats.coolerBody}><boxGeometry args={[0.45, 1.0, 0.45]} /></mesh>
      <mesh position={[0, 1.25, 0]} material={mats.water}><cylinderGeometry args={[0.2, 0.22, 0.5, 16]} /></mesh>
    </group>
  )
}

function CateringTable({ x, z, rotY = 0, mats }: { x: number; z: number; rotY?: number; mats: any }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow material={mats.white}><boxGeometry args={[3, 0.06, 1]} /></mesh>
      {([[-1.4, -0.4], [1.4, -0.4], [-1.4, 0.4], [1.4, 0.4]] as const).map(([dx, dz], i) => (
        <mesh key={i} position={[dx, 0.45, dz]} castShadow material={mats.metal}><boxGeometry args={[0.08, 0.9, 0.08]} /></mesh>
      ))}
      {[-0.8, 0.8].map((dx) => (
        <mesh key={dx} position={[dx, 1.15, 0]} castShadow material={mats.metal}><cylinderGeometry args={[0.18, 0.2, 0.5, 16]} /></mesh>
      ))}
    </group>
  )
}
