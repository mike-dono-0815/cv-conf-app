'use client'

import dynamic from 'next/dynamic'

const ConferenceScene = dynamic(
  () => import('@/components/scene/ConferenceScene'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#c0392b] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading conference venue…</p>
        </div>
      </div>
    ),
  }
)

export default function ConferencePage() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <ConferenceScene />
    </div>
  )
}
