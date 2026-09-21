function sendMessage() {

    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    const message = input.value.trim();

    if (message === "") {
        return;
    }

    // User message
    const userMessage = document.createElement("div");

    userMessage.className = "message user";

    userMessage.innerHTML = `
        <div class="avatar">
            👤
        </div>

        <div class="text">
            ${escapeHTML(message)}
        </div>
    `;

    messages.appendChild(userMessage);

    input.value = "";

    messages.scrollTop = messages.scrollHeight;


    // Temporary Zarvis reply
    setTimeout(function () {

        const aiMessage = document.createElement("div");

        aiMessage.className = "message ai";

        aiMessage.innerHTML = `
            <div class="avatar">
                🤖
            </div>

            <div class="text">
                Tumne kaha: ${escapeHTML(message)}
            </div>
        `;

        messages.appendChild(aiMessage);

        messages.scrollTop = messages.scrollHeight;

    }, 500);
}


// Enter key
function handleEnter(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

}


// New Chat
function newChat() {

    const messages = document.getElementById("messages");

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


// Security helper
function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
          }
