'use client'

// ============================================================================
//  SectionalNook.tsx — conference-venue lounge grouping for React-Three-Fiber
//  L-sectional sofa · two poufs · rectangular coffee table · rug · table decor
//  Ported verbatim from the "Lounge Gallery" preview.
//
//  Whole grouping is built imperatively as a THREE.Group and rendered through
//  <primitive>, so it matches the preview exactly without hand-converting every
//  cushion to JSX.
//
//  Usage:
//    import { SectionalNook } from './SectionalNook'
//    <SectionalNook position={[18, 0, 14]} rotationY={Math.PI} />
//
//  The grouping's base sits at local y = 0 (floor). Footprint ≈ 4.6 × 4.0 m
//  (the rug). Everything casts & receives shadows — your scene's key light is
//  the shadow caster.
// ============================================================================

import { useMemo } from 'react'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
//  geometry helpers
// ---------------------------------------------------------------------------

// chamfered rounded box (cushions, arms, rug)
function roundedBox(w: number, h: number, d: number, r: number, mat: THREE.Material): THREE.Mesh {
  r = Math.min(r, h / 2, w / 2, d / 2)
  const shape = new THREE.Shape()
  const x = -w / 2, y = -h / 2
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r)
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - r * 2, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, steps: 1,
  })
  geo.translate(0, 0, -(d - r * 2) / 2)
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, mat)
  m.castShadow = true; m.receiveShadow = true
  return m
}

// upholstered sofa with `seats` seat cushions
function sofa(seats: number, fabric: string, opts: any = {}): THREE.Group {
  const g = new THREE.Group()
  const seatW = opts.seatW || 0.78
  const depth = opts.depth || 0.95
  const seatH = opts.seatH || 0.42
  const W = seats * seatW + 0.24
  const fab = new THREE.MeshStandardMaterial({ color: fabric, roughness: 0.92, metalness: 0 })
  const legMat = new THREE.MeshStandardMaterial({ color: opts.leg || '#3a2c22', roughness: 0.5, metalness: 0.3 })
  const radius = opts.radius != null ? opts.radius : 0.08
  const innerW = seats * seatW

  const base = roundedBox(W, 0.22, depth, 0.06, fab); base.position.set(0, seatH - 0.18, 0); g.add(base)
  for (let i = 0; i < seats; i++) {
    const cx = -innerW / 2 + seatW / 2 + i * seatW
    const cush = roundedBox(seatW - 0.06, 0.18, depth - 0.18, radius, fab)
    cush.position.set(cx, seatH, 0.02); g.add(cush)
    const back = roundedBox(seatW - 0.06, 0.5, 0.2, radius, fab)
    back.position.set(cx, seatH + 0.34, -depth / 2 + 0.14); back.rotation.x = -0.12; g.add(back)
  }
  ;[-1, 1].forEach((s) => {
    const arm = roundedBox(0.18, 0.5, depth, 0.08, fab)
    arm.position.set(s * (innerW / 2 + 0.06), seatH + 0.12, 0); g.add(arm)
  })
  const backPanel = roundedBox(W, 0.62, 0.16, 0.08, fab)
  backPanel.position.set(0, seatH + 0.42, -depth / 2 + 0.04); g.add(backPanel)
  const legH = seatH - 0.2
  ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, legH, 10), legMat)
    leg.position.set(sx * (W / 2 - 0.14), legH / 2, sz * (depth / 2 - 0.14)); leg.castShadow = true; g.add(leg)
  })
  return g
}

// pouf / ottoman
function pouf(fabric: string, r = 0.42): THREE.Group {
  const g = new THREE.Group()
  const fab = new THREE.MeshStandardMaterial({ color: fabric, roughness: 0.95 })
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.94, 0.4, 20), fab)
  body.position.y = 0.2; body.castShadow = true; body.receiveShadow = true; g.add(body)
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, 0.02, 20), fab)
  top.position.y = 0.41; g.add(top)
  return g
}

