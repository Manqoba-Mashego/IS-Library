const form = document.getElementById("checkout-form");
const message = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const title = document.getElementById("title").value.trim();


    if (!firstName || !lastName || !email || !title) {
        message.textContent = "Please fill in every field (spaces alone don't count).";
        message.className = "form-message error";
        return;
    }

    message.textContent = "Submitting…";
    message.className = "form-message info";
    submitButton.disabled = true;

    const { error } = await supabaseClient.from("loans").insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        book_title: title,
        status: "checked_out",
    });

    submitButton.disabled = false;

    if (error) {
        if (error.code === "23505") {
            message.textContent = `${firstName} ${lastName} already has "${title}" checked out. It needs to be checked in first before another copy can go to the same person.`;
        } else {
            message.textContent = "Something went wrong: " + error.message;
        }
        message.className = "form-message error";
        return;
    }

    message.textContent = `"${title}" checked out to ${firstName} ${lastName}.`;
    message.className = "form-message success";
    form.reset();
});
