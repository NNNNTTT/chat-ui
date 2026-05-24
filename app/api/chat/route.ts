import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeChat, serializeMessage } from "@/lib/chat-serialize"
import type { Prisma } from "@prisma/client"

function deriveTitle(text: string): string {
  return text.length > 28 ? text.slice(0, 26) + "…" : text
}

export async function POST(req: Request) {
  const { chatId, text, model } = await req.json()

  if (typeof chatId !== "string" || typeof text !== "string") {
    return NextResponse.json(
      { error: "chatId と text は必須です" },
      { status: 400 },
    )
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
  if (!chat) {
    return NextResponse.json({ error: "chat not found" }, { status: 404 })
  }

  // ユーザーメッセージを保存
  const userMessage = await prisma.message.create({
    data: { chatId, role: "user", content: text },
  })

  // 履歴に画像が含まれる場合は messages 配列で送信、それ以外は previous_response_id を使用
  const hasImage =
    chat.messages.some((m) => m.imageUrl) || false
  const allMessages = [...chat.messages, userMessage]

  const input = hasImage
    ? allMessages.map((m) => {
        if (m.imageUrl) {
          return {
            role: m.role,
            content: [
              { type: "input_image", image_url: m.imageUrl },
              ...(m.content ? [{ type: "input_text", text: m.content }] : []),
            ],
          }
        }
        return { role: m.role, content: m.content }
      })
    : text

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input,
      ...(!hasImage && chat.responseId
        ? { previous_response_id: chat.responseId }
        : {}),
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? "応答の取得に失敗しました" },
      { status: res.status },
    )
  }

  const replyText: string =
    data.output?.find((o: { type: string }) => o.type === "message")
      ?.content?.[0]?.text ?? ""

  const isFirstUserMessage = !chat.messages.some((m) => m.role === "user")
  const chatUpdate: Prisma.ChatUpdateInput = {
    responseId: data.id ?? null,
    model: typeof model === "string" ? model : chat.model,
  }
  if (isFirstUserMessage && chat.title === "新しいチャット" && text.trim()) {
    chatUpdate.title = deriveTitle(text.trim())
  }

  const [assistantMessage, updatedChat] = await prisma.$transaction([
    prisma.message.create({
      data: { chatId, role: "assistant", content: replyText },
    }),
    prisma.chat.update({ where: { id: chatId }, data: chatUpdate }),
  ])

  return NextResponse.json({
    message: serializeMessage(assistantMessage),
    responseId: data.id ?? null,
    chat: serializeChat(updatedChat),
  })
}
