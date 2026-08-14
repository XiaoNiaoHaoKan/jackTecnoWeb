const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    loginError.textContent = "";

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        loginError.textContent = data.message || "Impossibile effettuare l'accesso";
        return;
    }

    window.location.href = "/Index.html";
});
