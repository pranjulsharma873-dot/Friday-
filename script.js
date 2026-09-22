// ============================================================
// FRIDAY AI - COMPLETE SCRIPT.JS
// ============================================================

"use strict";

// ============================================================
// ELEMENT REFERENCES
// ============================================================

const $ = (id) => document.getElementById(id);

const menuButton = $("menuButton");
const profileButton = $("profileButton");
const micButton = $("micButton");
const micStatus = $("micStatus");

const chatInput = $("chatInput");
const sendButton = $("sendButton");
const chatMessages = $("chatMessages");

const chatButton = $("chatButton");
const pluginsButton = $("pluginsButton");
const historyButton = $("historyButton");
const settingsButton = $("settingsButton");

const overlay = $("overlay");
const sideMenu = $("sideMenu");
const closeMenuButton = $("closeMenuButton");

const profileMenu = $("profileMenu");
const newChatButton = $("newChatButton");
const historyMenu = $("historyMenu");
const pluginsMenu = $("pluginsMenu");
const settingsMenu = $("settingsMenu");

const modal = $("modal");
const modalTitle = $("modalTitle");
const modalText = $("modalText");
const modalClose = $("modalClose");

const voiceModeButton = $("voiceModeButton");
const voiceMode = $("voiceMode");
const voiceOrb = $("voiceOrb");
const voiceModeStatus = $("voiceModeStatus");
const voiceModeMute = $("voiceModeMute");
const voiceModeClose = $("voiceModeClose");
const voiceModeMinimize = $("voiceModeMinimize");

const cameraButton = $("cameraButton");
const cameraMode = $("cameraMode");
const cameraVideo = $("cameraVideo");
const cameraCanvas = $("cameraCanvas");
const cameraStatus = $("cameraStatus");
const cameraCloseButton = $("cameraCloseButton");
const cameraFlipButton = $("cameraFlipButton");
const cameraCaptureButton = $("cameraCaptureButton");
const cameraQuestionInput = $("cameraQuestionInput");


// ============================================================
// CONFIGURATION
// ============================================================

// Agar Python Flask backend use karna hai:
// Example:
// const BACKEND_URL = "http://192.168.1.10:5000";

// Filhaal empty rakha hai.
// Empty hone par FRIDAY ka local brain chalega.
const BACKEND_URL = "";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let isListening = false;
let recognition = null;

let voiceModeActive = false;
let voiceMuted = false;
let voiceRecognition = null;

let cameraStream = null;
let currentFacingMode = "environment";

let objectDetectionModel = null;
let modelLoadingPromise = null;


// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognitionAPI =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognitionAPI) {

    recognition = new SpeechRecognitionAPI();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript.trim();

        if (chatInput) {
            chatInput.value = transcript;
        }

        sendMessage();
    };

    recognition.onerror = function (event) {

        console.log("Speech recognition error:", event.error);

        if (event.error === "not-allowed" ||
            event.error === "service-not-allowed") {

            if (micStatus) {
                micStatus.textContent =
                    "Microphone permission denied.";
            }

        } else if (event.error === "no-speech") {

            if (micStatus) {
                micStatus.textContent =
                    "No speech detected.";
            }

        } else {

            if (micStatus) {
                micStatus.textContent =
                    "Mic error: " + event.error;
            }
        }

        stopListening();
    };

    recognition.onend = function () {
        stopListening();
    };
}


// ============================================================
// START LISTENING
// ============================================================

async function startListening() {

    if (!recognition) {

        if (micStatus) {
            micStatus.textContent =
                "Speech recognition is not supported.";
        }

        return;
    }

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        if (micStatus) {
            micStatus.textContent =
                "Microphone access is not supported.";
        }

        return;
    }

    try {

        if (micStatus) {
            micStatus.textContent =
                "Requesting microphone permission...";
        }

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        stream.getTracks().forEach(track => {
            track.stop();
        });

        isListening = true;

        if (micButton) {
            micButton.classList.add("active");
        }

        if (micStatus) {
            micStatus.textContent = "Listening...";
        }

        recognition.start();

    } catch (error) {

        console.log(error);

        if (error.name === "NotAllowedError") {

            if (micStatus) {
                micStatus.textContent =
                    "Microphone permission denied.";
            }

        } else if (error.name === "NotFoundError") {

            if (micStatus) {
                micStatus.textContent =
                    "No microphone found.";
            }

        } else {

            if (micStatus) {
                micStatus.textContent =
                    "Microphone error.";
            }
        }

        stopListening();
    }
}


// ============================================================
// STOP LISTENING
// ============================================================

