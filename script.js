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
        micStatus.textContent = "Mic error: " + event.error;
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
    isListening = true;
    micButton.classList.add("active");
    micStatus.textContent = "Listening...";
    recognition.start();
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
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});


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

        if (message.toLowerCase() === "hi" || message.toLowerCase() === "hello") {
            fridayMessage.textContent = "Hello! I am FRIDAY. How can I help you?";
        } else {
            fridayMessage.textContent = "I received your message: " + message;
        }

        chatMessages.appendChild(fridayMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

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
