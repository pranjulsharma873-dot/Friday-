function sendMessage() {

    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (message === "") return;

    const chat = document.getElementById("chatMessages");

    // User message
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerText = message;

    chat.appendChild(userMessage);

    input.value = "";

    // FRIDAY reply
    let reply = "";

    const msg = message.toLowerCase();

    if (msg === "hi" || msg === "hello") {
        reply = "Hello! I am FRIDAY. How can I help you?";
    }
    else if (msg.includes("your name")) {
        reply = "My name is FRIDAY AI.";
    }
    else if (msg.includes("how are you")) {
        reply = "I am working perfectly.";
    }
    else {
        reply = "I received your message: " + message;
    }

    // FRIDAY message
    const fridayMessage = document.createElement("div");
    fridayMessage.className = "friday-message";
    fridayMessage.innerText = reply;

    chat.appendChild(fridayMessage);

    chat.scrollTop = chat.scrollHeight;
}