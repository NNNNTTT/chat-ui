"use client"

import { useEffect, useMemo, useState } from "react"
import { Icon } from "@/components/ui/icon"

export type ChatBucket = "today" | "yesterday" | "lastWeek"

export interface ChatItem {
  id: string
  title: string
  pinned?: boolean
  bucket: ChatBucket
  updatedAt: string
}

const BUCKET_LABELS: Record<"pinned" | ChatBucket, string> = {
  pinned: "固定",
  today: "今日",
  yesterday: "昨日",
  lastWeek: "先週",
}

interface SidebarProps {
  chats: ChatItem[]
  currentChatId: string
  onSelectChat: (id: string) => void
  onNewChat: () => void
  onDeleteChat: (id: string) => void
  onTogglePin: (id: string) => void
  onSearch: () => void
  onOpenSettings: () => void
  onCloseSidebar: () => void
  user: { name: string; initials: string }
}

export function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePin,
  onSearch,
  onOpenSettings,
  onCloseSidebar,
  user,
}: SidebarProps) {
  const [menuFor, setMenuFor] = useState<string | null>(null)

  useEffect(() => {
    if (!menuFor) return
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-row-menu]")) setMenuFor(null)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [menuFor])

  const grouped = useMemo(() => {
    const g: Record<"pinned" | ChatBucket, ChatItem[]> = {
      pinned: [],
      today: [],
      yesterday: [],
      lastWeek: [],
    }
    chats.forEach((c) => {
      if (c.pinned) g.pinned.push(c)
      else g[c.bucket].push(c)
    })
    return g
  }, [chats])

  return (
    <aside
      className="flex flex-col min-w-[260px] h-full"
      style={{ background: "var(--notion-sidebar)" }}
      aria-label="サイドバー"
    >
      {/* Header */}
      <div className="flex items-center justify-end px-2 pt-2.5 pb-1.5 h-11 shrink-0">
        <button
          onClick={onCloseSidebar}
          title="サイドバーを閉じる"
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
          style={{ color: "var(--notion-text-2)" }}
        >
          <Icon name="sidebar-toggle" size={16} />
        </button>
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-px px-2 pb-1.5">
        <SidebarAction icon="search" label="検索" kbd="⌘K" onClick={onSearch} />
        <SidebarAction icon="pencil" label="新しいチャット" kbd="⌘N" onClick={onNewChat} />
        <SidebarAction icon="settings" label="設定" onClick={onOpenSettings} />
      </div>

      {/* History */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-2 notion-scroll">
        {(["pinned", "today", "yesterday", "lastWeek"] as const).map((bucket) => {
          const items = grouped[bucket]
          if (!items || items.length === 0) return null
          return (
            <div key={bucket} className="flex flex-col gap-px px-2 py-1">
              <div
                className="px-2 pt-1.5 pb-0.5 text-[11px] font-medium tracking-[0.2px]"
                style={{ color: "var(--notion-text-3)" }}
              >
                {BUCKET_LABELS[bucket]}
              </div>
              {items.map((c) => (
                <ChatRow
                  key={c.id}
                  chat={c}
                  active={c.id === currentChatId}
                  menuOpen={menuFor === c.id}
                  onClick={() => onSelectChat(c.id)}
                  onOpenMenu={() => setMenuFor(c.id)}
                  onCloseMenu={() => setMenuFor(null)}
                  onTogglePin={() => {
                    onTogglePin(c.id)
                    setMenuFor(null)
                  }}
                  onDelete={() => {
                    onDeleteChat(c.id)
                    setMenuFor(null)
                  }}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* User footer */}
      <div className="p-2">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 w-full px-1.5 py-1 rounded hover:bg-[var(--notion-hover)]"
        >
          <span
            className="w-[22px] h-[22px] rounded-full grid place-items-center text-[11px] font-semibold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #f6b75c, #e07c41)" }}
          >
            {user.initials}
          </span>
          <span className="flex-1 min-w-0 flex flex-col leading-tight text-left">
            <span
              className="text-[13px] font-medium truncate"
              style={{ color: "var(--notion-text)" }}
            >
              {user.name}
            </span>
          </span>
          <span
            className="w-[22px] h-[22px] grid place-items-center rounded-[3px]"
            style={{ color: "var(--notion-text-3)" }}
          >
            <Icon name="settings" size={14} />
          </span>
        </button>
      </div>
    </aside>
  )
}

function SidebarAction({
  icon,
  label,
  kbd,
  onClick,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  label: string
  kbd?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-1.5 py-1 min-h-7 rounded text-[14px] text-left hover:bg-[var(--notion-hover)] hover:text-[var(--notion-text)]"
      style={{ color: "var(--notion-text-2)" }}
    >
      <Icon name={icon} size={16} className="opacity-85 shrink-0" />
      <span className="flex-1 min-w-0 truncate">{label}</span>
      {kbd && (
        <span
          className="text-[11px] px-1 rounded-[3px] border"
          style={{
            borderColor: "var(--notion-border)",
            background: "var(--notion-bg)",
            color: "var(--notion-text-3)",
          }}
        >
          {kbd}
        </span>
      )}
    </button>
  )
}

function ChatRow({
  chat,
  active,
  menuOpen,
  onClick,
  onOpenMenu,
  onCloseMenu,
  onTogglePin,
  onDelete,
}: {
  chat: ChatItem
  active: boolean
  menuOpen: boolean
  onClick: () => void
  onOpenMenu: () => void
  onCloseMenu: () => void
  onTogglePin: () => void
  onDelete: () => void
}) {
  return (
    <div data-row-menu className="relative">
      <button
        onClick={onClick}
        aria-current={active}
        data-menu-open={menuOpen}
        className={`group flex items-center gap-1.5 w-full px-2 py-1 min-h-7 rounded text-[14px] text-left hover:bg-[var(--notion-hover)] hover:text-[var(--notion-text)] ${
          active ? "bg-[var(--notion-active)] font-medium" : ""
        }`}
        style={{
          color: active ? "var(--notion-text)" : "var(--notion-text-2)",
        }}
      >
        <span className="flex-1 min-w-0 truncate">{chat.title}</span>
        {chat.pinned && (
          <Icon name="pin" size={13} style={{ opacity: 0.5, marginRight: 2 }} />
        )}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            menuOpen ? onCloseMenu() : onOpenMenu()
          }}
          className={`w-[22px] h-[22px] grid place-items-center rounded-[3px] shrink-0 transition-opacity ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } hover:bg-[var(--notion-active)]`}
          style={{ color: "var(--notion-text-3)" }}
        >
          <Icon name="more" size={14} />
        </span>
      </button>
      {menuOpen && (
        <div
          className="notion-pop absolute z-50 top-7 left-3 min-w-[200px] p-1 rounded-md border"
          style={{
            background: "var(--notion-bg)",
            borderColor: "var(--notion-border)",
            boxShadow: "var(--notion-shadow-lg)",
          }}
        >
          <PopoverItem icon="pin" label={chat.pinned ? "ピン留めを外す" : "ピン留め"} onClick={onTogglePin} />
          <PopoverItem icon="pencil" label="名前を変更" />
          <PopoverItem icon="copy" label="複製" />
          <div className="h-px my-1" style={{ background: "var(--notion-border)" }} />
          <PopoverItem icon="trash" label="削除" onClick={onDelete} danger />
        </div>
      )}
    </div>
  )
}

function PopoverItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  label: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-[14px] text-left hover:bg-[var(--notion-hover)] ${
        danger ? "hover:!bg-[var(--notion-danger-soft)]" : ""
      }`}
      style={{ color: danger ? "var(--notion-danger)" : "var(--notion-text)" }}
    >
      <Icon name={icon} size={15} style={{ color: danger ? "var(--notion-danger)" : "var(--notion-text-2)" }} />
      <span>{label}</span>
    </button>
  )
}
