from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEndpoint
from app.core.config import settings

# --- 1. GROQ MODEL (Fast & Smart) ---
def get_groq_model():
    """
    Returns the Groq Llama-3 model.
    Fastest inference, best for JSON structure.
    """
    if not settings.GROQ_API_KEY:
        return None
        
    return ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile", # Powerful model
        temperature=0.2,              # Kam creativity, zyada accuracy
        max_tokens=4096
    )

# --- 2. HUGGING FACE MODEL (The Backup/Open Source) ---
def get_hf_model():
    """
    Returns a model hosted on Hugging Face Inference API.
    Used if Groq is down or for specific open-source models.
    """
    if not settings.HF_TOKEN:
        return None

    # Hum 'Mistral-7B' use kar rahe hain kyunki ye free API me fast hai
    repo_id = "mistralai/Mistral-7B-Instruct-v0.3"
    
    return HuggingFaceEndpoint(
        repo_id=repo_id,
        huggingfacehub_api_token=settings.HF_TOKEN,
        temperature=0.3,
        max_new_tokens=4096
    )

# --- 3. SMART ROUTER ---
def get_best_available_model():
    """
    Priority: Groq -> HuggingFace -> None
    """
    try:
        model = get_groq_model()
        if model:
            print("✅ Using Groq (Llama-3)")
            return model
    except Exception as e:
        print(f"⚠️ Groq failed initialization: {e}")

    try:
        print("🔄 Switching to Hugging Face...")
        model = get_hf_model()
        if model:
            return model
    except Exception as e:
        print(f"❌ Hugging Face also failed: {e}")
    
    raise Exception("No AI models available! Check API Keys.")