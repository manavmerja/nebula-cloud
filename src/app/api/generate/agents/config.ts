import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- 🔐 KEY MANAGEMENT ---
const KEYS = {
    DRAFTER: process.env.GROQ_API_KEY_DRAFTER, // Key 1
    AUDITOR: process.env.GROQ_API_KEY_FIXER,   // Key 2 (Shared with Fixer)
    FIXER:   process.env.GROQ_API_KEY_FIXER,   // Key 2
    SYNC:    process.env.GROQ_API_KEY_SYNC,    // Key 3
};

// Fallback Key
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// Define valid agent types
export type AgentType = 'DRAFTER' | 'AUDITOR' | 'FIXER' | 'SYNC';

export async function callAIModel(
    systemPrompt: string, 
    userMessage: string, 
    agentType: AgentType = 'DRAFTER' // Default
) {
    let resultJSON = null;

    // 1. Select the correct API Key
    const selectedKey = KEYS[agentType];

    if (!selectedKey) {
        console.error(`❌ CRITICAL: No API Key found for agent: ${agentType}`);
        // Fallback to Drafter key if specific key is missing
        return await callGeminiFallback(systemPrompt, userMessage);
    }

    // 2. Instantiate Groq Client (Dynamic)
    // We create a new client per request to switch keys
    const groq = new Groq({ apiKey: selectedKey });

    try {
        console.log(`🤖 ${agentType} Agent Active... (Using Key ending in ...${selectedKey.slice(-4)})`);

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0]?.message?.content || "";
        resultJSON = JSON.parse(rawContent);

    } catch (error: any) {
        console.warn(`⚠️ Groq (${agentType}) Failed: ${error.message}. Switching to Gemini...`);
        return await callGeminiFallback(systemPrompt, userMessage);
    }

    return resultJSON;
}

// --- FALLBACK FUNCTION ---
async function callGeminiFallback(systemPrompt: string, userMessage: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemPrompt + "\n\n" + userMessage);
        const rawContent = result.response.text();
        
        // Cleanup Markdown
        const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("🔥 ALL AI MODELS FAILED.");
        return null;
    }
}