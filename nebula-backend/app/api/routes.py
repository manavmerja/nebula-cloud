from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any, Dict
from bson import ObjectId

# --- SERVICES IMPORT (Aapke existing logic) ---
from app.services.generator import generate_architecture_json
from app.services.sync import sync_state_from_code, sync_state_from_visuals

# --- MODELS IMPORT (Correct Location) ---
from app.core.database import get_database
from app.models.project import ProjectSchema  # <-- Database ke liye
# from app.models.schema import ArchitectureState # <-- AI ke liye (Agar zaroorat ho)

router = APIRouter()

# --- Request Models ---
class PromptRequest(BaseModel):
    prompt: str

class SyncRequest(BaseModel):
    current_state: Dict[str, Any]
    updated_nodes: List[Dict[str, Any]] = []
    updated_edges: List[Dict[str, Any]] = []

class CodeSyncRequest(BaseModel):
    current_state: Dict[str, Any]
    updated_code: str

# --- ROUTES ---

@router.post("/generate")
async def generate_architecture(request: PromptRequest):
    return await generate_architecture_json(request.prompt)

@router.post("/sync/visual")
async def sync_visual_to_code(request: SyncRequest):
    return await sync_state_from_visuals(request.updated_nodes, request.updated_edges)

@router.post("/sync/code")
async def sync_code_to_visual(request: CodeSyncRequest):
    return await sync_state_from_code(request.current_state, request.updated_code)

# --- SAVE PROJECT ROUTE (NEW) 💾 ---
@router.post("/projects/save")
async def save_project(project: ProjectSchema):
    try:
        db = get_database()
        collection = db["projects"]
        
        # Data dictionary mein convert karke save karo
        project_data = project.dict()
        result = await collection.insert_one(project_data)
        
        return {
            "message": "Project saved successfully!",
            "project_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- GET PROJECTS ROUTE (DASHBOARD) 📂 ---
@router.get("/projects/{user_email}")
async def get_user_projects(user_email: str):
    try:
        db = get_database()
        collection = db["projects"]
        
        # User ke projects fetch karo
        projects = await collection.find({"user_email": user_email}).to_list(length=100)
        
        # ID fix karo (ObjectId -> String)
        for p in projects:
            p["_id"] = str(p["_id"])
            
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


        # --- GET SINGLE PROJECT ROUTE (LOAD) 🔄 ---
@router.get("/project/{project_id}")
async def get_project(project_id: str):
    try:
        db = get_database()
        collection = db["projects"]

        # 1. String ID ko MongoDB ObjectId me convert karo
        try:
            obj_id = ObjectId(project_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid Project ID format")

        # 2. Database me dhoondo
        project = await collection.find_one({"_id": obj_id})

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # 3. ID ko wapis String banao (JSON bhejne ke liye)
        project["_id"] = str(project["_id"])

        return project

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


        # --- DELETE PROJECT ROUTE 🗑️ ---
@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    try:
        db = get_database()
        collection = db["projects"]

        # 1. ID Convert karo
        try:
            obj_id = ObjectId(project_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid Project ID")

        # 2. Delete Operation
        result = await collection.delete_one({"_id": obj_id})

        # 3. Check karo delete hua ya nahi
        if result.deleted_count == 1:
            return {"message": "Project deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Project not found")

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))