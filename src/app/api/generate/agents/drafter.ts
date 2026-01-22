import { callAIModel } from './config';

const DRAFTER_PROMPT = `
You are a Cloud Infrastructure Generator (Terraform).
Your goal is to generate Terraform code EXACTLY as requested by the user.

### CRITICAL RULES:
1. **VISUALIZE EVERYTHING (MANDATORY):** - You MUST generate "nodes" AND "edges" for the full topology.
   - **EDGES ARE REQUIRED:** Do not leave nodes floating. Connect VPC->Subnets->Instances.
   - Example Edge: { "id": "e1", "source": "vpc-1", "target": "subnet-1" }

2. **TERRAFORM CODE FORMAT (STRICT):**
   - Return valid **HCL string** with newlines escaped.
   - NO JSON objects in the "terraformCode" field.

### LABELING RULES:
- VPC -> "VPC"
- Subnet -> "Public Subnet" / "Private Subnet"
- EC2 -> "EC2 Instance"
- RDS -> "RDS Database"
- Internet Gateway -> "Internet Gateway"
- Security Group -> "Security Group"

### OUTPUT FORMAT (JSON ONLY):
{
  "summary": "Brief description.",
  "nodes": [ ... ],
  "edges": [ { "id": "e1", "source": "node1", "target": "node2" } ], 
  "terraformCode": "resource \"aws_vpc\" \"main\" {\\n  cidr_block = \"10.0.0.0/16\"\\n}"
}
`;

export async function runDrafterAgent(prompt: string, currentState: any) {
    let draftMessage = `User Request: "${prompt}"`;
    
    if (currentState && currentState.nodes && currentState.nodes.length > 0) {
        const contextNodes = currentState.nodes.map((n: any) => ({ 
            id: n.id, label: n.data?.label || n.label, type: n.type 
        }));
        draftMessage += `\n\nCURRENT STATE (Merge new resources with these):\n${JSON.stringify({ nodes: contextNodes })}`;
    } else {
        draftMessage += `\n\nStart from scratch.`;
    }

    const result = await callAIModel(DRAFTER_PROMPT, draftMessage, "Agent A (Drafter)");
    
    // Debugging Log to check Edges
    if (result) {
        console.log(`🔎 DRAFTER Stats: ${result.nodes?.length || 0} Nodes, ${result.edges?.length || 0} Edges.`);
    }

    return result;
}