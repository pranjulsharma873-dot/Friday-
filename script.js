function sendMessage() {

    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (message === "") {
        return;
    }

    input.value = "";

    // Temporary FRIDAY response
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
    else if (msg.includes("time")) {
        reply = "The current time is " +
            new Date().toLocaleTimeString();
    }
    else {
        reply = "I received: " + message;
    }

    alert("FRIDAY: " + reply);
}