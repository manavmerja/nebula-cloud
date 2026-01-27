import { NextResponse } from 'next/server';
// 👇 Change 1: 'AgentType' ko bhi import karein
import { callAIModel, AgentType } from '../generate/agents/config';

// --- 🧠 AGENT C: THE FIXER ---
// ... imports

const FIXER_PROMPT = `
You are a Senior DevOps Engineer & Security Expert.
Your task is to FIX or SYNC the provided Terraform code.

### MODE: FIXING
If audit report contains errors:
1. Fix security risks (0.0.0.0/0 -> 10.0.0.0/16).
2. Fix public S3 buckets.

### MODE: SYNC / INCREMENTAL UPDATE (CRITICAL)
If message says "SYNC_REQUEST_INCREMENTAL":
1. **Analyze Topology:** Look at the provided "TOPOLOGY_DATA" (Nodes/Edges).
2. **Analyze Code:** Look at the "BAD TERRAFORM CODE" (Existing State).
3. **DIFF ACTION:**
   - **ADD:** If a node exists in Topology but NOT in Code -> Generate resource.
   - **REMOVE:** If a resource exists in Code but NOT in Topology -> Remove resource.
   - **UPDATE:** If connections changed -> Update IDs/Refs.
   - **KEEP:** Do NOT change unrelated resources (e.g. providers, variables).

### OUTPUT FORMAT (JSON ONLY):
{
  "summary": "Added S3 bucket and connected to EC2.",
  "nodes": [ ...full updated list... ],
  "edges": [ ...full updated list... ],
  "terraformCode": "..."
}
`;

export async function POST(req: Request) {
    try {
        const { terraformCode, auditReport } = await req.json();

        // Basic Validation
        if (!terraformCode || !auditReport) {
            return NextResponse.json({ error: 'Missing code or audit report' }, { status: 400 });
        }

        const userMessage = `
### BAD TERRAFORM CODE:
${terraformCode}

### AUDIT REPORT (ISSUES TO FIX):
${JSON.stringify(auditReport)}

Please rewrite the code to fix these issues. 
IMPORTANT: Generate valid JSON. Don't leave out Subnets or Security Groups from the nodes list.
`;

        // 👇 Change 2: Safety Check for Array & Explicit Typing
        const isSyncRequest = Array.isArray(auditReport) && auditReport.some((r: any) => r.message?.includes('SYNC_REQUEST'));
        
        // 👇 Change 3: Define type explicitly
        const agentType: AgentType = isSyncRequest ? 'SYNC' : 'FIXER';

        console.log(`🔧 Fix Route called. Mode: ${agentType}`); // Debug log

        const fixedResult = await callAIModel(FIXER_PROMPT, userMessage, agentType);

        if (!fixedResult) {
            throw new Error("Failed to fix infrastructure.");
        }

        return NextResponse.json({
            ...fixedResult,
            auditReport: [] 
        });

    } catch (error: any) {
        console.error("Fixing Error:", error.message);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}