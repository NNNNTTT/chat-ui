import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeChat } from "@/lib/chat-serialize"

export async function GET() {
  const chats = await prisma.chat.findMany({
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(chats.map(serializeChat))
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const chat = await prisma.chat.create({
    data: {
      title: typeof body.title === "string" ? body.title : "新しいチャット",
      model: typeof body.model === "string" ? body.model : null,
    },
  })
  return NextResponse.json(serializeChat(chat), { status: 201 })
}
