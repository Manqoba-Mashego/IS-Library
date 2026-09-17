const form = document.getElementById("checkin-form");
const message = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
 
form.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    const email = document.getElementById("email").value.trim();
    const title = document.getElementById("title").value.trim();
 
    if (!email || !title) {
        message.textContent = "Please fill in every field (spaces alone don't count).";
        message.className = "form-message error";
        return;
    }
 
    message.textContent = "Submitting…";
    message.className = "form-message info";
    submitButton.disabled = true;
 
    const { data: didCheckIn, error } = await supabaseClient.rpc(
        "check_in_loan",
        { p_email: email, p_title: title },
    );
 
    submitButton.disabled = false;
 
    if (error) {
        message.textContent = "Something went wrong: " + error.message;
        message.className = "form-message error";
        return;
    }
 
    if (!didCheckIn) {
        message.textContent =
            "No active loan found for that email and book title. Double-check the spelling.";
        message.className = "form-message error";
        return;
    }
 
    message.textContent = `"${title}" checked in. Thanks!`;
    message.className = "form-message success";
    form.reset();
});
 