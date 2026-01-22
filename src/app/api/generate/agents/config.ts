import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- SHARED CONFIGURATION ---
export const GROQ_API_KEY = process.env.GROQ_API_KEY;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const groq = new Groq({ apiKey: GROQ_API_KEY });
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// --- HELPER: ROBUST JSON PARSER ---
function cleanAndParseJSON(text: string) {
    try {
        // Remove markdown code blocks
        let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Extract JSON object
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parsing Failed on text:", text.substring(0, 100) + "...");
        return null;
    }
}

// --- HELPER: Universal AI Caller ---
export async function callAIModel(systemPrompt: string, userMessage: string, modelName: string) {
    let resultJSON = null;
    let rawContent = "";

    // 1. Try Groq (Strict JSON Mode)
    try {
        if (!GROQ_API_KEY) throw new Error("Groq Key missing");
        
        console.log(`🤖 ${modelName} (Groq) working...`);
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: "json_object" } // Strict Mode
        });

        rawContent = completion.choices[0]?.message?.content || "";
        resultJSON = cleanAndParseJSON(rawContent);

    } catch (groqError: any) {
        console.warn(`⚠️ ${modelName} Groq JSON Mode failed (${groqError.message}). Retrying in Text Mode...`);

        // 2. Retry Groq (Text Mode - Forgiving)
        // Kabhi kabhi 'json_object' mode 400 deta hai agar model galti kare, 
        // par text mode me hum use cleanAndParseJSON se fix kar sakte hain.
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt + "\n\nIMPORTANT: Output ONLY Raw JSON. No Markdown." },
                    { role: 'user', content: userMessage }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.2,
                max_tokens: 4000
                // No response_format here
            });
            
            rawContent = completion.choices[0]?.message?.content || "";
            resultJSON = cleanAndParseJSON(rawContent);

        } catch (groqTextError: any) {
            console.warn(`⚠️ ${modelName} Groq Text Mode failed too. Switching to Gemini...`);
            
            // 3. Fallback to Gemini
            try {
                if (!GEMINI_API_KEY) throw new Error("Gemini Key missing");

                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(systemPrompt + "\n\n" + userMessage);
                rawContent = result.response.text();
                
                resultJSON = cleanAndParseJSON(rawContent);

            } catch (geminiError: any) {
                console.error(`❌ ${modelName} All AI Models Failed.`);
                return null;
            }
        }
    }

    if (!resultJSON) {
        console.error(`❌ ${modelName} returned Invalid JSON. Raw output snippet:`, rawContent.substring(0, 100));
    }

    return resultJSON;
}