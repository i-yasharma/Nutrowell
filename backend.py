from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder=".")
CORS(app)  # Enable CORS for frontend requests

@app.route("/")
def landing():
    return send_from_directory(".", "Landing.html")

@app.route("/app")
def app_index():
    return send_from_directory(".", "Index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(".", path)

# Get your API key from https://openrouter.ai/keys
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "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")

@app.route('/api/generate-plan', methods=['POST'])
def generate_plan():
    data = request.json
    prompt = data.get("prompt")
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "meta-llama/llama-3.3-70b-instruct", # Or any other OpenRouter model
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
        )
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        return jsonify({"content": content})
        
    except Exception as e:
        error_details = response.text if 'response' in locals() else str(e)
        return jsonify({"error": str(e), "details": error_details}), 500

if __name__ == '__main__':
    print("Starting OpenRouter API server on http://127.0.0.1:5000")
    print("Make sure you install dependencies: pip install flask flask-cors requests")
    app.run(port=5000, debug=True)
