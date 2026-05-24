import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeChat, serializeMessage } from "@/lib/chat-serialize"
import type { Prisma } from "@prisma/client"

function deriveTitle(text: string): string {
  return text.length > 28 ? text.slice(0, 26) + "…" : text
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; filename: string } {
  const [meta, base64] = dataUrl.split(",")
  const mimeMatch = /data:([^;]+);base64/.exec(meta ?? "")
  const mime = mimeMatch?.[1] ?? "image/png"
  const ext = (mime.split("/")[1] || "png").replace("+xml", "")
  const binary = Buffer.from(base64 ?? "", "base64")
  const blob = new Blob([new Uint8Array(binary)], { type: mime })
  return { blob, filename: `attachment.${ext}` }
}

export async function POST(req: Request) {
  const { chatId, prompt, model, size, imageUrl: inputImageUrl } = await req.json()

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
  const hasInputImage = typeof inputImageUrl === "string" && inputImageUrl.length > 0

  // ユーザーメッセージを保存（添付画像があれば imageUrl も保存）
  await prisma.message.create({
    data: {
      chatId,
      role: "user",
      content: prompt,
      imageUrl: hasInputImage ? inputImageUrl : null,
    },
  })

  const sizeParam = typeof size === "string" && size ? size : "auto"

  let res: Response
  if (hasInputImage) {
    // 入力画像あり → /v1/images/edits (multipart/form-data)
    const { blob, filename } = dataUrlToBlob(inputImageUrl)
    const form = new FormData()
    form.append("model", typeof model === "string" ? model : "")
    form.append("prompt", prompt)
    if (sizeParam !== "auto") form.append("size", sizeParam)
    form.append("image", blob, filename)

    res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form,
    })
  } else {
    // 入力画像なし → /v1/images/generations
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size: sizeParam,
        quality: "auto",
      }),
    })
  }

  const data = await res.json()
  if (!res.ok) {
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
  const outputImageUrl = `data:image/png;base64,${base64}`

  const chatUpdate: Prisma.ChatUpdateInput = {
    model: typeof model === "string" ? model : chat.model,
  }
  if (isFirstUserMessage && chat.title === "新しいチャット" && prompt.trim()) {
    chatUpdate.title = deriveTitle(prompt.trim())
  }

  const [assistantMessage, updatedChat] = await prisma.$transaction([
    prisma.message.create({
      data: { chatId, role: "assistant", content: "", imageUrl: outputImageUrl },
    }),
    prisma.chat.update({ where: { id: chatId }, data: chatUpdate }),
  ])

  return NextResponse.json({
    message: serializeMessage(assistantMessage),
    chat: serializeChat(updatedChat),
  })
}
