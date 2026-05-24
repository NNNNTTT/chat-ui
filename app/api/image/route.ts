import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeChat, serializeMessage } from "@/lib/chat-serialize"
import type { Prisma } from "@prisma/client"

function deriveTitle(text: string): string {
  return text.length > 28 ? text.slice(0, 26) + "…" : text
}

export async function POST(req: Request) {
  const { chatId, prompt, model } = await req.json()

  if (typeof chatId !== "string" || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "chatId と prompt は必須です" },
      { status: 400 },
    )
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: { where: { role: "user" }, take: 1 } },
  })
  if (!chat) {
    return NextResponse.json({ error: "chat not found" }, { status: 404 })
  }
  const isFirstUserMessage = chat.messages.length === 0

  // ユーザーメッセージを保存
  await prisma.message.create({
    data: { chatId, role: "user", content: prompt },
  })

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "auto",
      quality: "auto",
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    // 失敗した場合もユーザーメッセージは残しておき、assistant 側に error を保存
    const errMsg = data.error?.message ?? "画像生成に失敗しました"
    const failed = await prisma.message.create({
      data: { chatId, role: "assistant", content: errMsg },
    })
    return NextResponse.json(
      { error: errMsg, message: serializeMessage(failed) },
      { status: res.status },
    )
  }

  const base64 = data.data[0].b64_json
  const imageUrl = `data:image/png;base64,${base64}`

  const chatUpdate: Prisma.ChatUpdateInput = {
    model: typeof model === "string" ? model : chat.model,
  }
  if (isFirstUserMessage && chat.title === "新しいチャット" && prompt.trim()) {
    chatUpdate.title = deriveTitle(prompt.trim())
  }

  const [assistantMessage, updatedChat] = await prisma.$transaction([
    prisma.message.create({
      data: { chatId, role: "assistant", content: "", imageUrl },
    }),
    prisma.chat.update({ where: { id: chatId }, data: chatUpdate }),
  ])

  return NextResponse.json({
    message: serializeMessage(assistantMessage),
    chat: serializeChat(updatedChat),
  })
}
