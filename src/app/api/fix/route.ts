import { NextResponse } from 'next/server';
// 👇 Change 1: 'AgentType' ko bhi import karein
import { callAIModel, AgentType } from '../generate/agents/config';

// --- 🧠 AGENT C: THE FIXER ---
const FIXER_PROMPT = `
You are a Senior DevOps Engineer & Security Expert.
Your task is to FIX the provided Terraform code based on the Audit Report warnings.

### PHASE 1: CODE FIXING
1. **Fix ONLY what is broken:** Do not add new resources unless necessary.
2. **Security Hardening:** - Change '0.0.0.0/0' to '10.0.0.0/16' or specific SG references.
   - Set 'publicly_accessible = false' for DBs.
   - Set 'acl = "private"' for S3.
3. **Cost:** Downgrade 'xlarge' -> 't3.medium'.

### PHASE 2: VISUALIZATION REGENERATION (CRITICAL)
You MUST regenerate the "nodes" and "edges" JSON based on your *FIXED* code.

### VISUALIZATION RULES (STRICT):
1. **INCLUDE ALL LAYERS:** You MUST create nodes for **Subnets** and **Security Groups** if they exist in the code. Do not simplify the map.
2. **INVENTORY CHECK:** - Code has 'aws_s3_bucket'? -> Create S3 Node.
   - Code has 'aws_subnet'? -> Create Subnet Node.
   - Code has 'aws_security_group'? -> Create Security Group Node.
3. **NO ORPHAN NODES:** - Connect VPC -> Subnets -> EC2/RDS.
   - Connect S3 to VPC (or Instance).
   - Connect IGW to VPC.

### OUTPUT FORMAT (JSON ONLY):
{
  "summary": "Fixed S3 bucket permissions and secured Database access.",
  "nodes": [ 
      { "id": "vpc-1", "label": "VPC", "type": "cloudNode", "data": { "serviceType": "VPC" } },
      { "id": "sub-1", "label": "Public Subnet", "type": "cloudNode", "data": { "serviceType": "Subnet" } },
      { "id": "ec2-1", "label": "Web Server", "type": "cloudNode", "data": { "serviceType": "EC2" } },
      { "id": "sg-1", "label": "Security Group", "type": "cloudNode", "data": { "serviceType": "Security Group" } }
  ],
  "edges": [
      { "id": "e1", "source": "vpc-1", "target": "sub-1" },
      { "id": "e2", "source": "sub-1", "target": "ec2-1" },
      { "id": "e3", "source": "sg-1", "target": "ec2-1" }
  ],
  "terraformCode": "resource \"aws_vpc\" \"main\" { ... }"
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