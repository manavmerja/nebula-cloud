from fastapi import APIRouter, HTTPException
from app.models.schema import PromptRequest, ArchitectureState
from app.services.generator import generate_architecture_json
from app.models.schema import CodeSyncRequest, VisualSyncRequest 
from app.services.sync import sync_state_from_code, sync_state_from_visuals


router = APIRouter()

@router.post("/generate", response_model=ArchitectureState)
async def generate_cloud_architecture(request: PromptRequest):
    """
    Endpoint to convert User Text -> Cloud Architecture JSON
    """
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        # Call our AI Generator service
        result = await generate_architecture_json(request.prompt)
        
        if "error" in result:
             raise HTTPException(status_code=500, detail=result["error"])
             
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- NEW ROUTE: Jab User Code Edit kare ---
@router.post("/sync/code", response_model=ArchitectureState)
async def sync_visuals_from_code(request: CodeSyncRequest):
    """
    Input: Old JSON + New Code
    Output: Updated JSON (with new Nodes/Edges)
    """
    try:
        # Pydantic model se dict convert kar rahe hain
        current_state_dict = request.current_state.dict()
        
        result = await sync_state_from_code(
            current_state=current_state_dict,
            new_code=request.updated_code
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW ROUTE: Jab User Diagram Edit kare ---
@router.post("/sync/visual", response_model=ArchitectureState)
async def sync_code_from_visuals(request: VisualSyncRequest):
    """
    Input: Old JSON + New Nodes/Edges
    Output: Updated JSON (with new Terraform Code)
    """
    try:
        # Convert Pydantic list to python dict list
        nodes_dict = [n.dict() for n in request.updated_nodes]
        edges_dict = [e.dict() for e in request.updated_edges]
        
        result = await sync_state_from_visuals(
            nodes=nodes_dict,
            edges=edges_dict
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))