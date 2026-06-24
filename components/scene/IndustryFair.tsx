'use client'

import { Html } from '@react-three/drei'
import type { BoothData } from '@/lib/types'

interface Props {
  booth: BoothData
}

const AMAZON_ORANGE = '#ff9900'
const AMAZON_DARK = '#232f3e'

export function IndustryFair({ booth }: Props) {
  return (
    <group>
      {/* Booth back wall */}
      <mesh position={[20, 3, -18]}>
        <boxGeometry args={[14, 6, 0.3]} />
        <meshStandardMaterial color={AMAZON_DARK} />
      </mesh>

      {/* Orange top stripe */}
      <mesh position={[20, 5.7, -17.8]}>
        <boxGeometry args={[14, 0.8, 0.1]} />
        <meshStandardMaterial color={AMAZON_ORANGE} />
      </mesh>

      {/* Amazon logo text on wall */}
      <Html position={[20, 3.2, -17.5]} center transform scale={0.025}>
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          color: AMAZON_ORANGE,
          fontSize: '40px',
          fontWeight: '900',
          letterSpacing: '-1px',
          pointerEvents: 'none',
        }}>
          amazon
        </div>
      </Html>

      {/* Tagline */}
      <Html position={[20, 1.8, -17.5]} center transform scale={0.015}>
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          color: '#adb5bd',
          fontSize: '22px',
          fontWeight: '400',
          pointerEvents: 'none',
          textAlign: 'center',
          maxWidth: '480px',
        }}>
          {booth.tagline}
        </div>
      </Html>

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
      <Html position={[22, 1.1, -13.1]} center transform scale={0.01}>
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          pointerEvents: 'none',
          background: AMAZON_ORANGE,
          padding: '4px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
        }}>
          We&apos;re Hiring!
        </div>
      </Html>

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
        <Html position={[0, 1.0, 0.12]} center transform scale={0.008}>
          <div style={{ fontSize: '18px', fontFamily: 'sans-serif', background: 'white', padding: '2px 6px', borderRadius: '3px', color: '#111', fontWeight: 'bold', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {booth.recruiterName}
          </div>
        </Html>
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
        <meshStandardMaterial color={AMAZON_DARK} />
      </mesh>
      <Html position={[27, 3, -13.95]} center transform scale={0.009}>
        <div style={{ width: '160px', textAlign: 'center', fontFamily: 'sans-serif', color: AMAZON_ORANGE, fontSize: '14px', fontWeight: 'bold', lineHeight: '1.4', pointerEvents: 'none' }}>
          Amazon<br />
          <span style={{ fontSize: '10px', color: '#aaa', fontWeight: 'normal' }}>Computer Vision &amp;<br />Rekognition</span>
        </div>
      </Html>
    </group>
  )
}
