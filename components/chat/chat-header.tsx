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

      <button
        onClick={onToggleTheme}
        title={theme === "dark" ? "ライトモード" : "ダークモード"}
        className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
        style={{ color: "var(--notion-text-2)" }}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
      </button>
      <button
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
      </button>
    </header>
  )
}
