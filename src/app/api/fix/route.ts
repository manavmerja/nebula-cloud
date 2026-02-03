import { NextResponse } from 'next/server';
import { callAIModel, AgentType } from '../generate/agents/config';

const FIXER_PROMPT = `
You are a Senior DevOps Engineer & Security Expert.
Your task is to FIX or SYNC the provided Terraform code based on the Audit Report.

### 🛡️ FIXING RULES:

1. **SSH (Port 22):** - If Audit says "SSH open to world": 
   - **DO NOT** change CIDR to a fake IP (like 192.0.2.1).
   - **INSTEAD:** Add a comment: \`# WARNING: Restrict to your IP (e.g. x.x.x.x/32)\` but keep \`0.0.0.0/0\` for now so the user isn't locked out.

2. **DATABASES / PRIVATE INSTANCES:**
   - If Audit says "Database Public Access":
   - **FIX IT:** Change Ingress to allow ONLY specific Security Groups (e.g. Web SG).

3. **HARDCODED AZs:**
   - **FIX IT:** Use \`data "aws_availability_zones" "available"\` and reference \`names[0]\`, \`names[1]\`.

4. **MISSING PLUMBING:**
   - Ensure Route Tables, IGW, and NAT Gateways exist if needed.

### CRITICAL RULES:
1. **RETURN ONLY CODE & SUMMARY.**
2. Ensure the Terraform code is VALID HCL.

### OUTPUT FORMAT (JSON ONLY):
{
  "summary": "Fixed Database security and used dynamic Availability Zones. Left SSH open for testing (added warning).",
  "terraformCode": "..."
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