import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from plugins import PLUGIN_INFO
from brain import think, MEMORY

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "Zarvis AI is running",
        "api_key_required": False
    })


@app.route("/plugins", methods=["GET"])
def list_plugins():
    return jsonify({
        "plugins": PLUGIN_INFO
    })


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}

    message = data.get("message", "").strip()
    session_id = str(data.get("session_id", "default"))

    if not message:
        return jsonify({
            "error": "No message provided"
        }), 400

    try:
        reply = think(message, session_id)

        return jsonify({
            "reply": reply
        })

    except Exception:
        app.logger.exception("Zarvis brain error")

        return jsonify({
            "error": "Zarvis could not process your message."
        }), 500


@app.route("/vision", methods=["POST"])
def vision():
    return jsonify({
        "error": "Image understanding is unavailable in API-key-free mode."
    }), 501


@app.route("/reset", methods=["POST"])
def reset():
    data = request.get_json(silent=True) or {}
    session_id = str(data.get("session_id", "default"))

    MEMORY.pop(session_id, None)

    return jsonify({
        "status": "conversation reset"
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )