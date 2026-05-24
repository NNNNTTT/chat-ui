import type { Chat, Message } from "@prisma/client"
import { Message as MessageDTO } from "@/types"
import { ChatItem, ChatBucket } from "@/components/sidebar/sidebar"
import { computeBucket, formatTime, formatUpdatedAt } from "./format"

export function serializeChat(chat: Chat): ChatItem & {
  responseId: string | null
  model: string | null
} {
  return {
    id: chat.id,
    title: chat.title,
    pinned: chat.pinned,
    bucket: computeBucket(chat.updatedAt) as ChatBucket,
    updatedAt: formatUpdatedAt(chat.updatedAt),
    responseId: chat.responseId,
    model: chat.model,
  }
}

export function serializeMessage(msg: Message): MessageDTO {
  return {
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    imageUrl: msg.imageUrl ?? undefined,
    time: formatTime(msg.createdAt),
  }
}
