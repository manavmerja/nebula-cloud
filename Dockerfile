# 1. Python Image
FROM python:3.11-slim

# 2. Working directory set karo
WORKDIR /code

# 3. Requirements file copy karo (Folder ka naam dhyan se check karna)
# Hum 'nebula-backend' folder se requirements utha rahe hain
COPY ./nebula-backend/requirements.txt /code/requirements.txt

# 4. Libraries install karo
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 5. Pura 'nebula-backend' folder copy karo aur container me 'app' naam dedo
COPY ./nebula-backend /code/app

# 6. Server start command
# Ye command ab '/code/app' folder ke andar 'main.py' file dhoondegi
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]


