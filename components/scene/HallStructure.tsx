'use client'

import { Html } from '@react-three/drei'

const FLOOR_MAT = { color: '#c8cdd8', roughness: 0.9, metalness: 0 }
const WALL_MAT = { color: '#e8eaef', roughness: 0.95, metalness: 0 }
const CEILING_MAT = { color: '#d0d4de', roughness: 0.9, metalness: 0 }
const PILLAR_MAT = { color: '#1a2b4a', roughness: 0.6, metalness: 0.1 }

// Carpet zones
const POSTER_CARPET = { color: '#dce8ff', roughness: 0.9, metalness: 0 }
const ORAL_CARPET = { color: '#ffdede', roughness: 0.9, metalness: 0 }
const FAIR_CARPET = { color: '#fff3dc', roughness: 0.9, metalness: 0 }

export function HallStructure() {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial {...FLOOR_MAT} />
      </mesh>

      {/* Zone carpets */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-18, 0.01, -5]}>
        <planeGeometry args={[24, 30]} />
        <meshStandardMaterial {...POSTER_CARPET} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0.01, -5]}>
        <planeGeometry args={[14, 30]} />
        <meshStandardMaterial {...ORAL_CARPET} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[19, 0.01, -5]}>
        <planeGeometry args={[22, 30]} />
        <meshStandardMaterial {...FAIR_CARPET} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial {...CEILING_MAT} />
      </mesh>

      {/* North wall */}
      <mesh position={[0, 3.5, -20]}>
        <boxGeometry args={[60, 7, 0.3]} />
        <meshStandardMaterial {...WALL_MAT} />
      </mesh>

      {/* South wall */}
      <mesh position={[0, 3.5, 20]}>
        <boxGeometry args={[60, 7, 0.3]} />
        <meshStandardMaterial {...WALL_MAT} />
      </mesh>

      {/* East wall */}
      <mesh position={[30, 3.5, 0]}>
        <boxGeometry args={[0.3, 7, 40]} />
        <meshStandardMaterial {...WALL_MAT} />
      </mesh>

      {/* West wall */}
      <mesh position={[-30, 3.5, 0]}>
        <boxGeometry args={[0.3, 7, 40]} />
        <meshStandardMaterial {...WALL_MAT} />
      </mesh>

      {/* Zone separator pillars */}
      {[-7, 9].map((x) =>
        [-18, -10, -2, 6, 14].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 3.5, z]}>
            <boxGeometry args={[0.6, 7, 0.6]} />
            <meshStandardMaterial {...PILLAR_MAT} />
          </mesh>
        ))
      )}

      {/* Zone banners on north wall */}
      <ZoneBanner position={[-18, 5.5, -19.5]} text="POSTER SESSION" color="#1a2b4a" />
      <ZoneBanner position={[1, 5.5, -19.5]} text="ORAL PRESENTATIONS" color="#8b1a1a" />
      <ZoneBanner position={[19, 5.5, -19.5]} text="INDUSTRY FAIR" color="#663300" />

      {/* CVPR 2026 banner above entrance */}
      <mesh position={[0, 6, 19.5]}>
        <boxGeometry args={[20, 1.2, 0.1]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <Html position={[0, 6, 19.4]} center transform>
        <div style={{ color: 'white', fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '18px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          CVPR 2026
        </div>
      </Html>

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
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[12, 0.8, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html center transform>
        <div style={{ color: 'white', fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          {text}
        </div>
      </Html>
    </group>
  )
}
