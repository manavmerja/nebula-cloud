from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class ProjectSchema(BaseModel):
    user_email: str
    name: str
    description: Optional[str] = None
    
    nodes: List[Dict[str, Any]] 
    edges: List[Dict[str, Any]]
    
    terraform_code: str
    cost_estimate: Optional[str] = "Calculating..."
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "user_email": "manav@example.com",
                "name": "My First Cloud",
                "nodes": [],
                "edges": [],
                "terraform_code": ""
            }
        }