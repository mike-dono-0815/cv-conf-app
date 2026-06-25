'use client'

import { Html } from '@react-three/drei'
import type { Paper } from '@/lib/types'

interface Props {
  oral: Paper
}

const SEAT_COLOR = '#c0392b'
const SCREEN_COLOR = '#0a0a14'
const PODIUM_COLOR = '#1a2b4a'

const SEAT_POSITIONS: [number, number, number][] = [
  // Front row (z=-4)
  [-3.4, 0, -4], [-1.7, 0, -4], [0, 0, -4], [1.7, 0, -4], [3.4, 0, -4],
  // Back row (z=-6)
  [-3.4, 0, -6], [-1.7, 0, -6], [0, 0, -6], [1.7, 0, -6], [3.4, 0, -6],
]

export function OralTheater({ oral }: Props) {
  return (
    <group>
      {/* Big screen */}
      <mesh position={[1, 3.5, -18]}>
        <boxGeometry args={[9, 5.5, 0.15]} />
        <meshStandardMaterial color={SCREEN_COLOR} />
      </mesh>

      {/* Screen emissive frame */}
      <mesh position={[1, 3.5, -17.9]}>
        <boxGeometry args={[8.6, 5.1, 0.05]} />
        <meshStandardMaterial color="#0d1535" emissive="#0d1535" emissiveIntensity={1} />
      </mesh>

      {/* Screen content */}
      <Html position={[1, 3.5, -17.7]} center transform scale={0.022}>
        <div
          style={{
            width: '380px',
            height: '225px',
            background: 'linear-gradient(135deg, #0d1535 0%, #1a2550 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '20px',
            fontFamily: 'system-ui, sans-serif',
            color: 'white',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '8px', color: '#f59e0b', letterSpacing: '2px', fontWeight: 'bold' }}>
            ★ CVPR 2026 HIGHLIGHT PAPER
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', textAlign: 'center', lineHeight: '1.3' }}>
            {oral.title}
          </div>
          <div style={{ fontSize: '9px', color: '#a0b4d0' }}>
            {oral.authors[0]} et al.
          </div>
          <div style={{ fontSize: '7px', color: '#5a7a9a', textAlign: 'center', lineHeight: '1.4', marginTop: '4px' }}>
            {oral.abstract.slice(0, 120)}…
          </div>
          <div style={{ fontSize: '7px', color: '#c0392b', marginTop: '4px' }}>
            Walk to the front row and press E to attend the talk
          </div>
        </div>
      </Html>

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