function stopListening() {

    isListening = false;

    if (micButton) {
        micButton.classList.remove("active");
    }

    if (micStatus) {
        micStatus.textContent =
            "Tap microphone to talk";
    }

    if (recognition) {

        try {
            recognition.stop();
        } catch (error) {
            // Already stopped
        }
    }
}


// ============================================================
// MICROPHONE BUTTON
// ============================================================

if (micButton) {

    micButton.addEventListener("click", function () {

        unlockSpeechSynthesis();

        if (isListening) {
            stopListening();
        } else {
            startListening();
        }

    });
}


// ============================================================
// TEXT TO SPEECH
// ============================================================

function speakText(text, onEnd) {

    if (!window.speechSynthesis) {

        if (onEnd) {
            onEnd();
        }

        return;
    }

    window.speechSynthesis.cancel();

    setTimeout(function () {

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang = "en-IN";
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (onEnd) {

            utterance.onend = onEnd;
            utterance.onerror = onEnd;
        }

        window.speechSynthesis.speak(utterance);

    }, 100);
}


// ============================================================
// UNLOCK SPEECH SYNTHESIS ON ANDROID
// ============================================================

function unlockSpeechSynthesis() {

    if (!window.speechSynthesis) {
        return;
    }

    try {

        const utterance =
            new SpeechSynthesisUtterance(" ");

        utterance.volume = 0;

        window.speechSynthesis.speak(
            utterance
        );

    } catch (error) {
        console.log(error);
    }
}


// ============================================================
// SIDE MENU
// ============================================================

function openMenu() {

    if (sideMenu) {
        sideMenu.classList.add("active");
    }

    if (overlay) {
        overlay.classList.add("active");
    }
}


function closeMenu() {

    if (sideMenu) {
        sideMenu.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }
}


if (menuButton) {
    menuButton.addEventListener(
        "click",
        openMenu
    );
}


if (closeMenuButton) {
    closeMenuButton.addEventListener(
        "click",
        closeMenu
    );
}


// ============================================================
// MODAL
// ============================================================

function openModal(title, text) {

    if (modalTitle) {
        modalTitle.textContent = title;
    }

    if (modalText) {
        modalText.textContent = text;
    }

    if (modal) {
        modal.classList.add("active");
    }

    if (overlay) {
        overlay.classList.add("active");
    }
}


function closeModal() {

    if (modal) {
        modal.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }
}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );
}


if (overlay) {

    overlay.addEventListener(
        "click",
        function () {

            closeMenu();
            closeModal();

        }
    );
}


// ============================================================
// PROFILE
// ============================================================

if (profileButton) {

    profileButton.addEventListener(
        "click",
        function () {

            openModal(
                "FRIDAY Profile",
                "FRIDAY AI - Your personal AI assistant."
            );

        }
    );
}


// ============================================================
// LOCAL FRIDAY BRAIN
// ============================================================

function randomItem(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];
}


