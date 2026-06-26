'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage, Paper } from '@/lib/types'

interface Props {
  paper: Paper
  onClose: () => void
}

type Phase = 'watching' | 'qa'

export function VideoOverlay({ paper, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('watching')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startQA = () => {
    setPhase('qa')
    const opening: ChatMessage = {
      role: 'assistant',
      content: `Thanks for attending the talk! I'm ${paper.firstAuthor}. I just presented our work on "${paper.shortTitle}". What questions do you have?`,
    }
    setMessages([opening])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setStreaming(true)

    try {
      const res = await fetch('/api/chat/oral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // slice(1) drops the UI-only opening greeting — Mistral requires conversations to start with a user message
        body: JSON.stringify({ messages: nextMessages.slice(1), paperId: paper.id }),
      })

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
        setStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const content = parsed.content ?? ''
            if (content) {
              accumulated += content
              setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: accumulated }])
            }
          } catch { /* ignore */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    }

    setStreaming(false)
  }, [input, messages, paper, streaming])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="w-full max-w-4xl bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-bold tracking-wide">
              ★ HIGHLIGHT
            </div>
            <div>
              <p className="text-white font-semibold">{paper.shortTitle}</p>
              <p className="text-slate-500 text-xs">{paper.firstAuthor} et al. · CVPR 2026 Oral</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {phase === 'watching' && (
              <button
                onClick={startQA}
                className="px-4 py-1.5 rounded-lg bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-semibold transition-colors"
              >
                Start Q&amp;A
              </button>
            )}
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
        </div>

        {phase === 'watching' ? (
          /* Watching phase */
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* YouTube embed */}
            <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
              {paper.videoUrl ? (
                <iframe
                  src={paper.videoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={paper.title}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0d1535]">
                  <p className="text-slate-500 text-sm">No video available</p>
                </div>
              )}
            </div>

            {/* Paper meta + abstract */}
            <div className="px-6 pt-4 pb-3">
              <p className="text-slate-400 text-xs">{paper.authors.join(', ')}</p>
              <p className="text-slate-600 text-xs mt-0.5">{paper.session}</p>
            </div>
            <div className="px-6 pb-4">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Abstract</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{paper.abstract}</p>
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c0392b] text-xs hover:underline mt-2 inline-block"
              >
                Read the paper →
              </a>
            </div>

          </div>
        ) : (
          /* Q&A phase */
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Paper summary sidebar */}
            <div className="w-56 flex-shrink-0 border-r border-white/10 p-4 overflow-y-auto">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Paper</h3>
              <p className="text-white text-xs font-semibold leading-snug mb-2">{paper.shortTitle}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{paper.abstract.slice(0, 200)}…</p>
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c0392b] text-xs hover:underline mt-3 inline-block"
              >
                View paper →
              </a>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a2b4a] to-[#c0392b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {paper.firstAuthor[0]}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#c0392b] text-white rounded-tr-sm'
                          : 'text-slate-200 rounded-tl-sm'
                      }`}
                      style={{ background: msg.role === 'assistant' ? 'rgba(255,255,255,0.07)' : undefined }}
                    >
                      {msg.content ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (streaming && i === messages.length - 1 ? (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      ) : '')}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 px-4 py-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={streaming}
                    placeholder={streaming ? 'Waiting…' : `Ask ${paper.firstAuthor} a question…`}
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-600 outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || streaming}
                    className="p-1.5 rounded-lg bg-[#c0392b] hover:bg-[#a93226] text-white transition-colors disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </div>
                <p className="text-center text-slate-700 text-xs mt-2">ESC to return to conference</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
