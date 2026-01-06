from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# --- 1. NODE STRUCTURE ---
# Har ek dabbe (Node) ke paas kya hona zaroori hai?
class CloudNode(BaseModel):
    id: str = Field(..., description="Unique ID for the node (e.g., 'ec2-1')")
    label: str = Field(..., description="Name of the service (e.g., 'Web Server')")
    type: str = Field("cloudNode", description="React Flow node type")
    provider: Literal["aws", "azure", "gcp"] = Field("aws", description="Cloud Provider")
    serviceType: str = Field(..., description="Specific service (e.g., 'EC2', 'S3', 'RDS')")

# --- 2. EDGE STRUCTURE ---
# Nodes aapas me kaise jude hain?
class CloudEdge(BaseModel):
    id: str
    source: str = Field(..., description="ID of the starting node")
    target: str = Field(..., description="ID of the ending node")

# --- 3. MASTER JSON STRUCTURE (The Heart) ---
# Ye wo file hai jo Agents padhenge aur update karenge
class ArchitectureState(BaseModel):
    summary: str = Field(..., description="One line explanation of the architecture")
    nodes: List[CloudNode] = Field(default_factory=list)
    edges: List[CloudEdge] = Field(default_factory=list)
    terraform_code: str = Field("", description="Generated Terraform HCL code")

# --- 4. REQUEST BODIES ---
# User API ko kya bhejega?

# Case A: Naya Prompt (Your Job)
class PromptRequest(BaseModel):
    prompt: str

# Case B: Code Update (Friend's Job)
class CodeSyncRequest(BaseModel):
    current_state: ArchitectureState # Purana JSON
    updated_code: str               # Naya Code jo user ne edit kiya

# Case C: Visual Update (Friend's Job)
class VisualSyncRequest(BaseModel):
    current_state: ArchitectureState # Purana JSON
    updated_nodes: List[CloudNode]   # Naye Nodes jo user ne drag kiye
    updated_edges: List[CloudEdge]