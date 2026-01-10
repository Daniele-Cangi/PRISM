import requests
import json

url = "http://localhost:8000/analyze"
payload = {"url": "https://www.bbc.com/news/world-europe-68214811"}
headers = {"Content-Type": "application/json"}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, headers=headers, timeout=60)
    print(f"Status Code: {response.status_code}")
    print("Response Content:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
