'use client'

// ============================================================================
//  Plants.tsx  —  7 procedural plant models for the conference scene
//  Snake Plant · Boston Fern · Monstera · Fiddle-Leaf Fig · Topiary Ball ·
//  Areca Palm · Bamboo
//
//  Each plant is built imperatively as a THREE.Group (ported verbatim from the
//  "Plant Gallery" preview) and rendered through <primitive>. This keeps the
//  exact look without hand-converting hundreds of meshes to JSX.
//
//  Usage:
//    import { Plant } from './Plants'
//    <Plant type="monstera" position={[9, 0, 18]} />
//    <Plant type="bamboo"  position={[-7, 0, 18]} rotationY={0.5} scale={1.1} />
//
//  Or import a single component directly:
//    import { Monstera } from './Plants'
//    <Monstera position={[9, 0, 18]} />
//
//  Base of every plant sits at local y = 0, so just give it the floor position.
//  All meshes cast/receive shadows (your scene's key light is the shadow caster).
// ============================================================================

import { useMemo } from 'react'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
//  shared helpers
// ---------------------------------------------------------------------------
const rand = (a: number, b: number) => a + Math.random() * (b - a)

const M = {
  terracotta: () => new THREE.MeshStandardMaterial({ color: '#b15a36', roughness: 0.85 }),
  darkpot: () => new THREE.MeshStandardMaterial({ color: '#3a2c22', roughness: 0.8 }),
  whitepot: () => new THREE.MeshStandardMaterial({ color: '#e8e2d6', roughness: 0.7 }),
  concrete: () => new THREE.MeshStandardMaterial({ color: '#9a958b', roughness: 0.95 }),
  soil: () => new THREE.MeshStandardMaterial({ color: '#241a12', roughness: 1 }),
  stem: (c?: string) => new THREE.MeshStandardMaterial({ color: c || '#5a7a3a', roughness: 0.85 }),
}
const leafMat = (c: string, opts: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0, side: THREE.DoubleSide, ...opts })

function potRound(g: THREE.Group, topR: number, botR: number, h: number, mat: THREE.Material): number {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(topR, botR, h, 24), mat)
  pot.position.y = h / 2; pot.castShadow = true; pot.receiveShadow = true; g.add(pot)
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(topR * 1.06, topR * 1.06, h * 0.12, 24), mat)
  rim.position.y = h * 0.94; rim.castShadow = true; g.add(rim)
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(topR * 0.92, topR * 0.92, 0.06, 24), M.soil())
  soil.position.y = h - 0.02; g.add(soil)
  return h
}
function potSquare(g: THREE.Group, w: number, h: number, mat: THREE.Material): number {
  const pot = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat)
  pot.position.y = h / 2; pot.castShadow = true; pot.receiveShadow = true; g.add(pot)
  const soil = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.06, w * 0.86), M.soil())
  soil.position.y = h - 0.02; g.add(soil)
  return h
}

// arched pointed-ellipse leaf blade
function bladeMesh(len: number, wid: number, mat: THREE.Material = leafMat('#3d6b34')): THREE.Mesh {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.quadraticCurveTo(wid, len * 0.35, 0, len)
  shape.quadraticCurveTo(-wid, len * 0.35, 0, 0)
  const geo = new THREE.ShapeGeometry(shape, 8)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i); const t = y / len
    pos.setZ(i, Math.sin(t * Math.PI) * len * 0.12)
  }
  pos.needsUpdate = true; geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m
}

// ---------------------------------------------------------------------------
//  builders (return a THREE.Group, base at y = 0)
// ---------------------------------------------------------------------------
export type PlantType =
  | 'snakePlant' | 'bostonFern' | 'monstera' | 'fiddleLeafFig'
  | 'topiaryBall' | 'arecaPalm' | 'bamboo'

function buildSnakePlant(): THREE.Group {
  const g = new THREE.Group()
  const ph = potRound(g, 0.3, 0.24, 0.55, M.whitepot())
  const dark = leafMat('#3c6b39'), edge = leafMat('#c9c267')
  for (let i = 0; i < 9; i++) {
    const len = rand(1.4, 2.4), wid = rand(0.1, 0.16)
    const a = (i / 9) * Math.PI * 2 + rand(-0.2, 0.2), rr = rand(0.02, 0.16)
    const blade = bladeMesh(len, wid, dark)
    blade.scale.set(1, 1, 0.4)
    blade.position.set(Math.cos(a) * rr, ph, Math.sin(a) * rr)
    blade.rotation.y = a; blade.rotation.x = rand(-0.12, 0.12); blade.rotation.z = rand(-0.1, 0.1)
    g.add(blade)
    const stripe = bladeMesh(len * 0.98, wid * 0.5, edge)
    stripe.scale.set(1, 1, 0.4)
    stripe.position.copy(blade.position); stripe.position.z += 0.001
    stripe.rotation.copy(blade.rotation); g.add(stripe)
  }
  return g
}

