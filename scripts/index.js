const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const loginButton = document.getElementById("login-button");

// If a librarian is already logged in, skip straight to the dashboard.
(async () => {
    const {
        data: { session },
    } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.href = "dashboard.html";
    }
})();

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Signing in…";
    loginMessage.className = "form-message info";
    loginButton.disabled = true;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    loginButton.disabled = false;

    if (error) {
        loginMessage.textContent = error.message;
        loginMessage.className = "form-message error";
        return;
    }

    window.location.href = "dashboard.html";
});
