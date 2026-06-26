'use client'

import { useRef, useEffect, MutableRefObject } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Interactable } from '@/lib/types'

interface Props {
  interactables: Interactable[]
  onNearby: (label: string | null) => void
  onInteract: (item: Interactable) => void
  onZoneChange: (zone: string) => void
  onLockChange: (locked: boolean) => void
  controlsRef: MutableRefObject<{ unlock: () => void } | null>
  disabled: boolean
}

const SPEED = 8
const INTERACTION_RADIUS = 4
const HALL_X = [-29, 29] as const
const HALL_Z = [-19, 23] as const

// [centerX, centerZ, halfW, halfD] — object half-extents + 0.4 player clearance radius
const OBSTACLE_AABBS: [number, number, number, number][] = [
  [-10,  14,   2.4, 0.9],   // registration desk
  [-29.3, 10,  0.9, 1.9],   // catering table (poster hall, against west wall)
  [ 27,  12,   1.9, 0.9],   // catering table (industry fair)
  [ 20, -13,   5.4, 1.05],  // industry fair counter
  // Poster boards — row 1 (z=6)
  [-27,   6,   1.7, 0.9],
  [-23,   6,   1.7, 0.9],
  [-19,   6,   1.7, 0.9],
  [-15,   6,   1.7, 0.9],
  [-11,   6,   1.7, 0.9],
  // Poster boards — row 2 (z=-1)
  [-26,  -1,   1.7, 0.9],
  [-21,  -1,   1.7, 0.9],
  [-16,  -1,   1.7, 0.9],
  [-11,  -1,   1.7, 0.9],
  // Poster boards — row 3 (z=-8)
  [-26,  -8,   1.7, 0.9],
  [-21,  -8,   1.7, 0.9],
  [-16,  -8,   1.7, 0.9],
  [-11,  -8,   1.7, 0.9],
  [  1,  -8,   4.9, 5.25],  // oral theater seating platform (rows z=-4 to -12, width 9 centered at x=1)
  [  1, -15.5, 6.9, 2.4],   // oral theater stage
]

function hitsObstacle(x: number, z: number): boolean {
  for (const [cx, cz, hw, hd] of OBSTACLE_AABBS) {
    if (Math.abs(x - cx) < hw && Math.abs(z - cz) < hd) return true
  }
  return false
}

function getZone(x: number): string {
  if (x < -6) return 'Poster Hall'
  if (x > 8) return 'Industry Fair'
  return 'Oral Theater'
}

export function FirstPersonPlayer({
  interactables,
  onNearby,
  onInteract,
  onZoneChange,
  onLockChange,
  controlsRef,
  disabled,
}: Props) {
  const { camera, gl } = useThree()
  const keys = useRef({ w: false, a: false, s: false, d: false })
  const nearbyRef = useRef<Interactable | null>(null)
  const lockedRef = useRef(false)
  const lastZone = useRef('')
  const controls = useRef<any>(null)

  useEffect(() => {
    camera.position.set(0, 1.7, 22)
    camera.lookAt(0, 1.7, 0)
  }, [camera])

  // In chat/interaction mode: block canvas clicks so PointerLockControls cannot re-acquire lock
  useEffect(() => {
    if (!disabled) return
    controls.current?.unlock()
    const block = (e: MouseEvent) => e.stopImmediatePropagation()
    gl.domElement.addEventListener('click', block, true)
    return () => gl.domElement.removeEventListener('click', block, true)
  }, [disabled, gl.domElement])

  useEffect(() => {
    if (controls.current) {
      controlsRef.current = { unlock: () => controls.current?.unlock() }
    }
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = true
      if (e.code === 'KeyA') keys.current.a = true
      if (e.code === 'KeyS') keys.current.s = true
      if (e.code === 'KeyD') keys.current.d = true
      if (e.code === 'KeyE' && !disabled && nearbyRef.current && lockedRef.current) {
        e.preventDefault()
        onInteract(nearbyRef.current)
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = false
      if (e.code === 'KeyA') keys.current.a = false
      if (e.code === 'KeyS') keys.current.s = false
      if (e.code === 'KeyD') keys.current.d = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [disabled, onInteract])

  useFrame((_, delta) => {
    if (!lockedRef.current || disabled) return

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0))

    const move = new THREE.Vector3()
    if (keys.current.w) move.addScaledVector(forward, 1)
    if (keys.current.s) move.addScaledVector(forward, -1)
    if (keys.current.a) move.addScaledVector(right, -1)
    if (keys.current.d) move.addScaledVector(right, 1)

    const prevX = camera.position.x
    const prevZ = camera.position.z

    if (move.length() > 0) {
      move.normalize().multiplyScalar(SPEED * delta)
      camera.position.add(move)
    }

    camera.position.y = 1.7
    camera.position.x = Math.max(HALL_X[0], Math.min(HALL_X[1], camera.position.x))
    camera.position.z = Math.max(HALL_Z[0], Math.min(HALL_Z[1], camera.position.z))

    // Separator wall collision — walls at x=-7 and x=9, solid from z=-18.3 to z=14.3
    // Gap at z > 14.3 (south end, near player start) lets players through to each zone
    if (camera.position.z > -18.3 && camera.position.z < 14.3) {
      for (const wx of [-7, 9] as const) {
        if (Math.abs(camera.position.x - wx) < 0.7) {
          camera.position.x = wx + (prevX <= wx ? -1 : 1) * 0.7
        }
      }
    }

    // Obstacle AABB collision — axis-separated so the player slides along surfaces
    if (hitsObstacle(camera.position.x, prevZ)) camera.position.x = prevX
    if (hitsObstacle(camera.position.x, camera.position.z)) camera.position.z = prevZ

    // Zone detection
    const zone = getZone(camera.position.x)
    if (zone !== lastZone.current) {
      lastZone.current = zone
      onZoneChange(zone)
    }

    // Proximity to interactables
    let closest: Interactable | null = null
    let closestDist = Infinity

    for (const item of interactables) {
      const dx = camera.position.x - item.position[0]
      const dz = camera.position.z - item.position[2]
      const dist = Math.sqrt(dx * dx + dz * dz)
      const radius = item.radius ?? INTERACTION_RADIUS
      if (dist < radius && dist < closestDist) {
        closest = item
        closestDist = dist
      }
    }

    if (closest !== nearbyRef.current) {
      nearbyRef.current = closest
      onNearby(closest?.label ?? null)
    }
  })

  return (
    <PointerLockControls
      ref={controls}
      onLock={() => {
        lockedRef.current = true
        onLockChange(true)
      }}
      onUnlock={() => {
        lockedRef.current = false
        onLockChange(false)
        keys.current = { w: false, a: false, s: false, d: false }
      }}
    />
  )
}
