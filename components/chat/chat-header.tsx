"use client"

import { LLM, LLMID } from "@/types"
import { Icon } from "@/components/ui/icon"
import { ModelPicker } from "./model-picker"

interface ChatHeaderProps {
  title: string
  sidebarOpen: boolean
  onOpenSidebar: () => void
  models: LLM[]
  selectedModelId: LLMID | undefined
  onChangeModel: (id: LLMID) => void
  theme: "light" | "dark"
  onToggleTheme: () => void
}

export function ChatHeader({
  title,
  sidebarOpen,
  onOpenSidebar,
  models,
  selectedModelId,
  onChangeModel,
  theme,
  onToggleTheme,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-2 px-3 h-11 shrink-0">
      {!sidebarOpen && (
        <button
          onClick={onOpenSidebar}
          title="サイドバーを開く"
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
          style={{ color: "var(--notion-text-2)" }}
        >
          <Icon name="sidebar-toggle" size={16} />
        </button>
      )}
      <div className="flex items-center gap-1.5 px-1.5 py-1 rounded font-semibold text-[14px] max-w-[340px] min-w-0 hover:bg-[var(--notion-hover)]">
        <span className="truncate">{title}</span>
      </div>

      <ModelPicker
        models={models}
        selectedId={selectedModelId}
        onChange={onChangeModel}
      />

      <div className="flex-1" />

      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      {/* <button
        title="共有"
        className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
        style={{ color: "var(--notion-text-2)" }}
      >
        <Icon name="share" size={16} />
      </button>
      <button
        title="お気に入り"
        className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
        style={{ color: "var(--notion-text-2)" }}
      >
        <Icon name="star" size={16} />
      </button>
      <button
        title="その他"
        className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
        style={{ color: "var(--notion-text-2)" }}
      >
        <Icon name="more" size={16} />
      </button> */}
    </header>
  )
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "light" | "dark"
  onToggle: () => void
}) {
  const handle = (target: "light" | "dark") => {
    if (target !== theme) onToggle()
  }
  return (
    <div
      role="group"
      aria-label="テーマ切替"
      className="relative inline-flex items-center p-0.5 rounded-full"
      style={{ background: "var(--notion-surface-1)" }}
    >
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 w-7 rounded-full transition-transform"
        style={{
          background: "var(--notion-bg)",
          boxShadow: "var(--notion-shadow-sm)",
          transform: theme === "light" ? "translateX(0)" : "translateX(28px)",
        }}
      />
      <button
        type="button"
        onClick={() => handle("light")}
        title="ライトモード"
        aria-pressed={theme === "light"}
        className="relative z-10 w-7 h-6 grid place-items-center rounded-full transition-colors"
        style={{
          color: theme === "light" ? "var(--notion-text)" : "var(--notion-text-3)",
        }}
      >
        <Icon name="sun" size={14} />
      </button>
      <button
        type="button"
        onClick={() => handle("dark")}
        title="ダークモード"
        aria-pressed={theme === "dark"}
        className="relative z-10 w-7 h-6 grid place-items-center rounded-full transition-colors"
        style={{
          color: theme === "dark" ? "var(--notion-text)" : "var(--notion-text-3)",
        }}
      >
        <Icon name="moon" size={14} />
      </button>
    </div>
  )
}
