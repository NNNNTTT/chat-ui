import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatUpdatedAt } from "@/lib/format"

const MAX_SNIPPET_LENGTH = 80

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1) + "…"
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim()
  if (!q) return NextResponse.json([])

  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        {
          messages: {
            some: { content: { contains: q, mode: "insensitive" } },
          },
        },
      ],
    },
    include: {
      messages: {
        where: { content: { contains: q, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  })

  return NextResponse.json(
    chats.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: formatUpdatedAt(c.updatedAt),
      snippet: c.messages[0]?.content ? truncate(c.messages[0].content, MAX_SNIPPET_LENGTH) : null,
    })),
  )
}
