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
// FRIDAY REPLY LOGIC (shared)
// ============================

function getFridayReply(message) {
    const lower = message.toLowerCase();

    if (lower === "hi" || lower === "hello") {
        return "Hello! I am FRIDAY. How can I help you?";
    }

    return "I received your message: " + message;
}


// ============================
// CHAT INPUT
// ============================

function sendMessage() {

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

    // FRIDAY reply
    setTimeout(function () {

        const fridayMessage = document.createElement("div");
        fridayMessage.className = "friday-message";
        fridayMessage.textContent = getFridayReply(message);

        chatMessages.appendChild(fridayMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        speakText(fridayMessage.textContent);

    }, 500);
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

function handleVoiceModeMessage(transcript) {

    voiceOrb.classList.remove("listening");
    voiceModeStatus.textContent = "Thinking...";

    // Add to the main chat log too
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = transcript;
    chatMessages.appendChild(userMessage);

    const replyText = getFridayReply(transcript);

    const fridayMessage = document.createElement("div");
    fridayMessage.className = "friday-message";
    fridayMessage.textContent = replyText;
    chatMessages.appendChild(fridayMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    voiceOrb.classList.add("speaking");
    voiceModeStatus.textContent = replyText;

    speakText(replyText, function () {
        voiceOrb.classList.remove("speaking");

        if (voiceModeActive && !voiceMuted) {
            startVoiceListening();
        }
    });
}

function openVoiceMode() {
    voiceModeActive = true;
    voiceMuted = false;
    voiceModeMute.classList.remove("muted");
    voiceMode.classList.add("active");
    voiceOrb.classList.remove("listening", "speaking");
    voiceModeStatus.textContent = "Starting...";

    unlockSpeechSynthesis();
    startVoiceListening();
}

function closeVoiceMode() {
    voiceModeActive = false;

    if (voiceRecognition) {
        voiceRecognition.stop();
    }

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    voiceOrb.classList.remove("listening", "speaking");
    voiceMode.classList.remove("active");
}

voiceModeButton.addEventListener("click", openVoiceMode);
voiceModeClose.addEventListener("click", closeVoiceMode);
voiceModeMinimize.addEventListener("click", closeVoiceMode);

voiceModeMute.addEventListener("click", function () {
    voiceMuted = !voiceMuted;
    voiceModeMute.classList.toggle("muted", voiceMuted);

    if (voiceMuted) {
        if (voiceRecognition) {
            voiceRecognition.stop();
        }
        voiceOrb.classList.remove("listening");
        voiceModeStatus.textContent = "Microphone muted";
    } else {
        startVoiceListening();
    }
});
