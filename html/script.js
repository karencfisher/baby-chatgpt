
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
        console.error(`Error: ${error}`);
        throw(error);
    }
}

const promptText = document.getElementById("prompt-text");
const sendButton = document.getElementById("send-button");
const cancelButton = document.getElementById("cancel-button");
async function sendPrompt() {
    if (promptText.value === "") {
        return;
    }
    const prompt = promptText.value.trim();
    addMessage(prompt, "user");
    const result = await getResponse(prompt);
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
    sendPrompt();
    togglePrompt();
});

promptText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        sendPrompt();
        togglePrompt();
    }
});

cancelButton.addEventListener("click", () => {
    togglePrompt();
});

const promptButton = document.getElementById("prompt-button");
promptButton.addEventListener("click", () => {
    togglePrompt();
});

addEventListener("load", () => {
    togglePrompt();
});
