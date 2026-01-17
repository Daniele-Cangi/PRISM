FROM mcr.microsoft.com/playwright/python:v1.57.0-jammy

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install lxml

COPY server.py .
COPY phantom_scraper.py .

EXPOSE 8001

CMD ["python", "server.py"]
