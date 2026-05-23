import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const { prompt, model } = await req.json()

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
            quality: "auto"
        }),
    })

    const data = await res.json()

    if (!res.ok) {
        return NextResponse.json(
            { error: data.error?.message ?? "画像生成に失敗しました" },
            { status: res.status }
        )
    }

    const base64 = data.data[0].b64_json
    return NextResponse.json({ imageUrl: `data:image/png;base64,${base64}` })
}
