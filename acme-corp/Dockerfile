FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente de ACME Corp
COPY . .

# Exponer el puerto del servidor ACME Corp
EXPOSE 9000

# Iniciar servidor FastAPI/Uvicorn
CMD ["python", "run.py"]
