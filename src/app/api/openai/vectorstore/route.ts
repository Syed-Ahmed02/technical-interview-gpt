import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import fs from "fs";
import { arrayBuffer } from 'stream/consumers';
const openai = new OpenAI();

export async function POST(req: NextRequest) {
    try {
        const response = await req.formData()
        const file = response.get('file') as File

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const assistant = await openai.beta.assistants.create({
            name: "Resume Analst",
            instructions: "You are a hiring manager tasked with looking at resumes. Use the resume data and ask questions",
            model: "gpt-4o",
            tools: [{ type: "file_search" }],
        });
        let vectorStore = await openai.beta.vectorStores.create({
            name: "resume",
        });

       

        await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
            files: [file], 
        });
        await openai.beta.assistants.update(assistant.id, {
            tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
        });

        return NextResponse.json(vectorStore.id);
    } catch (error) {
        console.error("Error fetching session data:", error);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }
}

