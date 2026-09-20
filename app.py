from flask import Flask, request, jsonify, send_file
import json
import re
from datetime import datetime

app = Flask(__name__)

MEMORY_FILE = "memory.json"


def load_memory():

    try:

        with open(
            MEMORY_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            return json.load(f)

    except (
        FileNotFoundError,
        json.JSONDecodeError
    ):

        return {}


answers = load_memory()


def clean_message(message):

    message = message.lower().strip()

    message = re.sub(
        r"[^\w\s]",
        "",
        message
    )

    message = " ".join(
        message.split()
    )

    return message


def save_memory():

    with open(
        MEMORY_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            answers,
            f,
            ensure_ascii=False,
            indent=4
        )


def ai_reply(message):

    message = clean_message(message)

    if message == "":
        return "Kuch likho bhai 😄"

    if message in answers:

        saved = answers[message]

        if isinstance(saved, dict):
            return saved["answer"]

        return saved

    if message in [
        "hello",
        "hlo",
        "hi"
    ]:

        return (
            "Hello bhai! 👋 "
            "Main Zarvis hoon."
        )

    if message == "tumhara naam kya hai":

        return (
            "Mera naam Zarvis hai. 🤖"
        )

    if message == "who are you":

        return (
            "Main tumhara AI "
            "assistant Zarvis hoon."
        )

    return None


@app.route("/")
def home():

    return send_file(
        "index.html"
    )


@app.route(
    "/chat",
    methods=["POST"]
)
def chat():

    data = request.get_json()

    message = data.get(
        "message",
        ""
    ).strip()

    answer = ai_reply(message)

    if answer is None:

        return jsonify({

            "known": False,

            "reply":
            "Mujhe iska answer abhi nahi pata 😕"

        })

    return jsonify({

        "known": True,

        "reply": answer

    })


@app.route(
    "/teach",
    methods=["POST"]
)
def teach():

    global answers

    data = request.get_json()

    question = data.get(
        "question",
        ""
    ).strip()

    new_answer = data.get(
        "answer",
        ""
    ).strip()

    if (
        question == "" or
        new_answer == ""
    ):

        return jsonify({

            "success": False,

            "reply":
            "Question aur answer dono chahiye."

        })

    question = clean_message(
        question
    )

    answers[question] = {

        "answer": new_answer,

        "learned_at":
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

    }

    save_memory()

    return jsonify({

        "success": True,

        "reply":
        "Thanks bhai! 🧠 "
        "Maine ye baat yaad kar li."

    })


app.run(
    host="127.0.0.1",
    port=5000,
    debug=True
)