"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import { LLMID, Message, ChatSettings } from "@/types"
import { ChatUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Sidebar, ChatItem } from "@/components/sidebar/sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessages } from "@/components/chat/chat-messages"
import { Composer } from "@/components/chat/composer"
import { SettingsPanel } from "@/components/settings/settings-panel"
import { SearchOverlay } from "@/components/chat/search-overlay"

const CURRENT_USER = {
  name: "坪田 直樹",
  initials: "T",
}

const nowTime = () =>
  new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })

type SidebarView = "chats" | "settings"

export default function HomeClient() {
  const {
    chatSettings,
    setChatSettings,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    responseId,
    setResponseId,
  } = useContext(ChatUIContext)

  const [chats, setChats] = useState<ChatItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarView, setSidebarView] = useState<SidebarView>("chats")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [input, setInput] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [attachment, setAttachment] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  // ⌘K / Ctrl+K で検索オーバーレイを開く
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Initial load: fetch chats, create first one if empty, load its messages
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const list: ChatItem[] = await fetch("/api/chats").then((r) => r.json())
      if (cancelled) return
      let initialChats = list
      if (initialChats.length === 0) {
        const created = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: chatSettings?.defaultModel }),
        }).then((r) => r.json())
        initialChats = [created]
      }
      if (cancelled) return
      setChats(initialChats)
      const first = initialChats[0]
      setCurrentChatId(first.id)
      const data = await fetch(`/api/chats/${first.id}/messages`).then((r) =>
        r.json(),
      )
      if (cancelled) return
      setMessages(data.messages ?? [])
      setResponseId(data.responseId ?? null)
      // Restore chat's model into the header picker (B-plan)
      if (data.model) {
        setChatSettings((prev) => ({ ...prev, model: data.model as LLMID }))
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if ((!text && !attachment) || isLoading || !currentChatId) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      imageUrl: attachment ?? undefined,
      time: nowTime(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    const pendingAttachment = attachment
    setAttachment(null)
    setIsLoading(true)

    const selectedModel = LLM_LIST.find((m) => m.modelId === chatSettings?.model)
    const isImageModel = selectedModel?.imageOutput === true

    try {
      const endpoint = isImageModel ? "/api/image" : "/api/chat"
      const body = isImageModel
        ? {
            chatId: currentChatId,
            prompt: text,
            model: chatSettings?.model,
            size: chatSettings?.imageSize,
            imageUrl: pendingAttachment,
          }
        : {
            chatId: currentChatId,
            text,
            model: chatSettings?.model,
            systemPrompt: chatSettings?.systemPrompt,
            temperature: chatSettings?.temperature,
            maxOutputTokens: chatSettings?.maxOutputTokens,
            imageUrl: pendingAttachment,
          }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      console.log(data)

      if (data.message) {
        setMessages((prev) => [...prev, data.message])
      }
      if ("responseId" in data) {
        setResponseId(data.responseId ?? null)
      }
      if (data.chat) {
        setChats((prev) => {
          const without = prev.filter((c) => c.id !== data.chat.id)
          return [data.chat, ...without]
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    input,
    attachment,
    isLoading,
    currentChatId,
    chatSettings,
    setMessages,
    setIsLoading,
    setResponseId,
  ])

  const handleNewChat = useCallback(async () => {
    const created: ChatItem = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: chatSettings?.defaultModel }),
    }).then((r) => r.json())
    setChats((prev) => [created, ...prev])
    setCurrentChatId(created.id)
    setMessages([])
    setResponseId(null)
    setInput("")
    if (chatSettings?.defaultModel) {
      setChatSettings((prev) => ({ ...prev, model: chatSettings.defaultModel }))
    }
  }, [setMessages, setResponseId, chatSettings, setChatSettings])

  const loadMessages = useCallback(
    async (id: string) => {
      const data = await fetch(`/api/chats/${id}/messages`).then((r) => r.json())
      setMessages(data.messages ?? [])
      setResponseId(data.responseId ?? null)
      if (data.model) {
        setChatSettings((prev) => ({ ...prev, model: data.model as LLMID }))
      }
    },
    [setMessages, setResponseId, setChatSettings],
  )

  const handleDeleteChat = useCallback(
    async (id: string) => {
      await fetch(`/api/chats/${id}`, { method: "DELETE" })
      const filtered = chats.filter((c) => c.id !== id)
      if (id === currentChatId) {
        if (filtered.length === 0) {
          const created: ChatItem = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: chatSettings?.defaultModel }),
          }).then((r) => r.json())
          setChats([created])
          setCurrentChatId(created.id)
          setMessages([])
          setResponseId(null)
        } else {
          setChats(filtered)
          const next = filtered[0]
          setCurrentChatId(next.id)
          await loadMessages(next.id)
        }
      } else {
        setChats(filtered)
      }
    },
    [chats, currentChatId, loadMessages, setMessages, setResponseId, chatSettings],
  )

  const handleSelectChat = useCallback(
    async (id: string) => {
      if (id === currentChatId) return
      setCurrentChatId(id)
      await loadMessages(id)
    },
    [currentChatId, loadMessages],
  )

  const handleTogglePin = useCallback(
    async (id: string) => {
      const current = chats.find((c) => c.id === id)
      if (!current) return
      const next = !current.pinned
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pinned: next } : c)),
      )
      await fetch(`/api/chats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: next }),
      })
    },
    [chats],
  )

  const handleChangeModel = useCallback(
    (id: LLMID) => {
      setChatSettings((prev) => ({ ...prev, model: id }))
      if (currentChatId) {
        fetch(`/api/chats/${currentChatId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: id }),
        }).catch(() => {})
      }
    },
    [setChatSettings, currentChatId],
  )

  const handleSettingsChange = useCallback(
    (patch: Partial<ChatSettings>) => {
      setChatSettings((prev) => ({ ...prev, ...patch }))
    },
    [setChatSettings],
  )

  const currentChat = chats.find((c) => c.id === currentChatId)

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: "var(--notion-bg)",
        color: "var(--notion-text)",
      }}
    >
      <div
        className="overflow-hidden h-full shrink-0"
        style={{
          width: 260,
          marginLeft: sidebarOpen ? 0 : -260,
          transition: "margin-left .22s cubic-bezier(.2,.7,.3,1)",
        }}
      >
        {sidebarView === "chats" ? (
          <Sidebar
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onTogglePin={handleTogglePin}
            onSearch={() => setSearchOpen(true)}
            onOpenSettings={() => setSidebarView("settings")}
            onCloseSidebar={() => setSidebarOpen(false)}
            user={CURRENT_USER}
          />
        ) : (
          chatSettings && (
            <SettingsPanel
              settings={chatSettings}
              onChange={handleSettingsChange}
              theme={theme}
              onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              models={LLM_LIST}
              onClose={() => setSidebarView("chats")}
            />
          )
        )}
      </div>

      <main
        className="flex-1 flex flex-col min-w-0"
        style={{ background: "var(--notion-bg)" }}
      >
        <ChatHeader
          title={currentChat?.title ?? ""}
          sidebarOpen={sidebarOpen}
          onOpenSidebar={() => setSidebarOpen(true)}
          models={LLM_LIST}
          selectedModelId={chatSettings?.model}
          onChangeModel={handleChangeModel}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <Composer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          attachment={attachment}
          onAttachmentChange={setAttachment}
          maxUploadBytes={(chatSettings?.maxUploadSizeMB ?? 10) * 1024 * 1024}
        />
      </main>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onPick={handleSelectChat}
      />
    </div>
  )
}
