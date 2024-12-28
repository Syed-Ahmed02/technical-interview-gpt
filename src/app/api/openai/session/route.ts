import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest,res:NextResponse) {

    try {
        const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-12-17",
                voice: "verse",
            }),
        });
        const data = await res.json();

        return new NextResponse(data, {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'An error occurred whilst connecting to realtime API' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

