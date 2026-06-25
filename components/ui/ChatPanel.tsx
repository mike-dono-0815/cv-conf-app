'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage, InteractionType, Paper, BoothData } from '@/lib/types'

interface Props {
  interaction: Extract<InteractionType, { type: 'poster' }> | Extract<InteractionType, { type: 'booth' }>
  paper?: Paper | null
  booth?: BoothData
  onClose: () => void
}

function getEndpoint(type: string) {
  if (type === 'poster') return '/api/chat/poster'
  return '/api/chat/booth'
}

function getPersonaName(interaction: Props['interaction'], paper?: Paper | null, booth?: BoothData): string {
  if (interaction.type === 'poster' && paper) return paper.firstAuthor
  if (interaction.type === 'booth' && booth) return `${booth.recruiterName} (${booth.company})`
  return 'Assistant'
}

function getOpeningMessage(interaction: Props['interaction'], paper?: Paper | null, booth?: BoothData): string {
  if (interaction.type === 'poster' && paper) {
    return `Hi! I'm ${paper.firstAuthor}, one of the authors of "${paper.shortTitle}". Happy to discuss our work — feel free to ask anything about the paper, our methodology, results, or future directions!`
  }
  if (interaction.type === 'booth' && booth) {
    return `Hey! I'm ${booth.recruiterName} from ${booth.team}. Great to meet you here at CVPR! We're doing some really exciting computer vision work at Amazon. What would you like to know about us or our open roles?`
  }
  return "Hello! How can I help you?"
}

export function ChatPanel({ interaction, paper, booth, onClose }: Props) {
  const openingMessage = getOpeningMessage(interaction, paper, booth)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: openingMessage }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const personaName = getPersonaName(interaction, paper, booth)

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setStreaming(true)

    const endpoint = getEndpoint(interaction.type)
    // Drop the UI-only opening greeting (index 0) — Mistral requires conversations to start with a user message
    const apiMessages = nextMessages.slice(1)
    const body: Record<string, unknown> = { messages: apiMessages }
    if (interaction.type === 'poster') body.paperId = interaction.paperId

    const busyMsg = paper
      ? `Sorry, ${paper.firstAuthor} is absolutely swamped with questions right now and can't respond — try again in a moment!`
      : booth
      ? `Sorry, ${booth.recruiterName} is tied up with another visitor right now — try again in a moment!`
      : "The presenter is unavailable right now — try again shortly!"

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: busyMsg }])
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
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: accumulated },
              ])
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: busyMsg }])
    }

    setStreaming(false)
  }, [input, messages, interaction, streaming])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="absolute inset-y-0 right-0 flex flex-col w-[420px] bg-[#0d1117]/95 backdrop-blur-md border-l border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a2b4a] to-[#c0392b] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {personaName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{personaName}</p>
            {paper && (
              <p className="text-slate-500 text-xs truncate">{paper.shortTitle}</p>
            )}
            {booth && (
              <p className="text-slate-500 text-xs">{booth.team}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          title="Close (ESC)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Paper info strip */}
      {paper && interaction.type === 'poster' && (
        <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex-shrink-0">
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
            {paper.authors.slice(0, 4).join(', ')}{paper.authors.length > 4 ? ' et al.' : ''}
          </p>
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c0392b] text-xs hover:underline mt-1 inline-block"
          >
            View paper →
          </a>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a2b4a] to-[#c0392b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                {personaName[0]}
              </div>
            )}
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#c0392b] text-white rounded-tr-sm'
                  : 'bg-white/8 text-slate-200 rounded-tl-sm'
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

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 px-4 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={streaming}
            placeholder={streaming ? 'Waiting for response…' : 'Ask a question…'}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-600 outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="p-1.5 rounded-lg bg-[#c0392b] hover:bg-[#a93226] text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-slate-700 text-xs mt-2">ESC to exit and return to conference</p>
      </div>
    </div>
  )
}