// coffee table (round or rectangular) with metal frame legs + lower shelf
function coffeeTable(opts: any = {}): THREE.Group {
  const g = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: opts.wood || '#7a5a3a', roughness: 0.6 })
  const metalMat = new THREE.MeshStandardMaterial({ color: '#5a5e63', roughness: 0.3, metalness: 0.85 })
  const r = opts.r || 0.5, h = opts.h || 0.42
  const w = opts.w || 1.2, d = opts.d || 0.7
  const top = new THREE.Mesh(
    opts.rect ? new THREE.BoxGeometry(w, 0.06, d) : new THREE.CylinderGeometry(r, r, 0.06, 28),
    woodMat,
  )
  top.position.y = h; top.castShadow = true; top.receiveShadow = true; g.add(top)
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2
    const lx = opts.rect ? (i % 2 ? 1 : -1) * (w / 2 - 0.12) : Math.cos(a) * (r - 0.1)
    const lz = opts.rect ? (i < 2 ? 1 : -1) * (d / 2 - 0.12) : Math.sin(a) * (r - 0.1)
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, h, 8), metalMat)
    leg.position.set(lx, h / 2, lz); leg.castShadow = true; g.add(leg)
  }
  const shelf = new THREE.Mesh(
    opts.rect ? new THREE.BoxGeometry(w * 0.8, 0.03, d * 0.8) : new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.03, 24),
    woodMat,
  )
  shelf.position.y = 0.14; shelf.castShadow = true; g.add(shelf)
  return g
}

// rug (thin rounded mat)
function rug(w: number, d: number, color: string): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 1 })
  const m = roundedBox(w, 0.03, d, 0.2, mat)
  m.position.y = 0.015; m.receiveShadow = true
  return m
}

// books + vase set
function tableDecor(x: number, z: number, accent: string): THREE.Group {
  const g = new THREE.Group(); g.position.set(x, 0, z)
  const cols = ['#b15a36', '#2c3349', '#6a2b30']
  for (let i = 0; i < 3; i++) {
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.28 - i * 0.02, 0.04, 0.2), new THREE.MeshStandardMaterial({ color: cols[i], roughness: 0.7 }))
    bk.position.set(0, 0.45 + 0.04 + i * 0.045, 0); bk.rotation.y = i * 0.15; bk.castShadow = true; g.add(bk)
  }
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.18, 12), new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4, metalness: 0.2 }))
  vase.position.set(0.22, 0.45 + 0.09, 0.05); vase.castShadow = true; g.add(vase)
  return g
}

// ---------------------------------------------------------------------------
//  the grouping
// ---------------------------------------------------------------------------
function buildSectionalNook(): THREE.Group {
  const g = new THREE.Group()
  g.add(rug(4.6, 4.0, '#4a5a52'))
  // L-sectional = a 3-seat sofa + a 2-seat return rotated 90°
  const main = sofa(3, '#6a5240'); main.position.set(0.2, 0, -1.5); g.add(main)
  const ret = sofa(2, '#6a5240'); ret.rotation.y = Math.PI / 2; ret.position.set(-1.95, 0, -0.2); g.add(ret)
  const t = coffeeTable({ rect: true, w: 1.3, d: 0.75, wood: '#3a2c22' }); t.position.set(0.1, 0, 0.1); g.add(t)
  g.add(tableDecor(-0.2, 0.1, '#5a8a6a'))
  const p1 = pouf('#c98a3a', 0.4); p1.position.set(1.5, 0, 0.6); g.add(p1)
  const p2 = pouf('#b8742f', 0.36); p2.position.set(1.4, 0, -0.3); g.add(p2)
  return g
}

// ---------------------------------------------------------------------------
//  React component
// ---------------------------------------------------------------------------
export interface SectionalNookProps {
  position?: [number, number, number]
  rotationY?: number
  scale?: number
}

export function SectionalNook({ position = [0, 0, 0], rotationY = 0, scale = 1 }: SectionalNookProps) {
  const group = useMemo(() => buildSectionalNook(), [])
  return <primitive object={group} position={position} rotation={[0, rotationY, 0]} scale={scale} />
}
