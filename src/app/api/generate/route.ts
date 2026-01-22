import { NextResponse } from 'next/server';
import { runDrafterAgent } from './agents/drafter';
import { runAuditorAgent } from './agents/auditor';

export async function POST(req: Request) {
    try {
        // 1. Parse Input
        const body = await req.json();
        const { prompt, currentState } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log("🚀 Starting Architect Pipeline for:", prompt);

        // 2. Run Agent A (Drafter)
        const drafterResult = await runDrafterAgent(prompt, currentState);

        // 🛑 CRASH PROTECTION: Check if Drafter failed
        if (!drafterResult || !drafterResult.terraformCode) {
            console.error("❌ Agent A (Drafter) returned NULL or Invalid Data.");
            throw new Error("Failed to generate infrastructure. AI models are busy or prompt is too complex. Please try again.");
        }

        console.log("✅ Agent A (Drafter) Success. Nodes:", drafterResult.nodes?.length);

        // 3. Run Agent B (Auditor)
        // Note: We pass the HCL code to the auditor
        const auditorResult = await runAuditorAgent(drafterResult.terraformCode);
        
        console.log("✅ Agent B (Auditor) Success. Issues:", auditorResult?.auditReport?.length || 0);

        // 4. Return Final Response
        return NextResponse.json({
            ...drafterResult, // summary, nodes, edges, terraformCode
            auditReport: auditorResult?.auditReport || [] // Add audit data
        });

    } catch (error: any) {
        console.error("🔥 API ROUTE ERROR:", error.message);
        
        // Return JSON error instead of crashing (Prevents 'Unexpected end of JSON input')
        return NextResponse.json(
            { error: error.message || "Internal Server Error" }, 
            { status: 500 }
        );
    }
}