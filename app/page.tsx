import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0d1117]">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(26,43,74,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(26,43,74,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#1a2b4a] opacity-30 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c0392b]/40 bg-[#c0392b]/10 text-[#c0392b] text-sm font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
          CVPR 2026 · Nashville, TN · June 2026
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-6xl font-bold tracking-tight text-white leading-none">
            Conference
            <span className="block text-[#c0392b]">Simulator</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
            Experience CVPR 2026 in an interactive 3D venue. Chat with paper authors,
            watch oral talks, and visit the Amazon booth.
          </p>
        </div>

        {/* Feature list */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { icon: '🪧', label: 'Poster Hall', sub: '5 accepted papers' },
            { icon: '🎤', label: 'Oral Theater', sub: 'Lafite — Highlight paper' },
            { icon: '🏢', label: 'Industry Fair', sub: 'Amazon CV booth' },
          ].map(({ icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 px-5 py-4 rounded-xl border border-white/10 bg-white/5"
            >
              <span className="text-2xl">{icon}</span>
              <span className="font-semibold text-white">{label}</span>
              <span className="text-slate-500">{sub}</span>
            </div>
          ))}
        </div>

        {/* Controls hint */}
        <div className="text-xs text-slate-600 flex items-center gap-4">
          <span>WASD to move</span>
          <span className="w-px h-3 bg-slate-700" />
          <span>Mouse to look</span>
          <span className="w-px h-3 bg-slate-700" />
          <span>E to interact</span>
          <span className="w-px h-3 bg-slate-700" />
          <span>ESC to exit interaction</span>
        </div>

        {/* CTA */}
        <Link
          href="/conference"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#c0392b] hover:bg-[#a93226] text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-[#c0392b]/30 hover:shadow-[#c0392b]/50 hover:scale-105 active:scale-100"
        >
          Enter Conference
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </main>
  )
}
