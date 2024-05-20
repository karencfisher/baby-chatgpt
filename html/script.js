const conversation = document.getElementById("conversation");
function addMessage(msg, role) {
    const msgDiv = document.createElement("div");
    if (role === "AI") {
        msgDiv.classList.add("AI-message");
    }
    else {
        msgDiv.classList.add("user-message");
    }
    msgDiv.innerText = msg;
    conversation.appendChild(msgDiv);
    conversation.scrollTop = conversation.scrollHeight;
}

async function getResponse(prompt) {
    const query = { question: prompt };
    let result = null;
    let contents = null;
    try {
        result = await fetch(
            "/ask",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(query)
            }
        );
        contents = await result.json();
        return contents.result.kwargs.content;
    }
    catch(error) {
        displayError("Error", `Error sending message to model. Might be offline?`);
        throw(error);
    }
}

const promptText = document.getElementById("prompt-text");
const sendButton = document.getElementById("send-button");
const cancelButton = document.getElementById("cancel-button");

async function sendPrompt() {
    const prompt = promptText.value.trim();
    addMessage(prompt, "user");
    let result = null;
    try {
        result = await getResponse(prompt);
    }
    catch(error) {
        return;
    }
    addMessage(result, "AI");
}

function toggleTabIndexes() {
    let newIndex = 0;
    if (promptText.getAttribute("tabindex") === "0") {
        newIndex = -1;
    }

    promptText.setAttribute("tabindex", `${newIndex}`);
    sendButton.setAttribute("tabindex", `${newIndex}`);
    cancelButton.setAttribute("tabindex", `${newIndex}`);
}

const prompt = document.getElementById("prompt");
const mask = document.getElementById("mask");
let promptState = false
function togglePrompt() {
    promptState = !promptState;
    prompt.dataset.open = `${promptState}`;
    mask.dataset.open = `${promptState}`;
    promptText.value = "";
    if (promptState) {
        promptText.focus();
        promptText.inputMode = "text";
    }
    else {
        promptText.inputMode = "none";
    }
    toggleTabIndexes();
}

sendButton.addEventListener("click", () => {
    if (promptText.value === "") {
        displayError("error", "Prompt is empty!")
        return;
    }

    sendPrompt();
    togglePrompt();
});

cancelButton.addEventListener("click", () => {
    togglePrompt();
});

const promptButton = document.getElementById("prompt-button");
promptButton.addEventListener("click", () => {
    togglePrompt();
});

const drawerButton = document.getElementById("drawer-button");
const drawer = document.getElementById("drawer");
let drawerOpen = false;
drawerButton.addEventListener("click", () => {
    drawerOpen = !drawerOpen;
    drawer.dataset.open = `${drawerOpen}`;
    mask.dataset.open = `${drawerOpen}`;
});

mask.addEventListener("click", () => {
    if (drawer.dataset.open === "true") {
        drawer.dataset.open = "false";
        mask.dataset.open = "false";
        drawerOpen = false;
    }
    else if (prompt.dataset.open === "true") {
        togglePrompt();
    }
});

const models = [...document.getElementsByClassName("models")];
models.forEach((item) => {
    item.addEventListener("change", async (e) => {
        const query = `/set-model?model=${e.target.value}`;
        try {
            const result = await fetch(query);
            if (result.status !== 200) {
                displayError("error", `Network error. Might be offline?\nStatus ${result.status}`);
                return;
            }
            displayError("info", `Model is now ${e.target.value}.`);
        }
        catch(error) {
            displayError("error", `Error setting model. Might be offline?`);
        }
    });
});

const downloadButton = document.getElementById("download-button");
downloadButton.addEventListener("click", () => {
    if (document.getElementById("chat-title").value === "" || conversation.childElementCount === 0) {
        displayError("error", "Chat title or conversation is empty!");
        return;
    }
    const chatLog = document.createElement("div");
    const chatTitleField = document.createElement("h2");
    chatTitleField.innerText = document.getElementById("chat-title").value;
    chatLog.appendChild(chatTitleField);

    for (const child of conversation.children) {
        let role = "Human";
        if (child.className === "AI-message") {
            role ="AI";
        }
        const msg = document.createElement("p");
        msg.style.setProperty("word-wrap", "break-word");
        msg.innerHTML = `<b>${role}:</b> ${child.innerText}\n\n`;
        chatLog.appendChild(msg);
    }

    const opt = {
        filename: chatTitleField.innerText.replace(" ", "_"),
        margin: 10
    }
    html2pdf().set(opt).from(chatLog).save();
});

const closeButton = document.getElementById("close-button");
closeButton.addEventListener("click", () => {
    drawer.dataset.open = "false";
    mask.dataset.open = "false";
    drawerOpen = false;
});

function displayError(type, msg) {
    const errorMsg = document.getElementById("error-msg");
    const errortxt = document.getElementById("error-txt");
    const msgIcon = document.getElementById("msg-icon");
    if (type === "info") {
        msgIcon.innerText = "info";
    }
    else {
        msgIcon.innerText = "error_outline";
    }

    errortxt.innerText = msg;
    errorMsg.dataset.open = "true";
    mask.dataset.open = "true";

    setTimeout(() => {
        errorMsg.dataset.open = "false";
        mask.dataset.open = "false";
    }, 2000);
}
