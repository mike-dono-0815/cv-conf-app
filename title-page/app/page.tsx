import Link from 'next/link'
import { Space_Grotesk } from 'next/font/google'

// Display typeface for the title page. Loaded via next/font (no extra install).
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

// Small keycap helper used in the controls row.
function Kbd({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center rounded-md border border-white/15 border-b-2 bg-white/[0.06] px-2 py-[3px] text-xs font-semibold text-slate-200 ${className}`}
      style={{ fontFamily: 'var(--font-space-grotesk)' }}
    >
      {children}
    </kbd>
  )
}

const FEATURES = [
  {
    label: 'Poster Hall',
    sub: '13 accepted papers',
    tint: 'rgba(96,140,235,0.08)',
    border: 'rgba(96,140,235,0.22)',
    chip: 'rgba(96,140,235,0.16)',
    stroke: '#7ba0ef',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="7" y1="8" x2="17" y2="8" />
        <line x1="7" y1="12" x2="14" y2="12" />
        <line x1="7" y1="16" x2="12" y2="16" />
      </>
    ),
  },
  {
    label: 'Oral Theater',
    sub: '6 talks · Lafite Highlight',
    highlight: true,
    tint: 'rgba(192,57,43,0.10)',
    border: 'rgba(192,57,43,0.28)',
    chip: 'rgba(192,57,43,0.18)',
    stroke: '#e87a6c',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M9.5 8.5l5 2.5-5 2.5z" fill="#e87a6c" stroke="none" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </>
    ),
  },
  {
    label: 'Industry Fair',
    sub: 'Amazon CV booth',
    tint: 'rgba(255,153,0,0.09)',
    border: 'rgba(255,153,0,0.24)',
    chip: 'rgba(255,153,0,0.16)',
    stroke: '#ffb547',
    icon: (
      <>
        <path d="M4 9h16v11H4z" />
        <path d="M4 9l2-5h12l2 5" />
        <line x1="10" y1="20" x2="10" y2="14" />
        <line x1="14" y1="20" x2="14" y2="14" />
      </>
    ),
  },
]

export default function Home() {
  return (
    <main
      className={`${spaceGrotesk.variable} relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-6`}
      style={{
        background:
          'radial-gradient(120% 90% at 50% -10%, #11203a 0%, #0a0f1a 45%, #070a12 100%)',
      }}
    >
      {/* Perspective floor grid — evokes the 3D hall */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46%] overflow-hidden pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to top, #000 0%, transparent 92%)',
          maskImage: 'linear-gradient(to top, #000 0%, transparent 92%)',
        }}
      >
        <div
          className="absolute"
          style={{
            left: '-20%',
            right: '-20%',
            top: '-30%',
            bottom: '-12%',
            backgroundImage:
              'linear-gradient(rgba(96,140,235,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(96,140,235,0.30) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform: 'rotateX(74deg)',
            transformOrigin: '50% 100%',
            animation: 'tp-drift 7s linear infinite',
          }}
        />
      </div>

      {/* Ambient glows: carpet red, Amazon orange, CVPR blue */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '62%',
          width: 760,
          height: 520,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(closest-side, rgba(192,57,43,0.22), transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          right: -80,
          bottom: 40,
          width: 520,
          height: 420,
          background: 'radial-gradient(closest-side, rgba(255,153,0,0.16), transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          left: -60,
          top: -40,
          width: 520,
          height: 460,
          background: 'radial-gradient(closest-side, rgba(96,140,235,0.18), transparent 70%)',
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-[5] flex items-center justify-between px-10 py-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cvpr-logo.svg" alt="CVPR" className="h-[30px] w-auto opacity-95" />
        <div className="flex items-center gap-2.5 text-sm tracking-wide text-slate-400">
          <span
            className="font-semibold text-slate-100"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Amazon Science
          </span>
          <span className="opacity-40">@</span>
          <span>CVPR 2026</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-[4] flex flex-col items-center gap-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#c0392b]/45 bg-[#c0392b]/10 px-[18px] py-2 text-sm font-medium tracking-[0.04em] text-[#e06a5c]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#c0392b] animate-pulse" />
          CVPR 2026 · NASHVILLE, TN · JUNE 2026
        </div>

        {/* Title */}
        <h1
          className="mt-7 text-6xl md:text-8xl font-bold leading-[0.98] tracking-[-0.02em] text-white"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Conference
          <br />
          <span
            style={{
              backgroundImage:
                'linear-gradient(100deg, #ff9900 0%, #e0532f 52%, #c0392b 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Simulator
          </span>
        </h1>

        <p className="mt-6 max-w-[600px] text-lg md:text-xl leading-relaxed text-slate-400">
          Step inside CVPR 2026 as a fully interactive 3D venue — walk the floor, chat with
          paper authors, watch oral talks, and meet the Amazon recruiting team.
        </p>

        {/* Feature cards */}
        <div className="mt-11 grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="relative w-full sm:w-[232px] rounded-2xl px-5 py-6 text-left overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${f.tint}, rgba(255,255,255,0.02))`,
                border: `1px solid ${f.border}`,
              }}
            >
              {f.highlight && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full bg-[#f59e0b]/[0.16] px-2 py-[3px] text-[11px] font-bold tracking-[0.04em] text-[#f5a623]">
                  ★ HIGHLIGHT
                </div>
              )}
              <div
                className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px]"
                style={{ background: f.chip }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={f.stroke}
                  strokeWidth="2"
                >
                  {f.icon}
                </svg>
              </div>
              <div
                className="mt-4 text-lg font-semibold text-white"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {f.label}
              </div>
              <div className="mt-1.5 text-sm text-slate-400">{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-[18px] text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex gap-1">
              <Kbd>W</Kbd>
              <Kbd>A</Kbd>
              <Kbd>S</Kbd>
              <Kbd>D</Kbd>
            </span>
            move
          </div>
          <span className="h-4 w-px bg-white/12" />
          <div className="flex items-center gap-2">
            <Kbd>Mouse</Kbd>
            look
          </div>
          <span className="h-4 w-px bg-white/12" />
          <div className="flex items-center gap-2">
            <Kbd>E</Kbd>
            interact
          </div>
          <span className="h-4 w-px bg-white/12" />
          <div className="flex items-center gap-2">
            <Kbd>ESC</Kbd>
            exit
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/conference"
          className="mt-10 inline-flex items-center gap-3 whitespace-nowrap rounded-[14px] px-[38px] py-[18px] text-xl font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-100"
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            background: 'linear-gradient(180deg, #c94032, #b5331f)',
            boxShadow:
              '0 14px 44px rgba(192,57,43,0.42), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          Enter Conference
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </main>
  )
}
