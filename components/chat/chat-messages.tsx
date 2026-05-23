"use client"

import { useEffect, useRef } from "react"
import { Message } from "@/types"
import { EmptyState } from "./empty-state"
import { MessageRow } from "./message-row"
import { TypingIndicator } from "./typing-indicator"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  return (
    <div className="flex-1 min-h-0 overflow-y-auto notion-scroll flex flex-col">
      {messages.length === 0 && !isLoading ? (
        <EmptyState />
      ) : (
        <div className="w-full max-w-[740px] mx-auto px-8 py-8 flex flex-col gap-6">
          {messages.map((msg) => (
            <MessageRow key={msg.id} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={endRef} />
        </div>
      )}
    </div>
  )
}
