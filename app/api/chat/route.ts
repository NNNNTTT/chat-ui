import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const { message, model, previousResponseId } = await req.json()

    // OpenAI Responses API
    const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
        model,
        input: message,
        ...(previousResponseId && { previous_response_id: previousResponseId }),
        }),
    })

    const data = await res.json()
    return NextResponse.json(data)
}