function calculateMath(message) {

    let text = message
        .toLowerCase()
        .replace(/what is/g, "")
        .replace(/what's/g, "")
        .replace(/calculate/g, "")
        .replace(/solve/g, "")
        .replace(/plus/g, "+")
        .replace(/minus/g, "-")
        .replace(/times/g, "*")
        .replace(/multiplied by/g, "*")
        .replace(/divided by/g, "/")
        .trim();

    const match = text.match(
        /(-?\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(-?\d+(?:\.\d+)?)/
    );

    if (!match) {
        return null;
    }

    const a = parseFloat(match[1]);
    const operator = match[2];
    const b = parseFloat(match[3]);

    let result;

    switch (operator) {

        case "+":
            result = a + b;
            break;

        case "-":
            result = a - b;
            break;

        case "*":
            result = a * b;
            break;

        case "/":

            if (b === 0) {
                return "You cannot divide by zero.";
            }

            result = a / b;
            break;

        default:
            return null;
    }

    return `${a} ${operator} ${b} = ${result}`;
}


// ============================================================
// FRIDAY LOCAL RESPONSE
// ============================================================

function getLocalFridayReply(message) {

    const text =
        message.toLowerCase().trim();


    // -------------------------
    // GREETING
    // -------------------------

    if (
        /^(hi|hii+|hello+|hey+|namaste|yo)\b/
            .test(text)
    ) {

        return randomItem([
            "Hello! How can I help you?",
            "Hi! I'm FRIDAY. What can I do for you?",
            "Hey! I'm listening."
        ]);
    }


    // -------------------------
    // HOW ARE YOU
    // -------------------------

    if (
        text.includes("how are you")
    ) {

        return "I'm running smoothly. How are you?";
    }


    // -------------------------
    // NAME
    // -------------------------

    if (
        text.includes("your name") ||
        text.includes("who are you")
    ) {

        return "I'm FRIDAY, your personal AI assistant.";
    }


    // -------------------------
    // CREATOR
    // -------------------------

    if (
        text.includes("who made you") ||
        text.includes("who created you") ||
        text.includes("who built you")
    ) {

        return "I'm your custom-made FRIDAY AI assistant.";
    }


    // -------------------------
    // TIME
    // -------------------------

    if (
        text.includes("what time") ||
        text === "time" ||
        text.includes("current time")
    ) {

        const now = new Date();

        return "The current time is " +
            now.toLocaleTimeString();
    }


    // -------------------------
    // DATE
    // -------------------------

    if (
        text.includes("today's date") ||
        text.includes("today date") ||
        text === "date" ||
        text.includes("what date")
    ) {

        const now = new Date();

        return "Today is " +
            now.toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );
    }


    // -------------------------
    // MATH
    // -------------------------

    const mathAnswer =
        calculateMath(message);

    if (mathAnswer) {
        return mathAnswer;
    }


    // -------------------------
    // JOKE
    // -------------------------

    if (text.includes("joke")) {

        return randomItem([

            "Why did the computer go to the doctor? Because it caught a virus.",

            "Why do programmers prefer dark mode? Because light attracts bugs.",

            "Why don't robots panic? Because they have great byte control.",

            "I would tell you a UDP joke, but you might not get it."
        ]);
    }


    // -------------------------
    // THANKS
    // -------------------------

    if (
        text.includes("thank you") ||
        text.includes("thanks")
    ) {

        return randomItem([
            "You're welcome!",
            "Anytime!",
            "Happy to help!"
        ]);
    }


    // -------------------------
    // GOODBYE
    // -------------------------

    if (
        /\b(bye|goodbye|see you|good night)\b/
            .test(text)
    ) {

        return randomItem([
            "Goodbye!",
            "See you later!",
            "Take care!"
        ]);
    }


    // -------------------------
    // CAPABILITIES
    // -------------------------

    if (
        text.includes("what can you do") ||
        text.includes("your capabilities")
    ) {

        return "I can chat with you, use voice recognition, speak replies, perform calculations, use the camera, and detect objects in images.";
    }


    // -------------------------
    // HELP
    // -------------------------

    if (text === "help") {

        return "You can ask me questions, use the microphone, open voice mode, or use the camera.";
    }


    // -------------------------
    // FALLBACK
    // -------------------------

    return randomItem([

        "I'm still learning. Tell me a little more.",

        "Interesting. Can you explain that to me?",

        "I understand your message, but I don't have a complete answer for that yet."

    ]);
}


// ============================================================
// BACKEND CHAT
// ============================================================

async function askBackend(message) {

    if (!BACKEND_URL) {
        return null;
    }

    try {

        const response =
            await fetch(
                BACKEND_URL + "/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message,
                        session_id:
                            getSessionId()
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (data.reply) {
            return data.reply;
        }


        return null;

    } catch (error) {

        console.error(
            "Backend error:",
            error
        );

        return null;
    }
}


// ============================================================
// GET FRIDAY REPLY
// ============================================================

async function getFridayReply(message) {

    // First try backend if configured
    if (BACKEND_URL) {

        const backendReply =
            await askBackend(message);

        if (backendReply) {
            return backendReply;
        }
    }

    // Otherwise local brain
    return getLocalFridayReply(message);
}


// ============================================================
// SESSION ID
// ============================================================

function getSessionId() {

    let id =
        localStorage.getItem(
            "friday_session_id"
        );

    if (!id) {

        id =
            "friday-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10);

        localStorage.setItem(
            "friday_session_id",
            id
        );
    }

    return id;
}


// ============================================================
// ADD MESSAGE TO CHAT
// ============================================================

function addChatMessage(
    text,
    type
) {

    if (!chatMessages) {
        return null;
    }

    const message =
        document.createElement("div");

    message.className =
        type === "user"
            ? "user-message"
            : "friday-message";

    message.textContent = text;

    chatMessages.appendChild(
        message
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

    return message;
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {

    if (!chatInput) {
        return;
    }

    const message =
        chatInput.value.trim();

    if (!message) {
        return;
    }


    // User message
    addChatMessage(
        message,
        "user"
    );


    // Clear input
    chatInput.value = "";


    // Typing indicator
    const typing =
        addChatMessage(
            "FRIDAY is thinking...",
            "friday"
        );


    try {

        const reply =
            await getFridayReply(
                message
            );


        if (typing) {
            typing.textContent =
                reply;
        }


        speakText(reply);


    } catch (error) {

        console.error(error);

        if (typing) {

            typing.textContent =
                "Sorry, something went wrong.";
        }
    }
}


// ============================================================
// SEND BUTTON
// ============================================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );
}


// ============================================================
// ENTER KEY
// ============================================