function buildBostonFern(): THREE.Group {
  const g = new THREE.Group()
  const ph = potRound(g, 0.36, 0.26, 0.5, M.darkpot())
  const mat = leafMat('#4a7c34')
  for (let f = 0; f < 16; f++) {
    const frond = new THREE.Group()
    const a = Math.random() * Math.PI * 2
    const fl = rand(1.0, 1.6)
    const segs = 10
    for (let s = 0; s < segs; s++) {
      const t = s / segs
      const lf = bladeMesh(0.18 * (1 - t * 0.6), 0.05, mat)
      const droop = t * t * fl * 0.8
      lf.position.set(0, ph + fl * t * 0.7 + 0.1 - droop, t * fl * 0.5)
      lf.rotation.x = 1.1 + t * 0.7
      lf.scale.setScalar(1.4)
      const lL = lf.clone(); lL.rotation.y = 0.5
      const lR = lf.clone(); lR.rotation.y = -0.5
      frond.add(lL); frond.add(lR)
    }
    frond.rotation.y = a; frond.rotation.x = rand(-0.1, 0.15)
    g.add(frond)
  }
  return g
}

function buildMonstera(): THREE.Group {
  const g = new THREE.Group()
  const ph = potRound(g, 0.4, 0.3, 0.6, M.concrete())
  const mat = leafMat('#2f6b34')
  function monsteraLeaf() {
    const s = new THREE.Shape()
    s.moveTo(0, 0); s.bezierCurveTo(0.5, 0.2, 0.6, 0.9, 0, 1.2)
    s.bezierCurveTo(-0.6, 0.9, -0.5, 0.2, 0, 0)
    const holes: THREE.Path[] = []
    for (const [hx, hy] of [[0.22, 0.5], [-0.22, 0.5], [0.18, 0.8], [-0.18, 0.8]]) {
      const h = new THREE.Path()
      h.absellipse(hx, hy, 0.07, 0.14, 0, Math.PI * 2, false, 0)
      holes.push(h)
    }
    s.holes = holes
    const geo = new THREE.ShapeGeometry(s, 14)
    const pos = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setZ(i, Math.sin((y / 1.2) * Math.PI) * 0.12) }
    pos.needsUpdate = true; geo.computeVertexNormals()
    return new THREE.Mesh(geo, mat)
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand(-0.2, 0.2)
    const stalkLen = rand(0.8, 1.5)
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, stalkLen, 6), M.stem('#4d7a3e'))
    stalk.position.set(Math.cos(a) * 0.1, ph + stalkLen / 2, Math.sin(a) * 0.1)
    stalk.rotation.z = Math.cos(a) * 0.5; stalk.rotation.x = -Math.sin(a) * 0.5; stalk.castShadow = true; g.add(stalk)
    const leaf = monsteraLeaf()
    const tip = new THREE.Vector3(Math.cos(a) * (0.1 + stalkLen * 0.5), ph + stalkLen, Math.sin(a) * (0.1 + stalkLen * 0.5))
    leaf.position.copy(tip)
    leaf.scale.setScalar(rand(0.7, 1.0))
    leaf.rotation.y = a + Math.PI / 2; leaf.rotation.x = -0.5; leaf.castShadow = true
    g.add(leaf)
  }
  return g
}

function buildFiddleLeafFig(): THREE.Group {
  const g = new THREE.Group()
  const ph = potRound(g, 0.42, 0.32, 0.7, M.whitepot())
  const trunkH = 1.8
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, trunkH, 8), M.stem('#7a6248'))
  trunk.position.y = ph + trunkH / 2; trunk.rotation.z = 0.04; trunk.castShadow = true; g.add(trunk)
  const mat = leafMat('#2c6b30')
  const n = 12
  for (let i = 0; i < n; i++) {
    const t = i / n
    const y = ph + trunkH * 0.4 + t * (trunkH * 0.75)
    const a = i * 2.4
    const leaf = bladeMesh(rand(0.7, 1.0), rand(0.28, 0.4))
    leaf.material = mat
    leaf.position.set(Math.cos(a) * 0.12, y, Math.sin(a) * 0.12)
    leaf.rotation.y = a; leaf.rotation.x = -0.9 - rand(0, 0.3); leaf.rotation.z = rand(-0.2, 0.2)
    leaf.scale.set(1.1, 1.1, 1.1); g.add(leaf)
  }
  return g
}

function buildTopiaryBall(): THREE.Group {
  const g = new THREE.Group()
  const ph = potSquare(g, 0.6, 0.6, M.terracotta())
  const stemH = 0.5
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, stemH, 8), M.stem('#6b5236'))
  stem.position.y = ph + stemH / 2; stem.castShadow = true; g.add(stem)
  const ballMat = leafMat('#3d6b34')
  const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 2), ballMat)
  const pos = ball.geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))
    v.multiplyScalar(1 + rand(-0.06, 0.06)); pos.setXYZ(i, v.x, v.y, v.z)
  }
  pos.needsUpdate = true; ball.geometry.computeVertexNormals()
  ball.position.y = ph + stemH + 0.5; ball.castShadow = true; g.add(ball)
  const fleck = leafMat('#52864a')
  for (let i = 0; i < 60; i++) {
    const v = new THREE.Vector3().setFromSphericalCoords(0.56, Math.acos(rand(-1, 1)), rand(0, Math.PI * 2))
    const lf = new THREE.Mesh(new THREE.CircleGeometry(0.06, 5), fleck)
    lf.position.set(v.x, ph + stemH + 0.5 + v.y, v.z); lf.lookAt(lf.position.clone().add(v)); g.add(lf)
  }
  return g
}

