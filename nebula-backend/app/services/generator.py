from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.services.llm_engine import get_best_available_model
from app.models.schema import ArchitectureState

#1. SETUP PARSER 
parser = JsonOutputParser(pydantic_object=ArchitectureState)

#2. SETUP PROMPT 
PROMPT_TEMPLATE = """
You are an expert Cloud Architect and DevOps Engineer.
Your goal is to design a cloud architecture based on the user's request.

STRICT INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. The JSON must match the following structure exactly:
{format_instructions}

3. For "terraform_code", generate valid HCL code for the defined resources.
4. Use valid icons/serviceTypes (e.g., 'EC2', 'S3', 'RDS', 'Lambda', 'VPC').

USER REQUEST:
{prompt}

DESIGN THE ARCHITECTURE (JSON):
"""

prompt = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["prompt"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

#3. THE GENERATOR FUNCTION 
async def generate_architecture_json(user_prompt: str):
    """
    Main function called by API.
    Takes user prompt -> Returns Architecture JSON.
    """
    # 1. Get Model (Groq or HF)
    model = get_best_available_model()

    
    chain = prompt | model | parser

    try:
        print(f"🧠 Processing Prompt: {user_prompt}")
        result = chain.invoke({"prompt": user_prompt})
        
        return result

    except Exception as e:
        print(f"❌ Generation Error: {e}")
        
        return {
            "error": str(e),
            "summary": "AI failed to generate architecture.",
            "nodes": [],
            "edges": []
        }