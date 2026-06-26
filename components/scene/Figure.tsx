'use client'

// NEW SHARED FILE — components/scene/Figure.tsx
// Refined low-poly attendee/person to replace the box-figures.
// Tapered torso, shoulders, neck, head + hair, angled arms, legs + shoes.
// Used by OralTheater (speaker) and IndustryFair (recruiter).

import { useMemo } from 'react'
import * as THREE from 'three'

interface FigureProps {
  position: [number, number, number]
  shirt: string
  pants: string
  skin: string
  rotationY?: number
}

export function Figure({ position, shirt, pants, skin, rotationY = 0 }: FigureProps) {
  const mats = useMemo(() => ({
    shirt: new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.85 }),
    pants: new THREE.MeshStandardMaterial({ color: pants, roughness: 0.85 }),
    skin: new THREE.MeshStandardMaterial({ color: skin, roughness: 0.7 }),
    hair: new THREE.MeshStandardMaterial({ color: '#2b211a', roughness: 0.9 }),
    shoe: new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.5 }),
  }), [shirt, pants, skin])

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[1.5, 1.5, 1.5]}>
      {/* Torso (tapered) */}
      <mesh position={[0, 1.12, 0]} castShadow material={mats.shirt}><cylinderGeometry args={[0.2, 0.26, 0.72, 12]} /></mesh>
      {/* Shoulders */}
      <mesh position={[0, 1.42, 0]} scale={[1, 0.5, 0.7]} castShadow material={mats.shirt}><sphereGeometry args={[0.27, 12, 8]} /></mesh>
      {/* Neck + head */}
      <mesh position={[0, 1.56, 0]} material={mats.skin}><cylinderGeometry args={[0.07, 0.08, 0.1, 8]} /></mesh>
      <mesh position={[0, 1.72, 0]} castShadow material={mats.skin}><sphereGeometry args={[0.16, 16, 12]} /></mesh>
      <mesh position={[0, 1.74, 0]} material={mats.hair}><sphereGeometry args={[0.165, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} /></mesh>
      {/* Arms */}
      <mesh position={[-0.3, 1.12, 0.02]} rotation={[0, 0, 0.08]} castShadow material={mats.shirt}><cylinderGeometry args={[0.06, 0.07, 0.66, 8]} /></mesh>
      <mesh position={[0.3, 1.12, 0.02]} rotation={[0, 0, -0.08]} castShadow material={mats.shirt}><cylinderGeometry args={[0.06, 0.07, 0.66, 8]} /></mesh>
      {/* Legs + shoes */}
      {[-0.1, 0.1].map((lx) => (
        <group key={lx}>
          <mesh position={[lx, 0.38, 0]} castShadow material={mats.pants}><cylinderGeometry args={[0.08, 0.09, 0.76, 8]} /></mesh>
          <mesh position={[lx, 0.04, 0.04]} castShadow material={mats.shoe}><boxGeometry args={[0.14, 0.08, 0.26]} /></mesh>
        </group>
      ))}
    </group>
  )
}
