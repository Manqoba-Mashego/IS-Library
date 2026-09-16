const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const loginButton = document.getElementById("login-button");

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");

const eyeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const eyeOffIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a13.14 13.14 0 0 1-3.15 4.24M6.6 6.6A13.5 13.5 0 0 0 1 12s4 8 11 8a9.26 9.26 0 0 0 5.39-1.61M9.88 9.88a3 3 0 1 0 4.24 4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

togglePassword.innerHTML = eyeIcon;

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.innerHTML = isHidden ? eyeOffIcon : eyeIcon;
  togglePassword.setAttribute(
    "aria-label",
    isHidden ? "Hide password" : "Show password",
  );
});

// If a librarian is already logged in, skip straight to the dashboard.
(async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (session) {
    window.location.href = "Dashboard.html";
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

  window.location.href = "Dashboard.html";
});