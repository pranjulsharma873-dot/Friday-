// ============================
// ELEMENT REFERENCES
// ============================

const menuButton = document.getElementById("menuButton");
const profileButton = document.getElementById("profileButton");
const micButton = document.getElementById("micButton");
const micStatus = document.getElementById("micStatus");

const chatInput = document.getElementById("chatInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");

const chatButton = document.getElementById("chatButton");
const pluginsButton = document.getElementById("pluginsButton");
const historyButton = document.getElementById("historyButton");
const settingsButton = document.getElementById("settingsButton");

const overlay = document.getElementById("overlay");
const sideMenu = document.getElementById("sideMenu");
const closeMenuButton = document.getElementById("closeMenuButton");

const profileMenu = document.getElementById("profileMenu");
const newChatButton = document.getElementById("newChatButton");
const historyMenu = document.getElementById("historyMenu");
const pluginsMenu = document.getElementById("pluginsMenu");
const settingsMenu = document.getElementById("settingsMenu");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalClose = document.getElementById("modalClose");

const voiceModeButton = document.getElementById("voiceModeButton");
const voiceMode = document.getElementById("voiceMode");
const voiceOrb = document.getElementById("voiceOrb");
const voiceModeStatus = document.getElementById("voiceModeStatus");
const voiceModeMute = document.getElementById("voiceModeMute");
const voiceModeClose = document.getElementById("voiceModeClose");
const voiceModeMinimize = document.getElementById("voiceModeMinimize");

const cameraButton = document.getElementById("cameraButton");
const cameraMode = document.getElementById("cameraMode");
const cameraVideo = document.getElementById("cameraVideo");
const cameraCanvas = document.getElementById("cameraCanvas");
const cameraStatus = document.getElementById("cameraStatus");
const cameraCloseButton = document.getElementById("cameraCloseButton");
const cameraFlipButton = document.getElementById("cameraFlipButton");
const cameraCaptureButton = document.getElementById("cameraCaptureButton");
const cameraQuestionInput = document.getElementById("cameraQuestionInput");

let isListening = false;
let recognition = null;

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = function (event) {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            micStatus.textContent = "Mic permission denied. Enable it in browser site settings.";
        } else if (event.error === "no-speech") {
            micStatus.textContent = "No speech detected. Try again.";
        } else {
            micStatus.textContent = "Mic error: " + event.error;
        }
        stopListening();
    };

    recognition.onend = function () {
        stopListening();
    };
}

function startListening() {
    if (!recognition) {
        micStatus.textContent = "Speech recognition not supported on this browser";
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        micStatus.textContent = "Mic access not supported on this browser";
        return;
    }

    micStatus.textContent = "Requesting mic permission...";

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            // Stop the stream immediately, we only needed it to trigger/check permission
            stream.getTracks().forEach(function (track) {
                track.stop();
            });

            try {
                isListening = true;
                micButton.classList.add("active");
                micStatus.textContent = "Listening...";
                recognition.start();
            } catch (err) {
                micStatus.textContent = "Could not start mic: " + err.message;
                stopListening();
            }
        })
        .catch(function (err) {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                micStatus.textContent = "Mic permission denied. Enable it in browser site settings.";
            } else if (err.name === "NotFoundError") {
                micStatus.textContent = "No microphone found on this device.";
            } else {
                micStatus.textContent = "Mic error: " + err.name;
            }
            stopListening();
        });
}

function stopListening() {
    isListening = false;
    micButton.classList.remove("active");
    micStatus.textContent = "Tap microphone to talk";
    if (recognition) {
        recognition.stop();
    }
}


// ============================
// SIDE MENU
// ============================

function openMenu() {
    sideMenu.classList.add("active");
    overlay.classList.add("active");
}

function closeMenu() {
    sideMenu.classList.remove("active");
    overlay.classList.remove("active");
}

