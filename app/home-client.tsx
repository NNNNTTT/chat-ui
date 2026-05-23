"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import { LLMID, Message } from "@/types"
import { ChatUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Sidebar, ChatItem } from "@/components/sidebar/sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessages } from "@/components/chat/chat-messages"
import { Composer } from "@/components/chat/composer"

const CURRENT_USER = {
  name: "田中 玲奈",
  initials: "T",
}

const INITIAL_CHATS: ChatItem[] = [
  { id: "c1", title: "新しいチャット", bucket: "today", updatedAt: "たった今" },
]

const nowTime = () =>
  new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })

const uid = () => "c-" + Math.random().toString(36).slice(2, 9)

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

  const [chats, setChats] = useState<ChatItem[]>(INITIAL_CHATS)
  const [currentChatId, setCurrentChatId] = useState(INITIAL_CHATS[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [input, setInput] = useState("")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  // First user message becomes the chat title
  useEffect(() => {
    const first = messages.find((m) => m.role === "user")
    if (!first) return
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              title:
                first.content.length > 28
                  ? first.content.slice(0, 26) + "…"
                  : first.content || c.title,
              updatedAt: "たった今",
            }
          : c,
      ),
    )
  }, [messages, currentChatId])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      time: nowTime(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const selectedModel = LLM_LIST.find((m) => m.modelId === chatSettings?.model)
    const isImageModel = selectedModel?.imageOutput === true

    try {
      if (isImageModel) {
        const res = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, model: chatSettings?.model }),
        })
        const data = await res.json()
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.error ?? "",
          imageUrl: data.imageUrl,
          time: nowTime(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const currentMessages = [...messages, userMessage]
        const hasImage = currentMessages.some((m) => m.imageUrl)
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            model: chatSettings?.model,
            ...(hasImage
              ? { messages: currentMessages }
              : { previousResponseId: responseId }),
          }),
        })
        const data = await res.json()
        const replyText = data.output
          ?.find((o: { type: string }) => o.type === "message")
          ?.content?.[0]?.text ?? ""
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: replyText,
          time: nowTime(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        if (data.id) setResponseId(data.id)
      }
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, chatSettings, messages, responseId, setMessages, setIsLoading, setResponseId])

  const handleNewChat = useCallback(() => {
    const id = uid()
    setChats((prev) => [
      { id, title: "新しいチャット", bucket: "today", updatedAt: "たった今" },
      ...prev,
    ])
    setCurrentChatId(id)
    setMessages([])
    setResponseId(null)
    setInput("")
  }, [setMessages, setResponseId])

  const handleDeleteChat = useCallback(
    (id: string) => {
      const filtered = chats.filter((c) => c.id !== id)
      if (id === currentChatId) {
        if (filtered.length === 0) {
          const newId = uid()
          setChats([
            { id: newId, title: "新しいチャット", bucket: "today", updatedAt: "たった今" },
          ])
          setCurrentChatId(newId)
        } else {
          setChats(filtered)
          setCurrentChatId(filtered[0].id)
        }
        setMessages([])
        setResponseId(null)
      } else {
        setChats(filtered)
      }
    },
    [chats, currentChatId, setMessages, setResponseId],
  )

  const handleSelectChat = useCallback(
    (id: string) => {
      if (id === currentChatId) return
      setCurrentChatId(id)
      // Single-context architecture: switching chats clears the active thread.
      setMessages([])
      setResponseId(null)
    },
    [currentChatId, setMessages, setResponseId],
  )

  const handleTogglePin = useCallback((id: string) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)))
  }, [])

  const handleChangeModel = useCallback(
    (id: LLMID) => {
      setChatSettings((prev) => ({ ...prev, model: id }))
    },
    [setChatSettings],
  )

  const currentChat = chats.find((c) => c.id === currentChatId) ?? chats[0]

  return (
    <div
      className="grid h-screen w-full overflow-hidden"
      style={{
        gridTemplateColumns: sidebarOpen ? "260px 1fr" : "0 1fr",
        background: "var(--notion-bg)",
        color: "var(--notion-text)",
        transition: "grid-template-columns .22s cubic-bezier(.2,.7,.3,1)",
      }}
    >
      <div
        className="overflow-hidden h-full"
        style={{
          transition: "margin-left .22s cubic-bezier(.2,.7,.3,1)",
          marginLeft: sidebarOpen ? 0 : -260,
        }}
      >
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onTogglePin={handleTogglePin}
          onSearch={() => {}}
          onCloseSidebar={() => setSidebarOpen(false)}
          user={CURRENT_USER}
        />
      </div>

      <main
        className="flex flex-col h-full min-w-0"
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
        />
      </main>
    </div>
  )
}
