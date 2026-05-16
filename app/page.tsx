"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarSwitcher, ContentType } from "@/components/sidebar/sidebar-switcher"

const SAMPLE_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    content: "こんにちは。何でも聞いてください。",
    time: "10:32",
  },
  {
    id: 2,
    role: "user",
    content: "useStateとuseRefの違いを教えてください。",
    time: "10:33",
  },
  {
    id: 3,
    role: "assistant",
    content:
      "useStateは値が変わるとコンポーネントを再レンダリングします。useRefは再レンダリングを起こさずに値を保持します。DOMへの参照や、レンダリングに影響しない値の保持にはuseRefが適しています。",
    time: "10:33",
  },
]

export default function Home() {
  const [input, setInput] = useState("")
  const [contentType, setContentType] = useState<ContentType>("chats")
  const [showSidebar, setShowSidebar] = useState(true)

  const handleToggleSidebar = () => setShowSidebar((prev) => !prev)

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      {/* Sidebar + Switcher */}
      <Tabs
        className="flex h-full"
        value={contentType}
        onValueChange={(v) => setContentType(v as ContentType)}
        orientation="vertical"
      >
        <SidebarSwitcher
          contentType={contentType}
          onContentTypeChange={setContentType}
        />
        <Sidebar showSidebar={showSidebar} />
      </Tabs>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleSidebar}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-6 text-gray-400 hover:text-gray-700"
              style={{ transform: `translateY(-50%) rotate(${showSidebar ? 180 : 0}deg)` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{showSidebar ? "サイドバーを閉じる" : "サイドバーを開く"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Header */}
        <header className="flex items-center justify-between px-10 py-4 border-b border-gray-200 shrink-0 bg-white">
          <h1 className="text-sm font-medium text-gray-900">
            Reactのhooksについて
          </h1>
          <Badge variant="outline" className="text-[10px] tracking-widest text-gray-400 bg-transparent">
            GPT-4o
          </Badge>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 bg-gray-50/50">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
            {SAMPLE_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                  <AvatarFallback
                    className={`text-[10px] font-bold text-white ${
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-cyan-500 to-indigo-500"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600"
                    }`}
                  >
                    {msg.role === "assistant" ? "AI" : "T"}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            <div className="flex gap-3">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-indigo-500 text-[10px] font-bold text-white">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="shrink-0 border-t border-gray-200 px-6 py-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-3 focus-within:ring-indigo-100 transition-all duration-200">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力..."
                rows={1}
                className="flex-1 bg-transparent border-0 text-sm text-gray-900 placeholder:text-gray-400 resize-none outline-none shadow-none focus-visible:ring-0 p-0 leading-relaxed max-h-40"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    disabled={!input.trim()}
                    className="shrink-0 size-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 text-white transition-all duration-150"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>送信</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2 tracking-wide">
              Shift+Enter で改行
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