menuButton.addEventListener("click", openMenu);
closeMenuButton.addEventListener("click", closeMenu);
overlay.addEventListener("click", function () {
    closeMenu();
    closeModal();
});


// ============================
// MODAL
// ============================

function openModal(title, text) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modal.classList.add("active");
    overlay.classList.add("active");
}

function closeModal() {
    modal.classList.remove("active");
    overlay.classList.remove("active");
}

modalClose.addEventListener("click", closeModal);


// ============================
// PROFILE / TOP BAR
// ============================

profileButton.addEventListener("click", function () {
    openModal("Profile", "Your profile details will appear here.");
});


// ============================
// MICROPHONE
// ============================

micButton.addEventListener("click", function () {
    unlockSpeechSynthesis();

    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});


// ============================
// TEXT TO SPEECH
// ============================

function speakText(text, onEnd) {
    if (!window.speechSynthesis) {
        if (onEnd) {
            onEnd();
        }
        return;
    }

    window.speechSynthesis.cancel();

    // Small delay: on some Android Chrome versions, calling speak()
    // immediately after cancel() silently fails to produce audio.
    setTimeout(function () {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-IN";
        utterance.rate = 1;
        utterance.pitch = 1;

        if (onEnd) {
            utterance.onend = onEnd;
            utterance.onerror = onEnd;
        }

        window.speechSynthesis.speak(utterance);
    }, 100);
}

function unlockSpeechSynthesis() {
    if (!window.speechSynthesis) {
        return;
    }
    // Speaking a silent utterance directly inside a user tap "unlocks"
    // TTS so later automatic (non-tap-triggered) speech is allowed.
    const unlockUtterance = new SpeechSynthesisUtterance(" ");
    unlockUtterance.volume = 0;
    window.speechSynthesis.speak(unlockUtterance);
}


// ============================
// LOCAL OBJECT-DETECTION MODEL
// (runs fully in the browser via TensorFlow.js — no key, no server)
// ============================

let objectDetectionModel = null;
let modelLoadingPromise = null;

function loadDetectionModel() {
    if (objectDetectionModel) {
        return Promise.resolve(objectDetectionModel);
    }
    if (!modelLoadingPromise) {
        modelLoadingPromise = cocoSsd.load().then(function (model) {
            objectDetectionModel = model;
            return model;
        });
    }
    return modelLoadingPromise;
}


// ============================
// FRIDAY'S BRAIN (fully self-made, runs in the browser — no API, no key)
// ============================

const userName = null; // could be set later if you add a "remember my name" feature

function getRandomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function tryMath(message) {
    // Matches things like "5 + 3", "what is 12 * 4", "10 divided by 2"
    const cleaned = message
        .toLowerCase()
        .replace(/plus/g, "+")
        .replace(/minus/g, "-")
        .replace(/times|multiplied by/g, "*")
        .replace(/divided by/g, "/")
        .replace(/what is|what's|calculate|solve/g, "")
        .trim();

    const mathMatch = cleaned.match(/(-?\d+(\.\d+)?)\s*([\+\-\*\/])\s*(-?\d+(\.\d+)?)/);

    if (!mathMatch) {
        return null;
    }

    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[3];
    const b = parseFloat(mathMatch[4]);
    let result;

    if (op === "+") result = a + b;
    else if (op === "-") result = a - b;
    else if (op === "*") result = a * b;
    else if (op === "/") result = b !== 0 ? a / b : null;

    if (result === null) {
        return "You can't divide by zero!";
    }

    return a + " " + op + " " + b + " = " + result;
}

function getFridayReplySync(message) {
    const text = message.toLowerCase().trim();

    // --- Greetings ---
    if (/^(hi|hii+|hello+|hey+|namaste|yo)\b/.test(text)) {
        return getRandomFrom([
            "Hello! How can I help you today?",
            "Hi there! What can I do for you?",
            "Hey! I'm listening."
        ]);
    }

    // --- How are you ---
    if (text.includes("how are you")) {
        return "I'm running smoothly, thanks for asking! How are you doing?";
    }

    // --- Identity ---
    if (text.includes("your name")) {
        return "I'm FRIDAY, your personal AI assistant.";
    }

    if (text.includes("who made you") || text.includes("who created you") || text.includes("who built you")) {
        return "I was built and coded by you — my own custom-made assistant!";
    }

    // --- Time / Date ---
    if (text.includes("time") && !text.includes("sometime")) {
        const now = new Date();
        return "It's currently " + now.toLocaleTimeString();
    }

    if (text.includes("date") || text.includes("today")) {
        const now = new Date();
        return "Today's date is " + now.toLocaleDateString(undefined, {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
    }

    // --- Math ---
    const mathResult = tryMath(text);
    if (mathResult) {
        return mathResult;
    }

    // --- Jokes ---
    if (text.includes("joke")) {
        return getRandomFrom([
            "Why don't robots ever panic? Because they have great byte control!",
            "Why did the computer go to the doctor? It caught a virus!",
            "I would tell you a UDP joke, but you might not get it.",
            "Why do programmers prefer dark mode? Because light attracts bugs!"
        ]);
    }

    // --- Thanks ---
    if (text.includes("thank")) {
        return getRandomFrom(["You're welcome!", "Anytime!", "Happy to help!"]);
    }

    // --- Bye ---
    if (/\b(bye|goodbye|see you|good night)\b/.test(text)) {
        return getRandomFrom(["Goodbye! Talk to you soon.", "See you later!", "Take care!"]);
    }

    // --- Capabilities ---
    if (text.includes("what can you do") || text.includes("help me")) {
        return "I can chat with you, tell the time and date, do quick math, tell jokes, and even look through the camera to describe what it sees!";
    }

    // --- Fallback ---
    return getRandomFrom([
        "I heard you say: \"" + message + "\" — I'm still learning, so I might not fully understand that yet.",
        "Interesting! Tell me more about that.",
        "I'm not sure how to respond to that yet, but I'm listening."
    ]);
}

// Kept async so the rest of the app (which awaits this function) doesn't
// need to change — but it now resolves instantly with no network call.
async function getFridayReply(message) {
    return getFridayReplySync(message);
}

async function askFridayAboutImage(imageBase64, question) {
    try {
        if (typeof cocoSsd === "undefined") {
            return "The object-detection model didn't load. Check your internet connection and reload the page.";
        }

        const model = await loadDetectionModel();

        // Build an image element from the captured photo
        const img = new Image();
        await new Promise(function (resolve, reject) {
            img.onload = resolve;
            img.onerror = reject;
            img.src = "data:image/jpeg;base64," + imageBase64;
        });

        const predictions = await model.detect(img);

        if (predictions.length === 0) {
            return "I couldn't clearly identify anything in that image. Try moving closer or improving the lighting.";
        }

        // Keep only reasonably confident predictions
        const confident = predictions
            .filter(function (p) { return p.score > 0.5; })
            .sort(function (a, b) { return b.score - a.score; });

        const itemsToReport = confident.length > 0 ? confident : predictions;
        const names = itemsToReport.slice(0, 5).map(function (p) { return p.class; });

        // Count duplicates (e.g. two "person" -> "2 persons")
        const counts = {};
        names.forEach(function (name) {
            counts[name] = (counts[name] || 0) + 1;
        });

        const parts = Object.keys(counts).map(function (name) {
            const count = counts[name];
            return count > 1 ? (count + " " + name + "s") : ("a " + name);
        });

        let description;
        if (parts.length === 1) {
            description = "I can see " + parts[0] + ".";
        } else {
            description = "I can see " + parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] + ".";
        }

        // Object detection can't read text — flag that limitation if relevant
        if (/read|text|written|says?\b/i.test(question)) {
            description = "I can't read text yet, but here's what I can identify: " + description;
        }

        return description;

    } catch (err) {
        return "Sorry, I had trouble analyzing that image. (" + err.message + ")";
    }
}


// ============================
// CHAT INPUT
// ============================

async function sendMessage() {

    const message = chatInput.value.trim();

    if (message === "") {
        return;
    }

    // User message
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);

    // Clear input
    chatInput.value = "";

    // "Typing..." placeholder while we wait for the real AI reply
    const typingMessage = document.createElement("div");
    typingMessage.className = "friday-message";
    typingMessage.textContent = "FRIDAY is typing...";
    chatMessages.appendChild(typingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const replyText = await getFridayReply(message);

    typingMessage.textContent = replyText;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    speakText(replyText);
}

function handleEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
}

sendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", handleEnter);


// ============================
// BOTTOM MENU
// ============================

chatButton.addEventListener("click", function () {
    closeMenu();
    chatInput.focus();
});

pluginsButton.addEventListener("click", function () {
    openModal("Plugins", "No plugins installed yet.");
});

historyButton.addEventListener("click", function () {
    openModal("Chat History", "Your previous chats will appear here.");
});

settingsButton.addEventListener("click", function () {
    openModal("Settings", "Settings panel coming soon.");
});


// ============================
// SIDE MENU ITEMS
// ============================

profileMenu.addEventListener("click", function () {
    closeMenu();
    openModal("Profile", "Your profile details will appear here.");
});

newChatButton.addEventListener("click", function () {
    chatMessages.innerHTML = "";
    closeMenu();
});

historyMenu.addEventListener("click", function () {
    closeMenu();
    openModal("Chat History", "Your previous chats will appear here.");
});

pluginsMenu.addEventListener("click", function () {
    closeMenu();
    openModal("Plugins", "No plugins installed yet.");
});

settingsMenu.addEventListener("click", function () {
    closeMenu();
    openModal("Settings", "Settings panel coming soon.");
});


// ============================
// VOICE MODE (FULL SCREEN)
// ============================

let voiceModeActive = false;
let voiceMuted = false;
let voiceRecognition = null;

if (SpeechRecognitionAPI) {
    voiceRecognition = new SpeechRecognitionAPI();
    voiceRecognition.lang = "en-IN";
    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = false;

    voiceRecognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        handleVoiceModeMessage(transcript);
    };

    voiceRecognition.onerror = function (event) {
        if (!voiceModeActive) {
            return;
        }

        if (event.error === "no-speech") {
            // Silence timeout — just listen again
            if (!voiceMuted) {
                startVoiceListening();
            }
            return;
        }

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            voiceModeStatus.textContent = "Mic permission denied. Enable it in browser site settings.";
        } else {
            voiceModeStatus.textContent = "Mic error: " + event.error;
        }

        voiceOrb.classList.remove("listening");
    };
}

function startVoiceListening() {
    if (!voiceRecognition) {
        voiceModeStatus.textContent = "Speech recognition not supported on this browser";
        return;
    }

    voiceModeStatus.textContent = "Requesting mic permission...";

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            stream.getTracks().forEach(function (track) {
                track.stop();
            });

            try {
                voiceOrb.classList.remove("speaking");
                voiceOrb.classList.add("listening");
                voiceModeStatus.textContent = "Listening...";
                voiceRecognition.start();
            } catch (err) {
                // Recognition may already be running — ignore duplicate start errors
            }
        })
        .catch(function (err) {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                voiceModeStatus.textContent = "Mic permission denied. Enable it in browser site settings.";
            } else if (err.name === "NotFoundError") {
                voiceModeStatus.textContent = "No microphone found on this device.";
            } else {
                voiceModeStatus.textContent = "Mic error: " + err.name;
            }
            voiceOrb.classList.remove("listening");
        });
}

async function handleVoiceModeMessage(transcript) {

    voiceOrb.classList.remove("listening");
    voiceModeStatus.textContent = "Thinking...";

    // Add to the main chat log too
    