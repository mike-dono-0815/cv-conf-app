# Conference Venue — Plant Models (R3F)

Seven procedural plant models for your React-Three-Fiber scene, ported verbatim
from the **Plant Gallery** preview:

| `type` value     | Plant            | Footprint / height (approx) |
|------------------|------------------|------------------------------|
| `snakePlant`     | Snake Plant      | Ø0.6 · ~2.4 tall (upright)   |
| `bostonFern`     | Boston Fern      | Ø1.2 · ~1.4 (bushy)          |
| `monstera`       | Monstera         | Ø1.4 · ~1.8 (wide leaves)    |
| `fiddleLeafFig`  | Fiddle-Leaf Fig  | Ø0.9 · ~2.6 (statement tree) |
| `topiaryBall`    | Topiary Ball     | Ø0.6 · ~1.6                  |
| `arecaPalm`      | Areca Palm       | Ø1.5 · ~2.3 (arching fronds) |
| `bamboo`         | Bamboo           | Ø0.7 · ~2.8 (tall canes)     |

Each plant's **base sits at local y = 0**, so position it with your floor height
(in the conference scene the carpet is y = 0). All meshes cast & receive shadows.

## Install

1. Copy **`Plants.tsx`** into `components/scene/`.
2. No new dependencies — it only uses `react` and `three` (already in your project).
   Targets three **r0.149** (matches your lockfile). It uses `BufferAttribute`
   APIs that are stable across r0.149–r16x, so no version edits needed.

## Use it

```tsx
// in ConferenceScene.tsx (or a new <Greenery/> component) inside the <Canvas>:
import { Plant } from './Plants'

// scatter a few — give each a floor [x, 0, z]
<Plant type="monstera"     position={[9, 0, 18]} />
<Plant type="fiddleLeafFig" position={[-7, 0, 18]} rotationY={0.6} />
<Plant type="bamboo"       position={[29, 0, 18]} scale={1.1} />
<Plant type="bostonFern"   position={[-29, 0, -17]} />
<Plant type="snakePlant"   position={[13, 0, 15]} />
<Plant type="arecaPalm"    position={[-2, 0, -17.5]} />
<Plant type="topiaryBall"  position={[20, 0, 12]} />
```

Or import a named component directly:

```tsx
import { Monstera, Bamboo } from './Plants'

<Monstera position={[9, 0, 18]} />
<Bamboo   position={[29, 0, 18]} rotationY={0.4} scale={1.1} />
```

### Props

```ts
type PlantType =
  | 'snakePlant' | 'bostonFern' | 'monstera' | 'fiddleLeafFig'
  | 'topiaryBall' | 'arecaPalm' | 'bamboo'

interface PlantProps {
  type: PlantType
  position?: [number, number, number]  // floor position, default [0,0,0]
  rotationY?: number                   // radians, default 0
  scale?: number                       // uniform, default 1
}
```

## Replacing EnvironmentProps' plants (optional)

If you installed the earlier `EnvironmentProps.tsx`, it has a simple `<Plant>` of
its own (spiky grass). To swap in these richer models, delete that internal
`Plant` helper and its render loop, then render these instead, e.g.:

```tsx
import { Plant } from './Plants'

const PLANTS: { type: PlantType; pos: [number, number, number] }[] = [
  { type: 'monstera',     pos: [-29, 0, 18] },
  { type: 'fiddleLeafFig', pos: [29, 0, 18] },
  { type: 'arecaPalm',    pos: [-7, 0, 18] },
  { type: 'bamboo',       pos: [9, 0, 18] },
  { type: 'bostonFern',   pos: [-29, 0, -17] },
  { type: 'snakePlant',   pos: [29, 0, -17] },
  { type: 'topiaryBall',  pos: [-2, 0, -17.5] },
]
// ...
{PLANTS.map((p, i) => <Plant key={i} type={p.type} position={p.pos} />)}
```

## Notes
- Models use `Math.random()` at build time, so repeated instances vary slightly
  (a feature — no two ferns identical). The result is memoized per mount, so a
  given instance is stable across re-renders.
- Geometry is lightweight (cones, cylinders, shape-extrusions). The Monstera and
  Topiary do a little per-vertex work once at build; negligible at scene scale.
- Want a denser look? Wrap several `<Plant>`s in a `<group>` and offset them.
