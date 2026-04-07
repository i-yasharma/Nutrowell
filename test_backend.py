import requests
try:
    r = requests.post("http://127.0.0.1:5000/api/generate-plan", 
                     json={"prompt": "test"}, 
                     timeout=5)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")
