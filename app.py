from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os

app = Flask(__name__)
CORS(app)

# API key environment variable se aayegi
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

# Zarvis ki personality
SYSTEM_PROMPT = """
You are Zarvis, a helpful personal AI assistant.

Rules:
- Understand Hindi, English and Hinglish.
- Reply naturally and clearly.
- Be friendly and conversational.
- Keep answers reasonably concise unless the user asks for detail.
- Remember the conversation provided in the current request.
"""

@app.route("/")
def home():
    return "Zarvis AI Backend is running."


@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({
                "error": "Message is empty"
            }), 400


        response = client.responses.create(

            model="gpt-5.6-luna",

            instructions=SYSTEM_PROMPT,

            input=user_message

        )


        answer = response.output_text


        return jsonify({
            "reply": answer
        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
            )
