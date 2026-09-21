let recognition = null;
let isListening = false;

// ===============================
// SEND MESSAGE
// ===============================

function sendMessage() {

    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    const message = input.value.trim();

    if (message === "") return;

    // User message
    const userMessage = document.createElement("div");

    userMessage.className = "message user";

    userMessage.innerHTML = `
        <div class="avatar">👤</div>
        <div class="text">${escapeHTML(message)}</div>
    `;

    messages.appendChild(userMessage);

    input.value = "";

    messages.scrollTop = messages.scrollHeight;


    // Temporary AI reply
    setTimeout(function () {

        const aiMessage = document.createElement("div");

        aiMessage.className = "message ai";

        aiMessage.innerHTML = `
            <div class="avatar">🤖</div>
            <div class="text">
                Tumne kaha: ${escapeHTML(message)}
            </div>
        `;

        messages.appendChild(aiMessage);

        messages.scrollTop = messages.scrollHeight;

        // AI reply ko bolna
        speakText("Tumne kaha: " + message);

    }, 500);
}


// ===============================
// VOICE INPUT
// ===============================

function startListening() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert("Voice recognition tumhare browser me supported nahi hai.");

        return;
    }


    if (isListening) {

        recognition.stop();

        return;
    }


    recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";

    recognition.continuous = false;

    recognition.interimResults = false;


    const micButton =
        document.getElementById("micButton");


    recognition.onstart = function () {

        isListening = true;

        if (micButton) {
            micButton.innerHTML = "🔴";
        }
    };


    recognition.onresult = function (event) {

        const text =
            event.results[0][0].transcript;

        document.getElementById("input").value = text;

    };


    recognition.onerror = function (event) {

        console.log("Voice error:", event.error);

        if (micButton) {
            micButton.innerHTML = "🎙️";
        }

        isListening = false;
    };


    recognition.onend = function () {

        isListening = false;

        if (micButton) {
            micButton.innerHTML = "🎙️";
        }
    };


    recognition.start();
}


// ===============================
// TEXT TO SPEECH
// ===============================

function speakText(text) {

    if (!("speechSynthesis" in window)) {

        console.log("Speech synthesis supported nahi hai.");

        return;
    }


    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "hi-IN";

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}


// ===============================
// ENTER KEY
// ===============================

function handleEnter(event) {

    if (event.key === "Enter") {

        sendMessage();

    }
}


// ===============================
// NEW CHAT
// ===============================

function newChat() {

    const messages =
        document.getElementById("messages");

    messages.innerHTML = `
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


// ===============================
// SECURITY
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
        }
