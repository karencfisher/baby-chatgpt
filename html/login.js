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
    }
    catch(error) {
        displayError("Error", `Error logging on\n${error}`);
    }
}

loginButton.addEventListener("click", async () => {
    await sendToken(tokenText.value);
});

