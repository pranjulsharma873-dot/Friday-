/* =================================
   FRIDAY AI - JAVASCRIPT
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
            "Your new FRIDAY AI chat starts here.";
    }


    else if (type === "plugins") {

        title.innerText = "Plugins";

        text.innerText =
            "Plugins will appear here.";
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
   MICROPHONE / SPEECH
================================= */

function startMic() {

    const status =
        document.getElementById("micStatus");

    const mic =
        document.getElementById("micButton");


    /* Check browser support */

    if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
    ) {

        status.innerText =
            "Voice recognition is not supported";

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


    /* Start listening */

    status.innerText =
        "Listening...";

    mic.innerText = "🔴";


    recognition.start();


    /* Voice result */

    recognition.onresult = function(event) {

        const result =
            event.results[0][0].transcript;


        document
            .getElementById("chatInput")
            .value = result;


        status.innerText =
            "Voice received";

        mic.innerText = "🎙️";
    };


    /* Error */

    recognition.onerror = function(event) {

        status.innerText =
            "Couldn't hear you";

        mic.innerText = "🎙️";

        console.log(
            "Speech error:",
            event.error
        );
    };


    /* Finished */

    recognition.onend = function() {

        mic.innerText = "🎙️";
    };
}


/* =================================
   CHAT
================================= */

function sendMessage() {

    const input =
        document.getElementById("chatInput");


    const message =
        input.value.trim();


    if (message === "") {
        return;
    }


    /*
       Temporary response.
       Later yahan AI API connect karenge.
    */

    alert("You: " + message);


    input.value = "";
}


/* =================================
   ENTER KEY
================================= */

function handleEnter(event) {

    if (event.key === "Enter") {

        sendMessage();
    }
}