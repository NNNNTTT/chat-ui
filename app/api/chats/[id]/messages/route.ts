import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeMessage } from "@/lib/chat-serialize"

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/chats/[id]/messages">,
) {
  const { id } = await ctx.params
  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  })
  if (!chat) {
    return NextResponse.json({ error: "chat not found" }, { status: 404 })
  }
  return NextResponse.json({
    responseId: chat.responseId,
    model: chat.model,
    messages: chat.messages.map(serializeMessage),
  })
}
