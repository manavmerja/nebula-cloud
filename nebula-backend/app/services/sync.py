from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.services.llm_engine import get_best_available_model
from app.models.schema import ArchitectureState, CloudNode, CloudEdge
from typing import List

# --- SETUP PARSER ---
# Hum chahte hain ki output wapas wahi Standard JSON format me aaye
parser = JsonOutputParser(pydantic_object=ArchitectureState)

# ==========================================
# AGENT 1: Code -> Visual (The Parser)
# ==========================================
CODE_SYNC_PROMPT = """
You are a Cloud DevOps Expert.
The user has MANUALLY updated the Terraform code. 
Your job is to synchronize the visual diagram (JSON) to match this new code.

OLD ARCHITECTURE SUMMARY: {summary}
NEW TERRAFORM CODE: 
{new_code}

INSTRUCTIONS:
1. Analyze the new Terraform code carefully.
2. Extract all resources as "nodes" (e.g., aws_instance -> EC2 Node).
3. Extract all relationships as "edges" (e.g., security group links).
4. Return the COMPLETE updated JSON object (ArchitectureState).
5. Keep the "terraform_code" field exactly as the user provided.

{format_instructions}
"""

async def sync_state_from_code(current_state: dict, new_code: str):
    model = get_best_available_model()
    
    prompt = PromptTemplate(
        template=CODE_SYNC_PROMPT,
        input_variables=["summary", "new_code"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | model | parser
    
    print("🔄 Syncing Visuals from Code...")
    result = await chain.ainvoke({
        "summary": current_state.get("summary", ""),
        "new_code": new_code
    })
    return result

# ==========================================
# AGENT 2: Visual -> Code (The Generator)
# ==========================================
VISUAL_SYNC_PROMPT = """
You are a Cloud Architect.
The user has MANUALLY updated the visual diagram (Nodes/Edges).
Your job is to regenerate the Terraform code to match this new structure.

NEW NODES: {nodes}
NEW EDGES: {edges}

INSTRUCTIONS:
1. Look at the new list of nodes and edges.
2. Generate valid Terraform HCL code that represents this infrastructure.
3. Update the "summary" to reflect the changes.
4. Return the COMPLETE updated JSON object.
5. Ensure the "nodes" and "edges" in the output match the input exactly.

{format_instructions}
"""

async def sync_state_from_visuals(nodes: List[dict], edges: List[dict]):
    model = get_best_available_model()
    
    prompt = PromptTemplate(
        template=VISUAL_SYNC_PROMPT,
        input_variables=["nodes", "edges"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | model | parser
    
    print("🔄 Syncing Code from Visuals...")
    result = await chain.ainvoke({
        "nodes": str(nodes),
        "edges": str(edges)
    })
    return result