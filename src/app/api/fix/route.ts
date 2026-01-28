import { NextResponse } from 'next/server';
import { callAIModel, AgentType } from '../generate/agents/config';

// --- AGENT C: THE FIXER ---
const FIXER_PROMPT = `
You are a Senior DevOps Engineer & Security Expert.
Your task is to FIX or SYNC the provided Terraform code.

### MODE: FIXING
If audit report contains errors:
1. Fix security risks (0.0.0.0/0 -> 10.0.0.0/16).
2. Fix public S3 buckets.

### MODE: SYNC / INCREMENTAL UPDATE
If message says "SYNC_REQUEST_INCREMENTAL":
1. Analyze Topology & Code.
2. Add/Remove/Update resources to match.

### CRITICAL OUTPUT RULES (JSON ONLY):
1. **LABELS ARE MANDATORY:** Every node object MUST have a "label" field.
   - Correct: { "id": "vpc-1", "label": "VPC", "type": "cloudNode" }
   - Correct: { "id": "s3-1", "label": "S3 Bucket", "type": "cloudNode" }
   - WRONG: { "id": "vpc-1", "type": "cloudNode" } (Label missing!)
   
2. **USE STANDARD LABELS:** - Use "VPC", "Public Subnet", "Private Subnet", "EC2 Instance", "RDS Database", "S3 Bucket", "Internet Gateway", "Security Group".

### OUTPUT FORMAT:
{
  "summary": "Fixed security group rules.",
  "nodes": [ ... ],
  "edges": [ ... ],
  "terraformCode": "..."
}
`;

// ... (Rest of the file same as before) ...
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
IMPORTANT: Generate valid JSON. Don't leave out Subnets or Security Groups. 
ENSURE EVERY NODE HAS A 'label' PROPERTY.
`;

        const isSyncRequest = Array.isArray(auditReport) && auditReport.some((r: any) => r.message?.includes('SYNC_REQUEST'));
        const agentType: AgentType = isSyncRequest ? 'SYNC' : 'FIXER';

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