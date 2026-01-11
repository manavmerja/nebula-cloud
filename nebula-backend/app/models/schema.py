from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# --- 1. NODE STRUCTURE ---
class CloudNode(BaseModel):
    id: str = Field(..., description="Unique ID for the node (e.g., 'ec2-1')")
    label: str = Field(..., description="Name of the service (e.g., 'Web Server')")
    type: str = Field("cloudNode", description="React Flow node type")
    provider: Literal["aws", "azure", "gcp"] = Field("aws", description="Cloud Provider")
    serviceType: str = Field(..., description="Specific service (e.g., 'EC2', 'S3', 'RDS')")

# --- 2. EDGE STRUCTURE ---
class CloudEdge(BaseModel):
    id: str
    source: str = Field(..., description="ID of the starting node")
    target: str = Field(..., description="ID of the ending node")

# --- 3. MASTER JSON STRUCTURE (The Heart) ---
class ArchitectureState(BaseModel):
    summary: str = Field(..., description="One line explanation of the architecture")
    nodes: List[CloudNode] = Field(default_factory=list)
    edges: List[CloudEdge] = Field(default_factory=list)
    terraform_code: str = Field("", description="Generated Terraform HCL code")

# --- 4. REQUEST BODIES ---
class PromptRequest(BaseModel):
    prompt: str


class CodeSyncRequest(BaseModel):
    current_state: ArchitectureState 
    updated_code: str               

class VisualSyncRequest(BaseModel):
    current_state: ArchitectureState 
    updated_nodes: List[CloudNode]   
    updated_edges: List[CloudEdge]