import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest, res: NextResponse) {

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
                instructions:"You are a helpful Virtural Assistant."
            }),
        });
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }
        const data = await res.json();
        
        return NextResponse.json(data);
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'An error occurred whilst connecting to realtime API' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

