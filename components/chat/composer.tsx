"use client"

import { KeyboardEvent, useEffect, useRef } from "react"
import { Icon } from "@/components/ui/icon"

interface ComposerProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  isLoading: boolean
}

export function Composer({ value, onChange, onSend, isLoading }: ComposerProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(200, ta.scrollHeight) + "px"
  }, [value])

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const canSend = value.trim().length > 0 && !isLoading

  return (
    <div className="w-full max-w-[740px] mx-auto px-8 pt-2 pb-6 shrink-0">
      <div
        className="rounded-xl px-3 pt-2.5 pb-2 flex flex-col gap-2 border transition-[box-shadow,border-color] focus-within:border-[var(--notion-border-focus)] focus-within:shadow-[var(--notion-shadow-md)]"
        style={{
          background: "var(--notion-input)",
          borderColor: "var(--notion-input-border)",
          boxShadow: "var(--notion-shadow-sm)",
        }}
      >
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          placeholder="メッセージを送信…  (Shift+Enter で改行)"
          rows={1}
          className="w-full min-h-[22px] max-h-[200px] text-[15px] leading-[1.5] resize-none bg-transparent outline-none placeholder:text-[var(--notion-text-3)]"
          style={{ color: "var(--notion-text)" }}
        />
        <div className="flex items-center gap-1">
          <ComposerIconButton icon="paperclip" title="ファイル添付" />
          <ComposerIconButton icon="image" title="画像" />
          <ComposerIconButton icon="mic" title="音声入力" />
          <div className="flex-1" />
          <span className="text-[11px] px-1" style={{ color: "var(--notion-text-3)" }}>
            {isLoading
              ? "応答を生成中…"
              : `${value.length} 文字 · Enter で送信`}
          </span>
          <button
            onClick={onSend}
            disabled={!canSend}
            title="送信"
            className="w-7 h-7 grid place-items-center rounded transition-colors"
            style={{
              background: canSend ? "var(--notion-accent)" : "var(--notion-surface-2)",
              color: canSend ? "#fff" : "var(--notion-text-3)",
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            <Icon name="arrow_up" size={15} />
          </button>
        </div>
      </div>
      <div
        className="text-center text-[11px] mt-2"
        style={{ color: "var(--notion-text-3)" }}
      >
        返答は OpenAI Responses API から取得しています
      </div>
    </div>
  )
}

function ComposerIconButton({
  icon,
  title,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  title: string
}) {
  return (
    <button
      title={title}
      className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
      style={{ color: "var(--notion-text-2)" }}
    >
      <Icon name={icon} size={16} />
    </button>
  )
}
