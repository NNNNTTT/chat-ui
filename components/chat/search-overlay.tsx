"use client"

import { useEffect, useState } from "react"
import { Icon } from "@/components/ui/icon"

interface SearchResult {
  id: string
  title: string
  updatedAt: string
  snippet: string | null
}

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
  onPick: (id: string) => void
}

export function SearchOverlay({ open, onClose, onPick }: SearchOverlayProps) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setQ("")
      setResults([])
      setLoading(false)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!open) return
    const query = q.trim()
    if (!query) {
      setResults([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/chats/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } catch {
        // ignore aborts and errors
      } finally {
        setLoading(false)
      }
    }, 180)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [q, open])

  // Esc to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: "rgba(15, 15, 15, 0.4)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-[520px] max-w-full flex flex-col overflow-hidden rounded-lg"
        style={{
          background: "var(--notion-bg)",
          border: "1px solid var(--notion-border)",
          boxShadow: "var(--notion-shadow-lg)",
          maxHeight: "70vh",
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-3 border-b"
          style={{ borderColor: "var(--notion-border)" }}
        >
          <Icon name="search" size={16} style={{ color: "var(--notion-text-3)" }} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="チャットを検索…"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[var(--notion-text-3)]"
            style={{ color: "var(--notion-text)" }}
          />
          <span
            className="text-[11px] px-1.5 py-0.5 rounded border shrink-0"
            style={{
              borderColor: "var(--notion-border)",
              color: "var(--notion-text-3)",
              background: "var(--notion-surface-1)",
            }}
          >
            Esc
          </span>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto notion-scroll p-1.5">
          {!q.trim() ? (
            <EmptyMessage>タイトルやメッセージ内容を検索</EmptyMessage>
          ) : loading ? (
            <EmptyMessage>検索中…</EmptyMessage>
          ) : results.length === 0 ? (
            <EmptyMessage>一致するチャットがありません</EmptyMessage>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  onPick(r.id)
                  onClose()
                }}
                className="flex items-start gap-2 w-full px-2.5 py-2 rounded text-left hover:bg-[var(--notion-hover)] transition-colors"
              >
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span
                      className="text-[14px] font-medium truncate"
                      style={{ color: "var(--notion-text)" }}
                    >
                      {r.title}
                    </span>
                    <span
                      className="text-[11px] shrink-0"
                      style={{ color: "var(--notion-text-3)" }}
                    >
                      {r.updatedAt}
                    </span>
                  </span>
                  {r.snippet && (
                    <span
                      className="block text-[12px] mt-0.5 truncate"
                      style={{ color: "var(--notion-text-2)" }}
                    >
                      {r.snippet}
                    </span>
                  )}
                </span>
                <Icon
                  name="chevron-right"
                  size={14}
                  style={{ color: "var(--notion-text-3)" }}
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-3 py-6 text-center text-[13px]"
      style={{ color: "var(--notion-text-3)" }}
    >
      {children}
    </div>
  )
}
