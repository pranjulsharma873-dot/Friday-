const $ = (id) => document.getElementById(id);

const chatMessages = $("chatMessages");
const chatInput = $("chatInput");
const overlay = $("overlay");
const sideMenu = $("sideMenu");
const modal = $("modal");
const plusMenu = $("plusMenu");

/* ---------- SIDE MENU (☰) ---------- */
function openMenu() { sideMenu.classList.add("open"); overlay.classList.add("open"); }
function closeMenu() { sideMenu.classList.remove("open"); overlay.classList.remove("open"); }
$("menuButton").onclick = openMenu;
$("closeMenuButton").onclick = closeMenu;
overlay.onclick = () => { closeMenu(); modal.classList.remove("open"); };

function showModal(title, text) {
    $("modalTitle").textContent = title;
    $("modalText").textContent = text;
    modal.classList.add("open");
    overlay.classList.add("open");
}
$("modalClose").onclick = () => { modal.classList.remove("open"); overlay.classList.remove("open"); };

$("profileMenu").onclick = () => { closeMenu(); showModal("Profile", "Profile coming soon."); };
$("historyMenu").onclick = () => { closeMenu(); showModal("Chat History", "History coming soon."); };
$("pluginsMenu").onclick = () => { closeMenu(); showModal("Plugins", "Plugins coming soon."); };
$("settingsMenu").onclick = () => { closeMenu(); showModal("Settings", "Settings coming soon."); };
$("newChatButton").onclick = () => { chatMessages.innerHTML = ""; closeMenu(); };

/* ---------- CHAT ---------- */
function addMessage(text, who, imgSrc) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    if (imgSrc) {
        const img = document.createElement("img");
        img.src = imgSrc;
        div.appendChild(img);
    }
    if (text) {
        const p = document.createElement("div");
        p.textContent = text;
        div.appendChild(p);
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// >>> Yahan apna purana AI / API wala code lagao <<<
async function getReply(text) {
    return "Aapne kaha: " + text;
}

async function sendText(text) {
    addMessage(text, "user");
    const reply = await getReply(text);
    addMessage(reply, "ai");
    return reply;
}

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = "";
    await sendText(text);
}
$("sendButton").onclick = handleSend;
chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSend(); });

/* ---------- PLUS MENU (Camera / Photo / File) ---------- */
$("plusButton").onclick = (e) => { e.stopPropagation(); plusMenu.classList.toggle("open"); };
document.addEventListener("click", (e) => {
    if (!plusMenu.contains(e.target)) plusMenu.classList.remove("open");
});

$("optCamera").onclick = () => { plusMenu.classList.remove("open"); $("cameraInput").click(); };
$("optPhoto").onclick = () => { plusMenu.classList.remove("open"); $("photoInput").click(); };
$("optFile").onclick = () => { plusMenu.classList.remove("open"); $("fileInput").click(); };

function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    addMessage("", "user", URL.createObjectURL(file));
    addMessage("Image mil gayi. (Isse AI se analyze karwane ka code getReply me lagao)", "ai");
    e.target.value = "";
}
$("cameraInput").onchange = handleImage;
$("photoInput").onchange = handleImage;
$("fileInput").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addMessage("📎 " + file.name, "user");
    addMessage("File mil gayi.", "ai");
    e.target.value = "";
};

/* ---------- VOICE MODE ---------- */
const voiceMode = $("voiceMode");
const orb = $("voiceOrb");
const statusEl = $("voiceModeStatus");
const muteBtn = $("voiceModeMute");

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let voiceOpen = false;
let muted = false;
let speaking = false;

function setStatus(text, cls) {
    statusEl.textContent = text;
    orb.classList.remove("listening", "speaking");
    if (cls) orb.classList.add(cls);
}

function startListening() {
    if (!voiceOpen || muted || speaking || !recognition) return;
    try { recognition.start(); } catch (e) { /* already started */ }
}

function speak(text) {
    return new Promise((resolve) => {
        if (!("speechSynthesis" in window)) return resolve();
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.onend = u.onerror = () => resolve();
        speechSynthesis.speak(u);
    });
}

function setupRecognition() {
    if (!SR) return null;
    const r = new SR();
    r.lang = "hi-IN"; // English ke liye "en-US" kar do
    r.interimResults = false;
    r.continuous = false;

    r.onstart = () => setStatus("Listening...", "listening");
    r.onresult = async (e) => {
        const text = e.results[0][0].transcript;
        setStatus("Thinking...");
        const reply = await sendText(text);
        speaking = true;
        setStatus("Speaking...", "speaking");
        await speak(reply);
        speaking = false;
        setStatus("Listening...", "listening");
    };
    r.onerror = (e) => {
        if (e.error === "not-allowed") setStatus("Mic permission allow karo");
    };
    r.onend = () => { setTimeout(startListening, 300); };
    return r;
}

function openVoiceMode() {
    if (!SR) {
        showModal("Voice Mode", "Is browser me voice recognition support nahi hai. Chrome use karo.");
        return;
    }
    voiceOpen = true;
    muted = false;
    muteBtn.classList.remove("muted");
    voiceMode.classList.add("open");
    recognition = recognition || setupRecognition();
    setStatus("Listening...", "listening");
    startListening();
}

function closeVoiceMode() {
    voiceOpen = false;
    voiceMode.classList.remove("open");
    speechSynthesis.cancel();
    speaking = false;
    if (recognition) { try { recognition.abort(); } catch (e) {} }
}

$("voiceModeButton").onclick = openVoiceMode;
$("voiceModeClose").onclick = closeVoiceMode;
$("voiceModeMinimize").onclick = closeVoiceMode;
muteBtn.onclick = () => {
    muted = !muted;
    muteBtn.classList.toggle("muted", muted);
    if (muted) {
        if (recognition) { try { recognition.abort(); } catch (e) {} }
        setStatus("Muted");
    } else {
        setStatus("Listening...", "listening");
        startListening();
    }
};
