import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

# ============================
# SETUP
# ============================

app = Flask(__name__)
CORS(app)  # Allows your GitHub Pages frontend to call this backend

# Read the API key from an environment variable (never hardcode it in code)
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# System prompt defines FRIDAY's personality
SYSTEM_PROMPT = (
    "You are FRIDAY, a helpful, friendly voice assistant. "
    "Keep answers concise and conversational, since replies "
    "are also spoken aloud to the user."
)

# In-memory conversation history (resets when server restarts).
# Keyed by a simple session id sent from the frontend.
conversations = {}


# ============================
# ROUTES
# ============================

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "FRIDAY AI backend is running"})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}

    user_message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Get or start this session's conversation history
    history = conversations.get(session_id, [
        {"role": "system", "content": SYSTEM_PROMPT}
    ])

    history.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",   # fast + inexpensive; use "gpt-4o" for higher quality
            messages=history,
            max_tokens=300,
        )

        reply_text = response.choices[0].message.content.strip()

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    history.append({"role": "assistant", "content": reply_text})

    # Keep history from growing forever (last 20 messages + system prompt)
    if len(history) > 21:
        history = [history[0]] + history[-20:]

    conversations[session_id] = history

    return jsonify({"reply": reply_text})


@app.route("/vision", methods=["POST"])
def vision():
    data = request.get_json(silent=True) or {}

    image_base64 = data.get("image", "")
    question = data.get("message", "").strip() or "What do you see in this image? Describe it briefly."
    session_id = data.get("session_id", "default")

    if not image_base64:
        return jsonify({"error": "No image provided"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # supports vision
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": question},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                        }
                    ]
                }
            ],
            max_tokens=300,
        )

        reply_text = response.choices[0].message.content.strip()

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Add this exchange to the session's normal text history too,
    # so follow-up questions have context
    history = conversations.get(session_id, [
        {"role": "system", "content": SYSTEM_PROMPT}
    ])
    history.append({"role": "user", "content": "[Sent a photo] " + question})
    history.append({"role": "assistant", "content": reply_text})
    conversations[session_id] = history

    return jsonify({"reply": reply_text})


@app.route("/reset", methods=["POST"])
def reset():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id", "default")
    conversations.pop(session_id, None)
    return jsonify({"status": "conversation reset"})


# ============================
# ENTRY POINT
# ============================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
