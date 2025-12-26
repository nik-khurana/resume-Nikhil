import os
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from resume_context import SYSTEM_PROMPT

load_dotenv()

app = Flask(__name__)

# Configure Gemini API
# Expects GEMINI_API_KEY in .env or environment variables
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

# Initialize the model
model = genai.GenerativeModel('gemini-1.5-flash')
chat_session = model.start_chat(history=[
    {"role": "user", "parts": [SYSTEM_PROMPT]},
    {"role": "model", "parts": ["Understood. I am Nikhil Khurana. I am ready to answer questions about my experience and fit for the OpenAI Residency."]}
])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Send message to Gemini
        response = chat_session.send_message(user_message)
        
        return jsonify({
            "response": response.text
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
