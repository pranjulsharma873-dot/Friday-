```python
# brain.py
# Zarvis AI Brain — No API Key Required

import re
from plugins import calculate, get_current_time

MEMORY = {}

def remember(session_id, message):
    MEMORY.setdefault(session_id, {})
    text = message.strip()

    match = re.search(
        r"\bmy name is\s+([a-zA-Z][a-zA-Z -]{0,40})",
        text,
        re.IGNORECASE
    )

    if match:
        name = match.group(1).strip().title()
        MEMORY[session_id]["name"] = name
        return f"Nice to meet you, {name}!"

    match = re.search(
        r"\bremember that\s+(.+)",
        text,
        re.IGNORECASE
    )

    if match:
        note = match.group(1).strip()
        MEMORY[session_id].setdefault("notes", []).append(note)
        return f"I'll remember: {note}"

    if any(x in text.lower() for x in [
        "what is my name",
        "what's my name",
        "mera naam kya",
        "do you know my name"
    ]):
        name = MEMORY[session_id].get("name")
        return f"Your name is {name}." if name else (
            "You haven't told me your name yet."
        )

    if any(x in text.lower() for x in [
        "what do you remember",
        "what did i ask you to remember",
        "maine kya yaad"
    ]):
        notes = MEMORY[session_id].get("notes", [])
        return "; ".join(notes) if notes else "Nothing remembered yet."

    return None

def think(message, session_id="default"):
    text = (message or "").strip()
    low = text.lower()

    if not text:
        return "Tell me something and I'll try to help."

    memory_reply = remember(session_id, text)

    if memory_reply:
        return memory_reply

    if re.search(r"\b(hi|hello|hey|namaste)\b", low):
        name = MEMORY[session_id].get("name", "")
        return (
            f"Hello {name}! I'm Zarvis. How can I help you?"
            if name else
            "Hello! I'm Zarvis. How can I help you?"
        )

    if any(x in low for x in [
        "who are you",
        "what are you",
        "tum kaun",
        "apna naam"
    ]):
        return (
            "I'm Zarvis, your personal rule-based assistant. "
            "I can calculate, tell the time, and remember simple notes."
        )

    if any(x in low for x in [
        "help",
        "what can you do",
        "kya kar sakte",
        "commands"
    ]):
        return (
            "I can calculate maths, tell the current time, "
            "remember your name, and save simple notes during this session."
        )

    if any(x in low for x in [
        "time",
        "samay",
        "kitne baje",
        "date",
        "tarikh",
        "aaj kya din"
    ]):
        return "Current time: " + get_current_time("Asia/Kolkata")

    if any(x in low for x in [
        "calculate",
        "solve",
        "kitna hota",
        "plus",
        "minus",
        "multiply",
        "divide"
    ]):
        expression = text.lower()

        replacements = {
            "calculate": "",
            "solve": "",
            "what is": "",
            "kitna hota hai": "",
            "kitna hota": "",
            "please": "",
            "plus": "+",
            "minus": "-",
            "multiply": "*",
            "divided by": "/",
            "divide by": "/",
            "×": "*",
            "÷": "/"
        }

        for word, symbol in replacements.items():
            expression = expression.replace(word, symbol)

        expression = re.sub(r"[^0-9.+*/()%-]", "", expression)

        if expression and re.search(r"\d", expression):
            return "The answer is " + calculate(expression)

        return "Try: calculate 25 * 4 + 10"

    if any(x in low for x in [
        "thank you",
        "thanks",
        "shukriya",
        "dhanyawad"
    ]):
        return "You're welcome!"

    if any(x in low for x in [
        "bye",
        "goodbye",
        "phir milenge"
    ]):
        return "Goodbye! Zarvis signing off."

    return (
        "I don't know how to answer that yet. "
        "Try saying 'help' to see what I can do."
    )
```
