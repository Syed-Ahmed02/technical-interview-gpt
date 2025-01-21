import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
const openai = new OpenAI();

export async function POST(req: NextRequest) {
    try {
        const response = await req.json()
        const { file } = response
        const assistant = await openai.beta.assistants.create({
            name: "Financial Analyst Assistant",
            instructions: "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
            model: "gpt-4o",
            tools: [{ type: "file_search" }],
        });
        let vectorStore = await openai.beta.vectorStores.create({
            name: "",
        });

        await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, file)
        await openai.beta.assistants.update(assistant.id, {
            tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
        });

        return NextResponse.json(assistant);
    } catch (error) {
        console.error("Error fetching session data:", error);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }
}

