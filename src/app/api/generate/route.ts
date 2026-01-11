import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATION ---
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const groq = new Groq({ apiKey: GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// --- 🧠 THE SENIOR ARCHITECT BRAIN ---
// Ye prompt AWS Best Practices aur State Management handle karega.
const SYSTEM_PROMPT = `
You are a Senior Cloud Architect and DevOps Expert (Terraform Specialist).
Your goal is to generate or update a cloud architecture based on the user's request.

### STRICT OUTPUT RULES:
1. You must return ONLY a valid JSON object. Do not add markdown like \`\`\`json.
2. The JSON structure must be:
{
  "summary": "Short technical explanation (e.g., 'Added NAT Gateway for private subnet connectivity').",
  "nodes": [ { "id": "node-1", "label": "Web Server", "type": "default", "data": { "serviceType": "EC2" } } ],
  "edges": [ { "id": "e1-2", "source": "node-1", "target": "node-2" } ],
  "terraformCode": "The COMPLETE valid Terraform HCL code."
}

### ARCHITECTURE RULES (CRITICAL):
1. **Networking:** If using Private Subnets, you MUST create a 'NAT Gateway' and 'Elastic IP' so instances can reach the internet.
2. **Dynamic AMIs:** NEVER hardcode AMI IDs (like 'ami-0c94...'). Use 'data "aws_ami"' blocks to fetch the latest Amazon Linux 2 or Ubuntu dynamically for the current region.
3. **Security Groups:** - Database SG must ONLY allow ingress from the App Server SG (Port 5432/3306).
   - Web Server SG must ONLY allow ingress from the Load Balancer SG.
   - NEVER allow '0.0.0.0/0' on private resources.
4. **High Availability:** If the user asks for 'Production' or 'HA', use Multi-AZ (us-east-1a, us-east-1b) and set 'multi_az = true' for RDS.

### STATE MANAGEMENT LOGIC:
- If "current_state" is provided in the input, you are in **UPDATE MODE**.
- **DO NOT** delete existing nodes/edges unless explicitly asked (e.g., "Remove the database").
- **MERGE** the new request with the existing infrastructure.
- Example: If current state has 2 EC2s and user asks for "an S3 bucket", the output must have 2 EC2s AND the S3 bucket.
`;

export async function POST(req: Request) {
    try {
        // 👇 Hum ab 'currentState' bhi accept kar rahe hain fix karne ke liye
        const { prompt, currentState } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // AI ko Context dene ke liye message taiyar karna
        let userMessage = `User Request: "${prompt}"`;
        
        if (currentState && currentState.nodes && currentState.nodes.length > 0) {
            userMessage += `\n\nCURRENT ARCHITECTURE STATE (Do not remove these unless asked):\n${JSON.stringify(currentState)}`;
        } else {
            userMessage += `\n\nCreate a new architecture from scratch.`;
        }

        let resultJSON = null;

        // --- STRATEGY: TRY GROQ FIRST (FAST) ---
        try {
            if (!GROQ_API_KEY) throw new Error("Groq Key missing");

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.2,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content;
            if (content) {
                resultJSON = JSON.parse(content);
            }

        } catch (groqError: any) {
            console.error("Groq Failed, switching to Gemini:", groqError.message);

            // --- FALLBACK: GEMINI (SMART) ---
            try {
                if (!GEMINI_API_KEY) throw new Error("Gemini Key missing");

                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(SYSTEM_PROMPT + "\n\n" + userMessage);
                const response = result.response;
                let text = response.text();

                // Clean up Gemini Markdown
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                resultJSON = JSON.parse(text);

            } catch (geminiError: any) {
                throw new Error(`All AI Models Failed. Please check API Keys.`);
            }
        }

        return NextResponse.json(resultJSON);

    } catch (error: any) {
        console.error("Generation Error:", error.message);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}