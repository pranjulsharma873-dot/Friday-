function sendMessage() {

    const input = document.getElementById("chatInput");
    const chat = document.getElementById("chatMessages");

    if (!input || !chat) {
        alert("Chat elements not found!");
        return;
    }

    const message = input.value.trim();

    if (message === "") {
        return;
    }

    // User message
    const userMessage = document.createElement("div");

    userMessage.className = "user-message";

    userMessage.textContent = message;

    chat.appendChild(userMessage);

    // Clear input
    input.value = "";

    // FRIDAY reply
    setTimeout(function () {

        const fridayMessage =
            document.createElement("div");

        fridayMessage.className =
            "friday-message";

        if (
            message.toLowerCase() === "hi" ||
            message.toLowerCase() === "hello"
        ) {

            fridayMessage.textContent =
                "Hello! I am FRIDAY. How can I help you?";

        } else {

            fridayMessage.textContent =
                "I received your message: " + message;
        }

        chat.appendChild(fridayMessage);

        chat.scrollTop = chat.scrollHeight;

    }, 500);
}


function handleEnter(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();
    }
}