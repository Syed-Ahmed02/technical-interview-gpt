import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
const openai = new OpenAI();

export async function POST(req: NextRequest) {
    try {
        const response = await req.json()
        const { file } = response
        console.log(file)
        const assistant = await openai.beta.assistants.create({
            name: "Resume Analst",
            instructions: "You are a hiring manager tasked with looking at resumes. Use the resume data and ask questions",
            model: "gpt-4o",
            tools: [{ type: "file_search" }],
        });
        let vectorStore = await openai.beta.vectorStores.create({
            name: "resume",
        });

        await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, file)
        await openai.beta.assistants.update(assistant.id, {
            tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
        });

        return NextResponse.json(vectorStore.id);
    } catch (error) {
        console.error("Error fetching session data:", error);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }
}

