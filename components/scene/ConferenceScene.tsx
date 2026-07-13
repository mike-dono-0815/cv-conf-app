'use client'

// DROP-IN REPLACEMENT for components/scene/ConferenceScene.tsx
// Changes vs original:
//  • <Canvas shadows> + PCFSoft shadow map
//  • ACES tone mapping + exposure 0.98, sRGB output (handled by r3f defaults)
//  • Warm key directional (casts shadows) + cool fill + hemisphere + low ambient
//  • Warm fog + warm background for depth
//  • Added <EnvironmentProps/> (plants, bins, stanchions, registration desk, coolers, catering)

import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { FirstPersonPlayer } from './FirstPersonPlayer'
import { TouchControls } from './TouchControls'
import { PosterHall } from './PosterHall'
import { OralTheater } from './OralTheater'
import { IndustryFair } from './IndustryFair'
import { HallStructure } from './HallStructure'
import { EnvironmentProps } from './EnvironmentProps'
import { FloorArrows } from './FloorArrows'
import { ChatPanel } from '../ui/ChatPanel'
import { VideoOverlay } from '../ui/VideoOverlay'
import { TalkPicker } from '../ui/TalkPicker'
import type { InteractionType, Interactable, Paper } from '@/lib/types'
import { AMAZON_TALKS } from '@/lib/amazonTalks'
import conferenceData from '@/data/conference.json'

const INTERACTABLES: Interactable[] = [
  // Row 1 (z=6)
  { id: 'poster-0',  label: 'Talk to Mohammad Omama',   position: [-27, 1.7,  6], interaction: { type: 'poster', paperId: '36715' } },
  { id: 'poster-1',  label: 'Talk to Xinhai Hou',       position: [-23, 1.7,  6], interaction: { type: 'poster', paperId: '39849' } },
  { id: 'poster-2',  label: 'Talk to Jinyoung Jun',     position: [-19, 1.7,  6], interaction: { type: 'poster', paperId: '36568' } },
  { id: 'poster-3',  label: 'Talk to Peijie Qiu',       position: [-15, 1.7,  6], interaction: { type: 'poster', paperId: '38676' } },
  { id: 'poster-4',  label: 'Talk to Zitian Tang',      position: [-11, 1.7,  6], interaction: { type: 'poster', paperId: '39033' } },
  // Row 2 (z=-1)
  { id: 'poster-5',  label: 'Talk to Peiyao Wang',      position: [-26, 1.7, -1], interaction: { type: 'poster', paperId: '36512' } },
  { id: 'poster-6',  label: 'Talk to Zheda Mai',        position: [-21, 1.7, -1], interaction: { type: 'poster', paperId: '38586' } },
  { id: 'poster-7',  label: 'Talk to Yijiang Li',       position: [-16, 1.7, -1], interaction: { type: 'poster', paperId: '38920' } },
  { id: 'poster-8',  label: 'Talk to Arnav Chavan',     position: [-11, 1.7, -1], interaction: { type: 'poster', paperId: '39532' } },
  // Row 3 (z=-8)
  { id: 'poster-9',  label: 'Talk to Wenliang Zhong',   position: [-26, 1.7, -8], interaction: { type: 'poster', paperId: '37785' } },
  { id: 'poster-10', label: 'Talk to Martin Everaert',  position: [-21, 1.7, -8], interaction: { type: 'poster', paperId: '38604' } },
  { id: 'poster-11', label: 'Talk to Qihua Dong',       position: [-16, 1.7, -8], interaction: { type: 'poster', paperId: '41387' } },
  { id: 'poster-12', label: 'Talk to Chia-Hsiang Kao',  position: [-11, 1.7, -8], interaction: { type: 'poster', paperId: '36294' } },
  { id: 'oral-seat', label: 'Sit down & watch talk', position: [1, 1.7, -8], radius: 7.5, interaction: { type: 'oral', paperId: '39000' } },
  { id: 'booth', label: 'Talk to Amazon recruiter', position: [20, 1.7, -10], interaction: { type: 'booth' } },
]

