"use client"

import { ChangeEvent, KeyboardEvent, useEffect, useRef } from "react"
import { Icon } from "@/components/ui/icon"

interface ComposerProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  isLoading: boolean
  attachment: string | null
  onAttachmentChange: (dataUrl: string | null) => void
  maxUploadBytes: number
}

export function Composer({
  value,
  onChange,
  onSend,
  isLoading,
  attachment,
  onAttachmentChange,
  maxUploadBytes,
}: ComposerProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(200, ta.scrollHeight) + "px"
  }, [value])

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handlePickFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // reset so picking the same file again still fires
    if (!file) return
    if (file.size > maxUploadBytes) {
      const mb = (maxUploadBytes / (1024 * 1024)).toFixed(0)
      window.alert(`ファイルサイズが上限 ${mb} MB を超えています`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onAttachmentChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const canSend = (value.trim().length > 0 || !!attachment) && !isLoading

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
        {attachment && (
          <div className="flex">
            <div className="relative inline-block group">
              <img
                src={attachment}
                alt="添付ファイル"
                className="block max-h-24 rounded-md"
                style={{ border: "1px solid var(--notion-border)" }}
              />
              <button
                type="button"
                onClick={() => onAttachmentChange(null)}
                title="添付を削除"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 grid place-items-center rounded-full transition-opacity"
                style={{
                  background: "var(--notion-text)",
                  color: "var(--notion-bg)",
                  boxShadow: "var(--notion-shadow-sm)",
                }}
              >
                <Icon name="x" size={11} />
              </button>
            </div>
          </div>
        )}

        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          placeholder="メッセージを送信…  (Shift+Enter で送信、Enter で改行)"
          rows={1}
          className="w-full min-h-[22px] max-h-[200px] text-[15px] leading-[1.5] resize-none bg-transparent outline-none placeholder:text-[var(--notion-text-3)]"
          style={{ color: "var(--notion-text)" }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex items-center gap-1">
          <ComposerIconButton
            icon="paperclip"
            title="ファイル添付"
            onClick={handlePickFile}
          />
          <div className="flex-1" />
          <span className="text-[11px] px-1" style={{ color: "var(--notion-text-3)" }}>
            {isLoading
              ? "応答を生成中…"
              : `${value.length} 文字 · Shift+Enter で送信`}
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
  onClick,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  title: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
      style={{ color: "var(--notion-text-2)" }}
    >
      <Icon name={icon} size={16} />
    </button>
  )
}
