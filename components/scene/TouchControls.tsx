'use client'

import { useCallback, useRef, useState, MutableRefObject } from 'react'

interface Props {
  movementRef: MutableRefObject<{ x: number; z: number }>
  lookRef: MutableRefObject<{ dx: number; dy: number }>
  nearbyLabel: string | null
  onInteract: () => void
}

const JOYSTICK_RADIUS = 52 // px, max knob travel from center

export function TouchControls({ movementRef, lookRef, nearbyLabel, onInteract }: Props) {
  const baseRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const joystickPointerId = useRef<number | null>(null)
  const lookPointerId = useRef<number | null>(null)
  const lastLook = useRef({ x: 0, y: 0 })

  const updateJoystick = useCallback((e: React.PointerEvent) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = e.clientX - cx
    let dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > JOYSTICK_RADIUS) {
      dx = (dx / dist) * JOYSTICK_RADIUS
      dy = (dy / dist) * JOYSTICK_RADIUS
    }
    setKnob({ x: dx, y: dy })
    movementRef.current = { x: dx / JOYSTICK_RADIUS, z: -dy / JOYSTICK_RADIUS }
  }, [movementRef])

  const handleJoystickDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch {}
    joystickPointerId.current = e.pointerId
    updateJoystick(e)
  }, [updateJoystick])

  const handleJoystickMove = useCallback((e: React.PointerEvent) => {
    if (joystickPointerId.current !== e.pointerId) return
    e.preventDefault()
    updateJoystick(e)
  }, [updateJoystick])

  const endJoystick = useCallback((e: React.PointerEvent) => {
    if (joystickPointerId.current !== e.pointerId) return
    joystickPointerId.current = null
    setKnob({ x: 0, y: 0 })
    movementRef.current = { x: 0, z: 0 }
  }, [movementRef])

  const handleLookDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch {}
    lookPointerId.current = e.pointerId
    lastLook.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleLookMove = useCallback((e: React.PointerEvent) => {
    if (lookPointerId.current !== e.pointerId) return
    e.preventDefault()
    const dx = e.clientX - lastLook.current.x
    const dy = e.clientY - lastLook.current.y
    lastLook.current = { x: e.clientX, y: e.clientY }
    lookRef.current.dx += dx
    lookRef.current.dy += dy
  }, [lookRef])

  const endLook = useCallback((e: React.PointerEvent) => {
    if (lookPointerId.current !== e.pointerId) return
    lookPointerId.current = null
  }, [])

  return (
    <>
      {/* Look layer — drag anywhere to rotate the camera */}
      <div
        className="absolute inset-0 touch-none"
        style={{ zIndex: 10 }}
        onPointerDown={handleLookDown}
        onPointerMove={handleLookMove}
        onPointerUp={endLook}
        onPointerCancel={endLook}
      />

      {/* Movement joystick */}
      <div
        ref={baseRef}
        className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm touch-none"
        style={{ zIndex: 20 }}
        onPointerDown={handleJoystickDown}
        onPointerMove={handleJoystickMove}
        onPointerUp={endJoystick}
        onPointerCancel={endJoystick}
      >
        <div
          className="absolute w-14 h-14 rounded-full bg-white/40 border border-white/50 pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
          }}
        />
      </div>

      {/* Interact button */}
      {nearbyLabel && (
        <button
          onClick={onInteract}
          className="absolute bottom-10 right-8 flex flex-col items-center gap-1"
          style={{ zIndex: 20 }}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold active:bg-white/30">
            TAP
          </div>
          <span className="text-white text-xs bg-black/60 px-2 py-0.5 rounded max-w-[160px] text-center">
            {nearbyLabel}
          </span>
        </button>
      )}
    </>
  )
}
