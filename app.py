from flask import Flask, request, jsonify

app = Flask(__name__)


# ================================
# FRIDAY AI RESPONSE
# ================================

def friday_response(message):

    message = message.lower().strip()

    if "hello" in message or "hi" in message:
        return "Hello! I am FRIDAY. How can I help you?"

    elif "your name" in message:
        return "My name is FRIDAY AI."

    elif "how are you" in message:
        return "I am working perfectly."

    elif "time" in message:
        from datetime import datetime
        return "Current time is " + datetime.now().strftime("%I:%M %p")

    elif "date" in message:
        from datetime import datetime
        return "Today's date is " + datetime.now().strftime("%d-%m-%Y")

    elif "bye" in message:
        return "Goodbye! See you soon."

    else:
        return "I received your message: " + message


# ================================
# CHAT API
# ================================

@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    message = data.get("message", "")

    response = friday_response(message)

    return jsonify({
        "reply": response
    })


# ================================
# START SERVER
# ================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )