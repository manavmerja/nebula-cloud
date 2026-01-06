import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATION ---
// Environment variables check karna zaroori hai production me
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 1. Initialize Clients
const groq = new Groq({ apiKey: GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// --- SYSTEM PROMPT (The Brain) ---
// Ye sabse important part hai. Hum AI ko strict instruction de rahe hain.
const SYSTEM_PROMPT = `
You are an expert Cloud Architect and DevOps Engineer.
Your goal is to generate a cloud architecture based on the user's request.

IMPORTANT: You must return ONLY a JSON object. Do not add markdown like \`\`\`json.
The JSON must follow this structure exactly:

{
  "summary": "A short 1-line explanation of the architecture.",
  "nodes": [
    { "id": "node-1", "label": "Name (e.g., EC2)", "type": "default" },
    { "id": "node-2", "label": "Name (e.g., RDS)", "type": "default" }
  ],
  "edges": [
    { "id": "edge-1", "source": "node-1", "target": "node-2" }
  ],
  "terraformCode": "The full Terraform code for this infrastructure."
}

Use specific AWS/Cloud terminologies.
`;

export async function POST(req: Request) {
    try {
        const { prompt, model } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        let resultJSON = null;

        // --- STRATEGY: TRY GROQ FIRST (FAST) ---
        try {
            console.log("Attempting Groq...");
            if (!GROQ_API_KEY) throw new Error("Groq Key missing");

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT + "\nReturn the response in valid JSON format." },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.2,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content;
            if (content) {
                resultJSON = JSON.parse(content);
                console.log("Groq Success");
            }

        } catch (groqError: any) {
            console.error("Groq Failed:", groqError.message);

            // --- FALLBACK: GEMINI (RELIABLE) ---
            try {
                console.log("Attempting Gemini fallback...");
                if (!GEMINI_API_KEY) throw new Error("Gemini Key missing");

                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                // Gemini ko JSON force karne ke liye prompt me thoda tweak
                const result = await model.generateContent(SYSTEM_PROMPT + "\n\nUser Request: " + prompt);
                const response = result.response;
                let text = response.text();

                console.log("Gemini Success");
                // Clean up markdown if Gemini adds it (```json remove karna)
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                resultJSON = JSON.parse(text);

            } catch (geminiError: any) {
                console.error("Gemini also failed:", geminiError.message);
                throw new Error(`AI Services Failed. Groq: ${groqError.message}, Gemini: ${geminiError.message}`);
            }
        }

        // --- FINAL SUCCESS RESPONSE ---
        return NextResponse.json(resultJSON);

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}