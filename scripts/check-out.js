const form = document.getElementById("checkout-form");
const message = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const title = document.getElementById("title").value.trim();
    const dueDate = document.getElementById("due-date").value || null;

    message.textContent = "Submitting…";
    message.className = "form-message info";
    submitButton.disabled = true;

    const { error } = await supabaseClient.from("loans").insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        book_title: title,
        due_date: dueDate,
        status: "checked_out",
    });

    submitButton.disabled = false;

    if (error) {
        message.textContent = "Something went wrong: " + error.message;
        message.className = "form-message error";
        return;
    }

    message.textContent = `"${title}" checked out to ${firstName} ${lastName}.`;
    message.className = "form-message success";
    form.reset();
});
