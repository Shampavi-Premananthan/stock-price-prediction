FROM python:3.11-slim

WORKDIR /app

ENV PIP_DEFAULT_TIMEOUT=1000
ENV PIP_RETRIES=10

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=${PIP_DEFAULT_TIMEOUT} --retries=${PIP_RETRIES} -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
