# 1. Python Image uthao
FROM python:3.11-slim

# 2. Working directory set karo
WORKDIR /code

# 3. Requirements file copy karo
COPY ./requirements.txt /code/requirements.txt

# 4. Libraries install karo
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 5. Pura code copy karo
COPY ./app /code/app

# 6. Server start karne ki command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]