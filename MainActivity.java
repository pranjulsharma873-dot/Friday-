const STORAGE_KEY = "zarvis_memory";

const DEFAULT_MEMORY = {
    "mai kon hu": {
        "answer": "pranjul",
        "learned_at": "2026-09-06 15:33:42"
    },

    "tum kon ko": {
        "answer": "tum zarvis",
        "learned_at": "2026-09-06 15:34:10"
    }
};

function loadMemory() {

    try {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) {
            return JSON.parse(raw);
        }

    } catch (e) {
        console.log("memory load error", e);
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_MEMORY)
    );

    return JSON.parse(
        JSON.stringify(DEFAULT_MEMORY)
    );
}

function saveMemory(memory) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(memory)
        );

    } catch (e) {

        console.log(
            "memory save error",
            e
        );

    }
}

let answers = loadMemory();

function cleanMessage(message) {

    message = message.toLowerCase().trim();

    message = message.replace(
        /[^\w\s]/g,
        ""
    );

    message = message
        .split(/\s+/)
        .filter(Boolean)
        .join(" ");

    return message;
}

function aiReply(rawMessage) {

    const message = cleanMessage(rawMessage);

    if (message === "") {

        return {
            known: true,
            reply: "Kuch likho bhai 😄"
        };

    }

    if (
        Object.prototype.hasOwnProperty.call(
            answers,
            message
        )
    ) {

        const saved = answers[message];

        const text =
            (typeof saved === "object" &&
             saved !== null)
            ? saved.answer
            : saved;

        return {
            known: true,
            reply: text
        };

    }

    if (
        ["hello", "hlo", "hi"].includes(message)
    ) {

        return {
            known: true,
            reply: "Hello bhai! 👋 Main Zarvis hoon."
        };

    }

    if (
        message === "tumhara naam kya hai"
    ) {

        return {
            known: true,
            reply: "Mera naam Zarvis hai. 🤖"
        };

    }

    if (
        message === "who are you"
    ) {

        return {
            known: true,
            reply:
            "Main tumhara AI assistant Zarvis hoon."
        };

    }

    return {
        known: false,
        reply:
        "Mujhe iska answer abhi nahi pata 😕"
    };
}

function teachAnswer(question, newAnswer) {

    question = question.trim();
    newAnswer = newAnswer.trim();

    if (
        question === "" ||
        newAnswer === ""
    ) {

        return {
            success: false,
            reply:
            "Question aur answer dono chahiye."
        };

    }

    const cleanedQuestion =
        cleanMessage(question);

    answers[cleanedQuestion] = {

        answer: newAnswer,

        learned_at:
            new Date().toLocaleString()

    };

    saveMemory(answers);

    return {
        success: true,
        reply:
        "Thanks bhai! 🧠 Maine ye baat yaad kar li."
    };
}

function handleEnter(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

}

function newChat() {

    document.getElementById(
        "messages"
    ).innerHTML = `

        <div class="message ai">

            <div class="avatar">
                🤖
            </div>

            <div class="text">
                Hello 👋<br>
                Main tumhara AI assistant hoon.
            </div>

        </div>

    `;
}

function sendMessage() {

    let input =
        document.getElementById("input");

    let message =
        input.value.trim();

    if (message === "") {
        return;
    }

    let messages =
        document.getElementById("messages");

    messages.innerHTML += `

        <div class="message user">

            <div class="text">
                ${message}
            </div>

            <div class="avatar">
                👤
            </div>

        </div>

    `;

    input.value = "";

    messages.scrollTop =
        messages.scrollHeight;

    const data =
        aiReply(message);

    messages.innerHTML += `

        <div class="message ai">

            <div class="avatar">
                🤖
            </div>

            <div class="text">

                ${data.reply}

                ${
                    data.known
                    ? ""
                    : `

                    <br><br>

                    <button
                        onclick="teachAI('${message.replace(/'/g, "\\'")}')"
                        style="
                            padding:8px 12px;
                            border:none;
                            border-radius:8px;
                            background:#10a37f;
                            color:white;
                            cursor:pointer;
                        "
                    >
                        🧠 Mujhe Sikhao
                    </button>

                    `
                }

            </div>

        </div>

    `;

    messages.scrollTop =
        messages.scrollHeight;
}

function teachAI(question) {

    let answer =
        prompt(
            "Zarvis ko iska answer sikhao:"
        );

    if (
        answer === null ||
        answer.trim() === ""
    ) {
        return;
    }

    const data =
        teachAnswer(
            question,
            answer
        );

    let messages =
        document.getElementById(
            "messages"
        );

    messages.innerHTML += `

        <div class="message ai">

            <div class="avatar">
                🤖
            </div>

            <div class="text">
                ${data.reply}
            </div>

        </div>

    `;

    messages.scrollTop =
        messages.scrollHeight;
}