export default function ConferenceScene() {
  const [interaction, setInteraction] = useState<InteractionType>({ type: 'none' })
  const [selectedTalk, setSelectedTalk] = useState<Paper | null>(null)
  const [nearbyLabel, setNearbyLabel] = useState<string | null>(null)
  const [zoneLabel, setZoneLabel] = useState<string>('Entrance')
  const [isLocked, setIsLocked] = useState(false)
  const [relocking, setRelocking] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileStarted, setMobileStarted] = useState(false)
  const controlsRef = useRef<{ unlock: () => void } | null>(null)
  const touchMoveRef = useRef({ x: 0, z: 0 })
  const touchLookRef = useRef({ dx: 0, dy: 0 })
  const mobileInteractRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const openInteraction = useCallback((item: Interactable) => {
    setInteraction(item.interaction)
    controlsRef.current?.unlock()
    // TouchControls unmounts immediately, so an in-progress joystick drag never fires
    // its pointerup — clear it here so the player doesn't drift once the panel closes.
    touchMoveRef.current = { x: 0, z: 0 }
  }, [])

  const closeInteraction = useCallback(() => {
    setInteraction({ type: 'none' })
    setSelectedTalk(null)
    setRelocking(true)
  }, [])

  // Ensure pointer lock is released (and stays released) while a talk video is showing
  useEffect(() => {
    if (selectedTalk) controlsRef.current?.unlock()
  }, [selectedTalk])

  const activePaperId = interaction.type === 'poster' ? interaction.paperId : null
  const activePaper = activePaperId
    ? conferenceData.posters.find(p => p.id === activePaperId) ?? null
    : null

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ fov: 72, near: 0.1, far: 220, position: [0, 1.7, 22] }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.98 }}
      >
        {/* Warm atmosphere */}
        <color attach="background" args={['#d9cfc0']} />
        <fog attach="fog" args={['#d9cfc0', 26, 96]} />

        <Suspense fallback={null}>
          {/* ── Lighting: warm key + cool fill + hemisphere + low ambient ── */}
          <hemisphereLight args={['#fff3e2', '#3a332c', 0.55]} />
          <ambientLight intensity={0.22} color="#fff1df" />
          <directionalLight
            position={[16, 20, 12]}
            intensity={1.25}
            color="#ffe7c4"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={1}
            shadow-camera-far={70}
            shadow-camera-left={-36}
            shadow-camera-right={36}
            shadow-camera-top={32}
            shadow-camera-bottom={-32}
            shadow-bias={-0.0004}
            shadow-normalBias={0.02}
          />
          <directionalLight position={[-14, 12, -8]} intensity={0.4} color="#b9cdec" />

          <HallStructure />
          <EnvironmentProps />
          <FloorArrows />
          <PosterHall papers={conferenceData.posters as any} />
          <OralTheater />
          <IndustryFair booth={conferenceData.booth as any} />

          <FirstPersonPlayer
            interactables={INTERACTABLES}
            onNearby={setNearbyLabel}
            onInteract={openInteraction}
            onZoneChange={setZoneLabel}
            onLockChange={(locked) => { setIsLocked(locked); if (locked) setRelocking(false) }}
            controlsRef={controlsRef}
            disabled={interaction.type !== 'none' || (isMobile && !mobileStarted)}
            isMobile={isMobile}
            touchMoveRef={touchMoveRef}
            touchLookRef={touchLookRef}
            mobileInteractRef={mobileInteractRef}
          />
        </Suspense>
      </Canvas>

      {!isMobile && !isLocked && interaction.type === 'none' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 bg-black/60 backdrop-blur-sm px-8 py-5 rounded-2xl border border-white/10">
            <p className="text-white font-semibold text-lg">
              {relocking ? 'Click to continue' : 'Click anywhere to look around'}
            </p>
            {!relocking && <p className="text-slate-400 text-sm">WASD to move · E to interact · ESC to pause</p>}
          </div>
        </div>
      )}

      {isMobile && !mobileStarted && interaction.type === 'none' && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          onPointerDown={() => setMobileStarted(true)}
        >
          <div className="flex flex-col items-center gap-2 bg-black/60 backdrop-blur-sm px-8 py-5 rounded-2xl border border-white/10 text-center">
            <p className="text-white font-semibold text-lg">Tap to start</p>
            <p className="text-slate-400 text-sm">Drag to look around · Joystick to move · Tap the button to interact</p>
          </div>
        </div>
      )}

      {(isLocked || (isMobile && mobileStarted)) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-sm font-medium border border-white/10 pointer-events-none transition-all">
          {zoneLabel}
        </div>
      )}

      {!isMobile && isLocked && interaction.type === 'none' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/70 -translate-y-px" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/70 -translate-x-px" />
          </div>
        </div>
      )}

      {!isMobile && isLocked && nearbyLabel && interaction.type === 'none' && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur px-5 py-3 rounded-xl border border-white/10 pointer-events-none">
          <kbd className="px-2 py-0.5 rounded bg-white/20 text-white text-xs font-mono font-bold">E</kbd>
          <span className="text-white text-sm">{nearbyLabel}</span>
        </div>
      )}

      {isMobile && mobileStarted && interaction.type === 'none' && (
        <TouchControls
          movementRef={touchMoveRef}
          lookRef={touchLookRef}
          nearbyLabel={nearbyLabel}
          onInteract={() => mobileInteractRef.current?.()}
        />
      )}

      {(interaction.type === 'poster' || interaction.type === 'booth') && (
        <ChatPanel
          interaction={interaction}
          paper={activePaper as any}
          booth={interaction.type === 'booth' ? (conferenceData.booth as any) : undefined}
          onClose={closeInteraction}
        />
      )}

      {interaction.type === 'oral' && !selectedTalk && (
        <TalkPicker talks={AMAZON_TALKS} onSelect={setSelectedTalk} onClose={closeInteraction} />
      )}
      {interaction.type === 'oral' && selectedTalk && (
        <VideoOverlay paper={selectedTalk} onClose={() => setSelectedTalk(null)} />
      )}
    </div>
  )
}
