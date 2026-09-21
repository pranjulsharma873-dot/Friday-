/* =================================
   FRIDAY AI
   MAIN JAVASCRIPT
================================= */


/* =================================
   SIDE MENU
================================= */

function openMenu() {

    document
        .getElementById("sideMenu")
        .classList
        .add("active");

    document
        .getElementById("overlay")
        .classList
        .add("active");
}


function closeMenu() {

    document
        .getElementById("sideMenu")
        .classList
        .remove("active");

    document
        .getElementById("overlay")
        .classList
        .remove("active");
}


/* =================================
   MODAL
================================= */

function openModal(type) {

    closeMenu();

    const title =
        document.getElementById("modalTitle");

    const text =
        document.getElementById("modalText");


    if (type === "profile") {

        title.innerText = "Profile";

        text.innerText =
            "FRIDAY AI User Profile";
    }


    else if (type === "chat") {

        title.innerText = "Chat";

        text.innerText =
            "Your FRIDAY AI chat is ready.";
    }


    else if (type === "plugins") {

        title.innerText = "Plugins";

        text.innerText =
            "Plugins will be available here.";
    }


    else if (type === "history") {

        title.innerText = "Chat History";

        text.innerText =
            "Your previous conversations will appear here.";
    }


    else if (type === "settings") {

        title.innerText = "Settings";

        text.innerText =
            "FRIDAY AI settings will appear here.";
    }


    document
        .getElementById("modal")
        .classList
        .add("active");
}


function closeModal() {

    document
        .getElementById("modal")
        .classList
        .remove("active");
}


/* =================================
   NEW CHAT
================================= */

function newChat() {

    closeMenu();

    const chat =
        document.getElementById("chatMessages");

    chat.innerHTML = "";

    document
        .getElementById("chatInput")
        .value = "";

    document
        .getElementById("chatInput")
        .focus();
}


/* =================================
   ADD CHAT MESSAGE
================================= */

function addMessage(text, type) {

    const chat =
        document.getElementById("chatMessages");


    const message =
        document.createElement("div");


    if (type === "user") {

        message.className =
            "user-message";
    }

    else {

        message.className =
            "friday-message";
    }


    message.innerText = text;


    chat.appendChild(message);


    chat.scrollTop =
        chat.scrollHeight;
}


/* =================================
   FRIDAY RESPONSE
================================= */

function getFridayResponse(message) {

    const msg =
        message.toLowerCase().trim();


    if (
        msg === "hi" ||
        msg === "hello" ||
        msg === "hey"
    ) {

        return "Hello! I am FRIDAY. How can I help you?";
    }


    if (msg.includes("your name")) {

        return "My name is FRIDAY AI.";
    }


    if (msg.includes("how are you")) {

        return "I am working perfectly.";
    }


    if (msg.includes("time")) {

        return "The current time is " +
            new Date().toLocaleTimeString();
    }


    if (msg.includes("date")) {

        return "Today's date is " +
            new Date().toLocaleDateString();
    }


    if (msg.includes("who are you")) {

        return "I am FRIDAY, your AI assistant.";
    }


    return "I received your message: " + message;
}


/* =================================
   SEND MESSAGE
================================= */

function sendMessage() {

    const input =
        document.getElementById("chatInput");


    const message =
        input.value.trim();


    if (message === "") {
        return;
    }


    /* USER MESSAGE */

    addMessage(
        message,
        "user"
    );


    input.value = "";


    /* FRIDAY THINKING */

    setTimeout(function() {

        const reply =
            getFridayResponse(message);


        addMessage(
            reply,
            "friday"
        );

    }, 400);
}


/* =================================
   ENTER KEY
================================= */

function handleEnter(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();
    }
}


/* =================================
   MICROPHONE
================================= */

function startMic() {

    const status =
        document.getElementById("micStatus");

    const mic =
        document.getElementById("micButton");


    if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
    ) {

        status.innerText =
            "Voice recognition is not supported.";

        return;
    }


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const recognition =
        new SpeechRecognition();


    recognition.lang = "en-IN";

    recognition.interimResults = false;

    recognition.continuous = false;


    status.innerText =
        "Listening...";

    mic.innerText = "🔴";


    recognition.start();


    recognition.onresult =
        function(event) {

            const result =
                event.results[0][0].transcript;


            document
                .getElementById("chatInput")
                .value = result;


            status.innerText =
                "Voice received";


            mic.innerText =
                "🎙️";


            /* Automatically send voice message */

            sendMessage();
        };


    recognition.onerror =
        function(event) {

            console.log(
                "Speech error:",
                event.error
            );


            status.innerText =
                "Couldn't hear you";


            mic.innerText =
                "🎙️";
        };


    recognition.onend =
        function() {

            mic.innerText =
                "🎙️";
        };
}


/* =================================
   CLOSE MODAL WHEN ESC PRESSED
================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeModal();

            closeMenu();
        }

    }
);