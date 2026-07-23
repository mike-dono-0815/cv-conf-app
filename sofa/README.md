# Sectional Nook — conference lounge grouping (R3F)

An L-sectional lounge area for your React-Three-Fiber scene, ported verbatim from
the **Lounge Gallery** preview:

- L-sectional sofa (3-seat run + 2-seat return)
- rectangular coffee table (wood top, metal frame legs, lower shelf)
- two poufs / ottomans
- area rug
- table decor (stacked books + vase)

The whole grouping is one self-contained component. Its **base sits at local
y = 0** (floor), so position it with your floor height. Footprint ≈ **4.6 × 4.0 m**
(the rug). All meshes cast & receive shadows.

## Install

1. Copy **`SectionalNook.tsx`** into `components/scene/`.
2. No new dependencies — it only uses `react` and `three` (already in your
   project). Targets three **r0.149** (matches your lockfile); the geometry APIs
   it uses are stable across r0.149–r16x, so no version edits needed.

## Use it

```tsx
// inside the <Canvas> in ConferenceScene.tsx (or any scene component):
import { SectionalNook } from './SectionalNook'

// drop it on the floor; rotate so the open side faces the walkway
<SectionalNook position={[18, 0, 14]} rotationY={Math.PI} />
```

### Props

```ts
interface SectionalNookProps {
  position?: [number, number, number]  // floor position, default [0,0,0]
  rotationY?: number                   // radians, default 0
  scale?: number                       // uniform, default 1
}
```

## Placement tips
- The sectional's corner is toward **-x / -z**; the open seating faces **+x / +z**.
  Use `rotationY` (in 90° steps, `Math.PI/2`) to aim the opening at the aisle.
- Keep ~1 m clearance around the rug for walking room.
- Pair with a plant from `Plants.tsx` (e.g. a `fiddleLeafFig` or `arecaPalm`) at a
  corner of the rug for a furnished, lived-in look.

## Notes
- Built once per mount and memoized, so the instance is stable across re-renders.
- Colors are inline in `buildSectionalNook()` (fabric `#6a5240`, rug `#4a5a52`,
  poufs `#c98a3a` / `#b8742f`) — tweak there if you want a different scheme, or
  duplicate the builder for a second colorway.
- Geometry is light (extruded rounded boxes + cylinders); fine to place several
  around the hall.
