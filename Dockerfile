# 1. Python Image
FROM python:3.11-slim

# 2. Working directory
WORKDIR /code

# 3. Requirements copy karo (Ye sahi hai, isko mat chhedna)
COPY ./nebula-backend/requirements.txt /code/requirements.txt

# 4. Install karo (ye bhi sahi hai)
# Yaha humne fastapi aur uvicorn add kar diya hai, jo pichli baar missing tha
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# ==========================================
# 5. CODE COPY FIX (YAHA CHANGE HAI)
# ==========================================
# Pehle hum pura nebula-backend utha rahe the.
# Ab hum seedha andar wala 'app' folder uthayenge.
# Source: ./nebula-backend/app (Repo me andar wala folder)
# Dest:   /code/app            (Container me main folder)
COPY ./nebula-backend/app /code/app

# 6. Start Command
# Ab structure hoga: /code/app/main.py
# To 'app.main' command sahi chalegi
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