function buildArecaPalm(): THREE.Group {
  const g = new THREE.Group()
  const ph = potRound(g, 0.4, 0.3, 0.65, M.darkpot())
  const mat = leafMat('#3f7a34')
  const stems = 6
  for (let st = 0; st < stems; st++) {
    const sl = rand(1.7, 2.5)
    const baseA = (st / stems) * Math.PI * 2 + rand(-0.2, 0.2)
    const arch = rand(0.4, 0.7)
    const segN = 9
    const frond = new THREE.Group()
    let prev = new THREE.Vector3(0, ph, 0)
    for (let s = 1; s <= segN; s++) {
      const t = s / segN
      const y = ph + sl * Math.sin(t * 1.1)
      const out = t * t * sl * arch
      const cur = new THREE.Vector3(out, y - (t * t * t) * sl * 0.5, 0)
      const dir = cur.clone().sub(prev); const len = dir.length()
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, len, 6), M.stem('#5f7a36'))
      rod.position.copy(prev.clone().add(cur).multiplyScalar(0.5))
      rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
      rod.castShadow = true; frond.add(rod)
      for (const side of [-1, 1]) {
        const ll = bladeMesh(rand(0.34, 0.5) * (1 - t * 0.35), 0.024)
        ll.material = mat
        ll.position.copy(cur)
        ll.rotation.order = 'YXZ'
        ll.rotation.y = side * 1.05
        ll.rotation.z = side * 0.25
        ll.rotation.x = 0.35 + t * 0.5
        ll.scale.setScalar(1.3); frond.add(ll)
      }
      prev = cur
    }
    frond.rotation.y = baseA
    g.add(frond)
  }
  return g
}

function buildBamboo(): THREE.Group {
  const g = new THREE.Group()
  const ph = potRound(g, 0.32, 0.26, 0.6, M.darkpot())
  const caneMat = M.stem('#8a9a4a'); const leaf = leafMat('#5a8a3a')
  const canes = 6
  for (let cI = 0; cI < canes; cI++) {
    const a = Math.random() * Math.PI * 2, rr = rand(0.04, 0.2)
    const cx = Math.cos(a) * rr, cz = Math.sin(a) * rr
    const ch = rand(1.8, 2.8)
    const segs = 6
    for (let s = 0; s < segs; s++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, ch / segs * 0.92, 8), caneMat)
      seg.position.set(cx, ph + (s + 0.5) * (ch / segs), cz)
      seg.castShadow = true; g.add(seg)
      const node = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), M.stem('#6a7a32'))
      node.position.set(cx, ph + (s + 1) * (ch / segs), cz); g.add(node)
    }
    for (let l = 0; l < 7; l++) {
      const lf = bladeMesh(rand(0.3, 0.5), 0.04)
      lf.material = leaf
      lf.position.set(cx, ph + ch - rand(0, 0.5), cz)
      lf.rotation.y = Math.random() * 6; lf.rotation.x = rand(-1, -0.3); g.add(lf)
    }
  }
  return g
}

const BUILDERS: Record<PlantType, () => THREE.Group> = {
  snakePlant: buildSnakePlant,
  bostonFern: buildBostonFern,
  monstera: buildMonstera,
  fiddleLeafFig: buildFiddleLeafFig,
  topiaryBall: buildTopiaryBall,
  arecaPalm: buildArecaPalm,
  bamboo: buildBamboo,
}

// ---------------------------------------------------------------------------
//  React components
// ---------------------------------------------------------------------------
export interface PlantProps {
  type: PlantType
  position?: [number, number, number]
  rotationY?: number
  scale?: number
}

/** Generic plant — pick the model with the `type` prop. */
export function Plant({ type, position = [0, 0, 0], rotationY = 0, scale = 1 }: PlantProps) {
  // built once per mount; remove `type` from deps if you want a stable instance
  const group = useMemo(() => BUILDERS[type](), [type])
  return <primitive object={group} position={position} rotation={[0, rotationY, 0]} scale={scale} />
}

// Convenience wrappers
type OneProps = Omit<PlantProps, 'type'>
export const SnakePlant   = (p: OneProps) => <Plant type="snakePlant"   {...p} />
export const BostonFern   = (p: OneProps) => <Plant type="bostonFern"   {...p} />
export const Monstera     = (p: OneProps) => <Plant type="monstera"     {...p} />
export const FiddleLeafFig = (p: OneProps) => <Plant type="fiddleLeafFig" {...p} />
export const TopiaryBall  = (p: OneProps) => <Plant type="topiaryBall"  {...p} />
export const ArecaPalm    = (p: OneProps) => <Plant type="arecaPalm"    {...p} />
export const Bamboo       = (p: OneProps) => <Plant type="bamboo"       {...p} />
