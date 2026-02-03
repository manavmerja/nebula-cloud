import { NextResponse } from 'next/server';
import { callAIModel, AgentType } from '../generate/agents/config';

// --- AGENT C: THE FIXER ---
const FIXER_PROMPT = `
You are a Senior DevOps Engineer & Security Expert.
Your task is to FIX or SYNC the provided Terraform code.

### MODE: FIXING
If audit report contains errors:
1. Fix security risks (e.g., change 0.0.0.0/0 to specific IPs for Databases).
2. Ensure specific "Glue" resources exist (Route Tables, Target Attachments).

### MODE: SYNC / INCREMENTAL UPDATE
If message says "SYNC_REQUEST_INCREMENTAL":
1. Analyze Topology & Code.
2. Add/Remove/Update resources to match.

### CRITICAL RULES:
1. **DO NOT generate "nodes" or "edges" in the JSON.** We calculate visuals from the code automatically.
2. **RETURN ONLY CODE & SUMMARY.**
3. Ensure the Terraform code is VALID HCL.

### OUTPUT FORMAT (JSON ONLY):
{
  "summary": "Brief description of what you fixed (e.g. 'Added Route Tables and fixed SG rules').",
  "terraformCode": "resource \"aws_vpc\" \"main\" { ... }"
}
`;

export async function POST(req: Request) {
    try {
        const { terraformCode, auditReport } = await req.json();

        if (!terraformCode || !auditReport) {
            return NextResponse.json({ error: 'Missing code or audit report' }, { status: 400 });
        }

        const userMessage = `
### BAD TERRAFORM CODE:
${terraformCode}

### AUDIT REPORT (ISSUES TO FIX):
${JSON.stringify(auditReport)}

Please rewrite the code to fix these issues.
IMPORTANT: Return ONLY the fixed 'terraformCode' and a 'summary'. 
DO NOT RETURN NODES ARRAY.
`;

        const isSyncRequest = Array.isArray(auditReport) && auditReport.some((r: any) => r.message?.includes('SYNC_REQUEST'));
        const agentType: AgentType = isSyncRequest ? 'SYNC' : 'FIXER';

        const fixedResult = await callAIModel(FIXER_PROMPT, userMessage, agentType);

        if (!fixedResult || !fixedResult.terraformCode) {
            throw new Error("Failed to fix infrastructure.");
        }

        return NextResponse.json({
            ...fixedResult,
            // Nodes hum frontend pe 'useNebulaEngine' ke parser se banayenge
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