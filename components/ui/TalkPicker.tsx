'use client'

import { useEffect } from 'react'
import type { Paper } from '@/lib/types'

interface Props {
  talks: Paper[]
  onSelect: (paper: Paper) => void
  onClose: () => void
}

export function TalkPicker({ talks, onSelect, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="w-full max-w-2xl bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src="/cvpr-logo.svg" alt="CVPR" className="h-9 w-auto opacity-90" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="px-2 py-0.5 rounded bg-[#ff9900]/20 text-[#ff9900] text-xs font-bold tracking-wide">
                  ORAL SESSION
                </div>
                <p className="text-white font-semibold">Amazon @ CVPR 2026</p>
              </div>
              <p className="text-slate-500 text-xs">Select a talk to watch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Close (ESC)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Talk list */}
        <div className="overflow-y-auto divide-y divide-white/5">
          {talks.map((talk, i) => (
            <button
              key={talk.id}
              onClick={() => onSelect(talk)}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 text-left transition-colors group"
            >
              <span className="text-[#ff9900] font-bold text-sm w-5 flex-shrink-0 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium leading-snug truncate">{talk.shortTitle}</p>
                <p className="text-slate-500 text-xs mt-0.5">{talk.firstAuthor} et al.</p>
              </div>
              <span className="flex-shrink-0 flex items-center gap-1.5 text-slate-600 group-hover:text-[#ff9900] text-xs transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch
              </span>
            </button>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-white/5">
          <p className="text-center text-slate-700 text-xs">ESC to return to conference</p>
        </div>
      </div>
    </div>
  )
}
