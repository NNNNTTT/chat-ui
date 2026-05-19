import { ChatSettings,Message  } from "@/types"
import { Dispatch, SetStateAction, createContext } from "react"

interface ChatUIContext {
    chatSettings: ChatSettings | null
    setChatSettings: Dispatch<SetStateAction<ChatSettings>>
    messages: Message[]
    setMessages: Dispatch<SetStateAction<Message[]>>
    isLoading: boolean
    setIsLoading: Dispatch<SetStateAction<boolean>>
    responseId: string | null
    setResponseId: Dispatch<SetStateAction<string | null>>
}

export const ChatUIContext = createContext<ChatUIContext>({
    chatSettings: null,
    setChatSettings: () => {},
    messages: [],
    setMessages: () => {},
    isLoading: false,
    setIsLoading: () => {},
    responseId: null,
    setResponseId: () => {}
})