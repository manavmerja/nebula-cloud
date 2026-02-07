import { callAIModel } from './config';

const SYNCER_PROMPT = `
You are a Terraform Synchronization Engine.
Your goal is to UPDATE existing Terraform code to match a new Visual Topology.

### INPUTS:
1. **CURRENT CODE:** Existing Terraform HCL.
2. **VISUAL NODES:** List of resources.
3. **VISUAL EDGES:** Connections (e.g., EC2 -> RDS).

### 🛑 CRITICAL RULES:
1. **NO DUPLICATES:** If a resource (e.g. "aws_instance.main") exists, UPDATE it. Do NOT create a copy.
2. **HANDLE CONNECTIONS:**
   - If Visual Edge exists ("EC2" -> "RDS"):
     - Add security group rules.
     - Add 'tags' to source: \`tags = { Nebula_Connect = "TARGET_NAME" }\`
3. **CLEAN OUTPUT:**
   - Return ONLY valid HCL code inside the JSON.
   - Do NOT include markdown formatting.

### ⚠️ STRICT OUTPUT FORMAT (JSON ONLY):
You must return a raw JSON object. Do NOT wrap it in markdown code blocks (e.g. \`\`\`json).
Structure:
{
  "summary": "Brief summary of changes...",
  "terraformCode": "resource \"aws_instance\" \"...\" { ... }"
}
`;

export async function runSyncerAgent(currentCode: string, visualNodes: any[], visualEdges: any[]) {
    
    // Simplify for AI (Reduce Token Cost)
    const simplifiedNodes = visualNodes.map(n => ({
        id: n.id,
        label: n.data?.label || "Unknown",
        type: n.data?.serviceType || "generic"
    }));

    const simplifiedEdges = (visualEdges || []).map(e => ({
        from: e.source,
        to: e.target
    }));

    const userMessage = `
### CURRENT TERRAFORM CODE:
${currentCode || "# No existing code"}

### NEW VISUAL TOPOLOGY:
Nodes: ${JSON.stringify(simplifiedNodes, null, 2)}
Edges: ${JSON.stringify(simplifiedEdges, null, 2)}

Please SYNC the Terraform code.

⚠️ CRITICAL: Return the response in RAW JSON format only. Do NOT use markdown backticks.
`;

    // AgentType 'SYNC'
    return await callAIModel(SYNCER_PROMPT, userMessage, 'SYNC');
}