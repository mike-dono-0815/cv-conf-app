'use client'

import { Html } from '@react-three/drei'
import type { Paper } from '@/lib/types'

interface Props {
  papers: Paper[]
}

// Board positions: 3 in back row (z=-12), 2 in front row (z=-6)
const POSITIONS: [number, number, number][] = [
  [-26, 2, -12],
  [-20, 2, -12],
  [-14, 2, -12],
  [-23, 2, -6],
  [-17, 2, -6],
]

const EASEL_COLOR = '#2c3e50'
const BOARD_COLOR = '#ffffff'

export function PosterHall({ papers }: Props) {
  return (
    <group>
      {papers.map((paper, i) => (
        <PosterBoard
          key={paper.id}
          paper={paper}
          position={POSITIONS[i]}
        />
      ))}
    </group>
  )
}

function PosterBoard({ paper, position }: { paper: Paper; position: [number, number, number] }) {
  const [x, y, z] = position
  const accent = paper.accentColor ?? '#1a2b4a'

  return (
    <group position={[x, 0, z]}>
      {/* Easel legs */}
      <mesh position={[-0.5, 1, 0.3]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.06, 2, 0.06]} />
        <meshStandardMaterial color={EASEL_COLOR} />
      </mesh>
      <mesh position={[0.5, 1, 0.3]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.06, 2, 0.06]} />
        <meshStandardMaterial color={EASEL_COLOR} />
      </mesh>
      <mesh position={[0, 1, -0.2]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.06, 2.2, 0.06]} />
        <meshStandardMaterial color={EASEL_COLOR} />
      </mesh>

      {/* Poster board background */}
      <mesh position={[0, y, 0]}>
        <boxGeometry args={[2.6, 3.6, 0.06]} />
        <meshStandardMaterial color={BOARD_COLOR} />
      </mesh>

      {/* Accent strip at top */}
      <mesh position={[0, y + 1.6, 0.04]}>
        <boxGeometry args={[2.6, 0.35, 0.02]} />
        <meshStandardMaterial color={accent} />
      </mesh>

      {/* Highlight ribbon if applicable */}
      {paper.highlighted && (
        <mesh position={[0.95, y + 1.45, 0.06]}>
          <boxGeometry args={[0.65, 0.2, 0.02]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      )}

      {/* HTML content on board */}
      <Html position={[0, y, 0.1]} center transform scale={0.018}>
        <div
          style={{
            width: '140px',
            height: '196px',
            fontFamily: 'system-ui, sans-serif',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: '4px 6px 6px',
            gap: '4px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {/* Title area */}
          <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: '4px' }}>
            {paper.highlighted && (
              <div style={{ fontSize: '6px', color: '#f59e0b', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '2px' }}>
                ★ HIGHLIGHT
              </div>
            )}
            <div style={{ fontSize: '8px', fontWeight: '700', color: '#111', lineHeight: '1.2' }}>
              {paper.shortTitle}
            </div>
          </div>

          {/* Authors */}
          <div style={{ fontSize: '6px', color: '#555' }}>
            {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}
          </div>

          {/* Abstract snippet */}
          <div style={{ fontSize: '6px', color: '#333', lineHeight: '1.4', flex: 1, overflow: 'hidden' }}>
            {paper.abstract.slice(0, 240)}…
          </div>

          {/* Session */}
          <div style={{ fontSize: '5.5px', color: '#888', borderTop: '1px solid #eee', paddingTop: '3px' }}>
            {paper.session.split('|')[0].trim()}
          </div>
        </div>
      </Html>
    </group>
  )
}
