"use client"

import { useEffect, useState } from "react"
import { LLM, LLMID } from "@/types"
import { Icon } from "@/components/ui/icon"

interface ModelPickerProps {
  models: LLM[]
  selectedId: LLMID | undefined
  onChange: (id: LLMID) => void
}

export function ModelPicker({ models, selectedId, onChange }: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = models.find((m) => m.modelId === selectedId) ?? models[0]

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest("[data-model-popover]")) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div className="relative" data-model-popover>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[13px] hover:bg-[var(--notion-hover)]"
        style={{ color: "var(--notion-text-2)" }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--notion-accent)" }}
        />
        <span style={{ color: "var(--notion-text)" }}>{selected.modelName}</span>
        <Icon name="chevron-down" size={13} />
      </button>
      {open && (
        <div
          className="notion-pop absolute z-50 top-8 left-0 min-w-[260px] p-1 rounded-md border"
          style={{
            background: "var(--notion-bg)",
            borderColor: "var(--notion-border)",
            boxShadow: "var(--notion-shadow-lg)",
          }}
        >
          <div
            className="px-2 pt-2 pb-1 text-[11px] font-medium"
            style={{ color: "var(--notion-text-3)" }}
          >
            モデルを選択
          </div>
          {models.map((m) => (
            <button
              key={m.modelId}
              onClick={() => {
                onChange(m.modelId)
                setOpen(false)
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-left hover:bg-[var(--notion-hover)]"
            >
              <span className="flex flex-col leading-tight">
                <span className="text-[14px] font-medium" style={{ color: "var(--notion-text)" }}>
                  {m.modelName}
                </span>
                <span className="text-[11px]" style={{ color: "var(--notion-text-3)" }}>
                  OpenAI{m.imageOutput ? " · 画像生成" : m.imageInput ? " · マルチモーダル" : ""}
                </span>
              </span>
              {m.modelId === selected.modelId && (
                <Icon
                  name="check"
                  size={15}
                  className="ml-auto"
                  style={{ color: "var(--notion-accent)" }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
