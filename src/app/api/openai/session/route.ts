import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const response = await req.json();
    const { instructions, vectorStoreId } = response
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error(`OPENAI_API_KEY is not set`);

        }
        console.log(vectorStoreId)
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-12-17",
                voice: "alloy",
                instructions: instructions,
                // tools: [{ "type": "file_search" , }],
                // tool_resources: {
                //     "file_search": {
                //         "vector_store_ids": [vectorStoreId]
                //     },
                // }
                input_audio_transcription:{
                    model:"whisper-1"
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        // Return the JSON response to the client
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching session data:", error);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }
}




/* 
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
}*/

