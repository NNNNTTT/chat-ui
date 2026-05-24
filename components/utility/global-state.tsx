"use client"

import { ChatUIContext } from "@/context/context"
import { ChatSettings, DEFAULT_CHAT_SETTINGS, Message } from "@/types"
import { FC, useEffect, useState } from "react"

interface GlobalStateProps {
    children: React.ReactNode
}

const STORAGE_KEY = "chat-ui:settings"

// Persist only app-level fields. `model` is per-chat and reloads from DB.
type PersistedSettings = Omit<ChatSettings, "model">

function loadFromStorage(): PersistedSettings | null {
    if (typeof window === "undefined") return null
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
    const [chatSettings, setChatSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [responseId, setResponseId] = useState<string | null>(null)

    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = loadFromStorage()
        if (stored) {
            setChatSettings((prev) => ({ ...prev, ...stored }))
        }
    }, [])

    // Persist app-level fields to localStorage on change
    useEffect(() => {
        const { model: _model, ...persistable } = chatSettings
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
        } catch {
            // ignore quota/availability errors
        }
    }, [chatSettings])

    return (
        <ChatUIContext.Provider value={{
            chatSettings,
            setChatSettings,
            messages,
            setMessages,
            isLoading,
            setIsLoading,
            responseId,
            setResponseId
        }}>
            {children}
        </ChatUIContext.Provider>
    )
}
