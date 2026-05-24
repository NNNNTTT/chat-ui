import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeChat } from "@/lib/chat-serialize"

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/chats/[id]">,
) {
  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))

  const data: {
    title?: string
    pinned?: boolean
    bucket?: string
    responseId?: string | null
    model?: string | null
  } = {}
  if (typeof body.title === "string") data.title = body.title
  if (typeof body.pinned === "boolean") data.pinned = body.pinned
  if (typeof body.bucket === "string") data.bucket = body.bucket
  if (typeof body.responseId === "string" || body.responseId === null)
    data.responseId = body.responseId
  if (typeof body.model === "string" || body.model === null) data.model = body.model

  const chat = await prisma.chat.update({
    where: { id },
    data,
  })
  return NextResponse.json(serializeChat(chat))
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/chats/[id]">,
) {
  const { id } = await ctx.params
  await prisma.chat.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
