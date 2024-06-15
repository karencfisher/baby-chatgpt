const tokenText = document.getElementById("token-text");
const loginButton = document.getElementById("login-button");

async function sendToken(token) {
    const query = { userToken: token };
    try {
        const result = await fetch(
            "/login",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(query)
            }
        );
        if (result.status === 403) {
            displayError("Error", "Invalid token!");
        } 
        else if (result.status !== 200) {
            displayError("Error", `An error occured.\nStatus ${result.status}`);
        }
        else if (result.redirected) {
            window.location.href = result.url; // Handle redirect
        }
    }
    catch(error) {
        displayError("Error", `Error occured\n${error}`);
        tokenText.value = "";
    }
}

loginButton.addEventListener("click", async () => {
    await sendToken(tokenText.value);
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

    setTimeout(() => {
        errorMsg.dataset.open = "false";
    }, 2000);
}

const eye = document.getElementById("eye");
let eyeOpen = true;
eye.addEventListener("click", () => {
    eyeOpen = !eyeOpen;
    if (eyeOpen) {
        tokenText.type = "password";
        eye.innerHTML = "visibility";
    }
    else {
        tokenText.type = "text";
        eye.innerHTML = "visibility_off";
    }
    tokenText.focus();
});

addEventListener("load", () => tokenText.focus());

