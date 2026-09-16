const form = document.getElementById("checkin-form");
const message = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const title = document.getElementById("title").value.trim();
    const returnDate = document.getElementById("date").value || new Date().toISOString().slice(0, 10);

    message.textContent = "Submitting…";
    message.className = "form-message info";
    submitButton.disabled = true;

    const { data, error } = await supabaseClient.from("loans")
        .update({ status: "returned", return_date: returnDate })
        .eq("email", email)
        .eq("book_title", title)
        .eq("status", "checked_out")
        .select();

    submitButton.disabled = false;

    if (error) {
        message.textContent = "Something went wrong: " + error.message;
        message.className = "form-message error";
        return;
    }

    if (!data || data.length === 0) {
        message.textContent =
            "No active loan found for that email and book title. Double-check the spelling.";
        message.className = "form-message error";
        return;
    }

    message.textContent = `"${title}" checked in. Thanks!`;
    message.className = "form-message success";
    form.reset();
});
