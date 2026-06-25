'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback, useRef } from 'react'
import { FirstPersonPlayer } from './FirstPersonPlayer'
import { PosterHall } from './PosterHall'
import { OralTheater } from './OralTheater'
import { IndustryFair } from './IndustryFair'
import { HallStructure } from './HallStructure'
import { FloorArrows } from './FloorArrows'
import { ChatPanel } from '../ui/ChatPanel'
import { VideoOverlay } from '../ui/VideoOverlay'
import type { InteractionType, Interactable } from '@/lib/types'
import conferenceData from '@/data/conference.json'

const INTERACTABLES: Interactable[] = [
  // Poster boards – player stands ~4 units south of each board (board at z=-12, trigger at z=-8)
  { id: 'poster-0', label: 'Chat with Xiaoxiao Sun', position: [-26, 1.7, -8], interaction: { type: 'poster', paperId: '37999' } },
  { id: 'poster-1', label: 'Chat with Yearang Lee', position: [-20, 1.7, -8], interaction: { type: 'poster', paperId: '38050' } },
  { id: 'poster-2', label: 'Chat with Yukuan Min', position: [-14, 1.7, -8], interaction: { type: 'poster', paperId: '38300' } },
  { id: 'poster-3', label: 'Chat with Ruichao Yang', position: [-23, 1.7, -2], interaction: { type: 'poster', paperId: '38400' } },
  { id: 'poster-4', label: 'Chat with Haojie Zheng', position: [-17, 1.7, -2], interaction: { type: 'poster', paperId: '38700' } },
  // Oral seat – front row center
  { id: 'oral-seat', label: 'Sit down & watch talk', position: [0, 1.7, -8], radius: 6, interaction: { type: 'oral', paperId: '39000' } },
  // Amazon booth
  { id: 'booth', label: 'Talk to Amazon recruiter', position: [20, 1.7, -10], interaction: { type: 'booth' } },
]

export default function ConferenceScene() {
  const [interaction, setInteraction] = useState<InteractionType>({ type: 'none' })
  const [nearbyLabel, setNearbyLabel] = useState<string | null>(null)
  const [zoneLabel, setZoneLabel] = useState<string>('Entrance')
  const [isLocked, setIsLocked] = useState(false)
  const [relocking, setRelocking] = useState(false)
  const controlsRef = useRef<{ unlock: () => void } | null>(null)

  const openInteraction = useCallback((item: Interactable) => {
    setInteraction(item.interaction)
    controlsRef.current?.unlock()
  }, [])

  const closeInteraction = useCallback(() => {
    setInteraction({ type: 'none' })
    setRelocking(true)
  }, [])

  const activePaperId =
    interaction.type === 'poster' || interaction.type === 'oral'
      ? interaction.paperId
      : null

  const activePaper = activePaperId
    ? [...conferenceData.posters, conferenceData.oral].find(p => p.id === activePaperId) ?? null
    : null

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 200, position: [0, 1.7, 18] }}
        shadows={false}
        gl={{ antialias: true }}
        style={{ pointerEvents: interaction.type !== 'none' ? 'none' : 'auto' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 12, 5]} intensity={0.8} />
          <directionalLight position={[-10, 8, -5]} intensity={0.3} color="#a0b0d0" />

          <HallStructure />
          <FloorArrows />
          <PosterHall papers={conferenceData.posters as any} />
          <OralTheater oral={conferenceData.oral as any} />
          <IndustryFair booth={conferenceData.booth as any} />

          <FirstPersonPlayer
            interactables={INTERACTABLES}
            onNearby={setNearbyLabel}
            onInteract={openInteraction}
            onZoneChange={setZoneLabel}
            onLockChange={(locked) => { setIsLocked(locked); if (locked) setRelocking(false) }}
            controlsRef={controlsRef}
            disabled={interaction.type !== 'none'}
          />
        </Suspense>
      </Canvas>

      {/* Click-to-start / click-to-continue overlay */}
      {!isLocked && interaction.type === 'none' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 bg-black/60 backdrop-blur-sm px-8 py-5 rounded-2xl border border-white/10">
            <p className="text-white font-semibold text-lg">
              {relocking ? 'Click to continue' : 'Click anywhere to look around'}
            </p>
            {!relocking && <p className="text-slate-400 text-sm">WASD to move · E to interact · ESC to pause</p>}
          </div>
        </div>
      )}

      {/* Zone label */}
      {isLocked && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-sm font-medium border border-white/10 pointer-events-none transition-all">
          {zoneLabel}
        </div>
      )}

      {/* Crosshair */}
      {isLocked && interaction.type === 'none' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/70 -translate-y-px" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/70 -translate-x-px" />
          </div>
        </div>
      )}

      {/* Interaction prompt */}
      {isLocked && nearbyLabel && interaction.type === 'none' && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur px-5 py-3 rounded-xl border border-white/10 pointer-events-none">
          <kbd className="px-2 py-0.5 rounded bg-white/20 text-white text-xs font-mono font-bold">E</kbd>
          <span className="text-white text-sm">{nearbyLabel}</span>
        </div>
      )}

      {/* Chat panel (posters & booth) */}
      {(interaction.type === 'poster' || interaction.type === 'booth') && (
        <ChatPanel
          interaction={interaction}
          paper={activePaper as any}
          booth={interaction.type === 'booth' ? (conferenceData.booth as any) : undefined}
          onClose={closeInteraction}
        />
      )}

      {/* Video + Q&A overlay (oral) */}
      {interaction.type === 'oral' && activePaper && (
        <VideoOverlay
          paper={activePaper as any}
          onClose={closeInteraction}
        />
      )}
    </div>
  )
}
