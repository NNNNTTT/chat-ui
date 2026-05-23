import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const { message, model, previousResponseId, messages } = await req.json()

    // 履歴に画像が含まれる場合はmessages配列を送信、それ以外はprevious_response_idを使用
    const input = messages
        ? messages.map((msg: { role: string; content: string; imageUrl?: string }) => {
            if (msg.imageUrl) {
                return {
                    role: msg.role,
                    content: [
                        { type: "input_image", image_url: msg.imageUrl },
                        ...(msg.content ? [{ type: "input_text", text: msg.content }] : []),
                    ],
                }
            }
            return { role: msg.role, content: msg.content }
        })
        : message

    // OpenAI Responses API
    const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
        model,
        input,
        ...(!messages && previousResponseId && { previous_response_id: previousResponseId }),
        }),
    })

    const data = await res.json()
    return NextResponse.json(data)
}