import { NextResponse } from 'next/server';
import { runSyncerAgent } from '../generate/agents/syncer';

export async function POST(req: Request) {
    try {
        // 👇 Receive 'edges' also
        const { terraformCode, nodes, edges } = await req.json();

        if (!nodes) {
            return NextResponse.json({ error: "Missing nodes data" }, { status: 400 });
        }

        // 🛑 HANDLE EMPTY CANVAS (Delete All Logic)
        if (nodes.length === 0) {
            console.log("🧹 Canvas is empty. Clearing Terraform code...");
            return NextResponse.json({
                summary: "All resources removed from the visual canvas.",
                terraformCode: "" 
            });
        }

        console.log("🔄 SYNC AGENT ACTIVATED...");
        console.log(`Analyzing ${nodes.length} Visual Nodes & ${edges?.length || 0} Edges...`);

        // 👇 Pass edges to the Agent
        const syncResult = await runSyncerAgent(terraformCode, nodes, edges);

        if (!syncResult || !syncResult.terraformCode) {
            throw new Error("Syncer failed to generate code.");
        }

        return NextResponse.json(syncResult);

    } catch (error: any) {
        console.error("🔥 SYNC API ERROR:", error.message);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}