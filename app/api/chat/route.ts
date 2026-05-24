import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeChat, serializeMessage } from "@/lib/chat-serialize"
import type { Prisma } from "@prisma/client"

function deriveTitle(text: string): string {
  return text.length > 28 ? text.slice(0, 26) + "…" : text
}

export async function POST(req: Request) {
  const {
    chatId,
    text,
    model,
    systemPrompt,
    temperature,
    maxOutputTokens,
    imageUrl,
  } = await req.json()

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

  // ユーザーメッセージを保存（添付画像があれば imageUrl にセット）
  const userMessage = await prisma.message.create({
    data: {
      chatId,
      role: "user",
      content: text,
      imageUrl: typeof imageUrl === "string" && imageUrl ? imageUrl : null,
    },
  })

  const allMessages = [...chat.messages, userMessage]
  // 履歴 or 現在メッセージに画像が含まれる場合は messages 配列で送信、それ以外は previous_response_id を使用
  const hasImage = allMessages.some((m) => m.imageUrl)

  const input = hasImage
    ? allMessages.map((m) => {
        // User が添付した画像は input_image として再送
        if (m.role === "user" && m.imageUrl) {
          return {
            role: "user",
            content: [
              { type: "input_image", image_url: m.imageUrl },
              ...(m.content ? [{ type: "input_text", text: m.content }] : []),
            ],
          }
        }
        // Assistant が生成した画像は API 入力として再送できないのでテキスト化
        if (m.role === "assistant" && m.imageUrl) {
          return {
            role: "assistant",
            content: m.content || "[画像を生成しました]",
          }
        }
        return { role: m.role, content: m.content }
      })
    : text

  const trimmedSystemPrompt =
    typeof systemPrompt === "string" ? systemPrompt.trim() : ""

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
      ...(trimmedSystemPrompt ? { instructions: trimmedSystemPrompt } : {}),
      ...(typeof temperature === "number" ? { temperature } : {}),
      ...(typeof maxOutputTokens === "number" && maxOutputTokens > 0
        ? { max_output_tokens: maxOutputTokens }
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
