"use client"

import { ChatUIContext } from "@/context/context"
import { ChatSettings, Message } from "@/types"
import { FC, useState } from "react"

interface GlobalStateProps {
    children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {

    const [chatSettings, setChatSettings] = useState<ChatSettings>({
        model: "gpt-5.5",
    })
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [responseId, setResponseId] = useState<string | null>(null)

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