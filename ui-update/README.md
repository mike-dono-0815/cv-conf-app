# Conference Venue — 3D realism upgrade

Drop-in replacements (+ two new files) for the React-Three-Fiber scene in
`components/scene/`. They keep every prop, interaction hook, and data flow from
your originals — only the visuals change. Preview the look first in **`Venue 3D.dc.html`**
(a standalone Three.js build of the same scene).

## What changed (matches the demo)

**Lighting & grade** — `ConferenceScene.tsx`
- `<Canvas shadows>` with PCF-soft shadow maps.
- ACES filmic tone mapping, exposure `0.98`, warm background + fog for depth.
- Warm **key** directional (casts shadows) + cool **fill** + **hemisphere** + low ambient,
  replacing the old flat ambient + two directionals.
- Renders the new `<EnvironmentProps/>`.

**Architecture & materials** — `HallStructure.tsx`
- Warm, noisy event-carpet (burgundy/navy) with a bump map, plus a deep entrance runner.
- Acoustic-tile ceiling, textured warm walls, dark **baseboards**.
- Ceiling **truss grid** + recessed **troffer** fixtures (emissive panels + a few warm point lights).
- Navy pillars get **gold caps**; hanging zone banners sit on visible **rigs**.

**Posters** — `PosterHall.tsx`
- Tripod easels (two angled front legs + back leg), white board **frame**, handout **tray**.
- Richer poster canvas: heatmap + bar-chart figure block, abstract, footer.

**Oral theater** — `OralTheater.tsx`
- Bezel + bright (un-tone-mapped) screen, stage platform, podium with gold top.
- Warm speaker **spotlight**, **raked** seating on risers, fabric-textured chairs on metal stems.

**Industry fair** — `IndustryFair.tsx`
- Metallic booth panels, lit laptop, angled "We're Hiring" card, roll-up banner stand, warm light.

**People** — `Figure.tsx` (new, shared)
- Refined low-poly person (tapered torso, shoulders, head + hair, arms, legs + shoes).
- Used for the oral speaker and the booth recruiter (the two figures you asked to keep).

**Props** — `EnvironmentProps.tsx` (new)
- Potted plants, recycle/trash bins, belt stanchions + entrance lane, registration desk,
  water coolers, catering table with urns.

## Install

1. Copy these files into `components/scene/`, replacing the same-named originals
   (`ConferenceScene.tsx`, `HallStructure.tsx`, `PosterHall.tsx`, `OralTheater.tsx`,
   `IndustryFair.tsx`) and adding the two new ones (`Figure.tsx`, `EnvironmentProps.tsx`).
2. `ConferenceScene.tsx` imports `* as THREE from 'three'` (already a dependency) and
   `./EnvironmentProps` — no new packages.
3. Run the app. If you tuned camera/movement in `FirstPersonPlayer.tsx`, leave it as-is;
   nothing here touches player controls.

## Performance notes (you chose "balance")
- Only the key directional casts shadows; troffer "glow" is mostly emissive panels with a
  handful of cheap unshadowed point lights.
- Shared materials/geometries; canvas textures are memoized.
- If you need frames back: drop `shadow-mapSize` to 1024, or set `castShadow` off on the
  seats/props and keep it on boards + pillars only.

> Three.js version note: these use `texture.encoding = THREE.sRGBEncoding` (three r0.149,
> matching your lockfile). On r152+ swap to `texture.colorSpace = THREE.SRGBColorSpace`.
