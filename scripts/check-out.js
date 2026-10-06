import {collection, doc, runTransaction, Timestamp} from "firebase/firestore";
import { db } from "../firebase-config.js";

const form = document.getElementById("checkout-form");
const message = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");

const createLoanKey = async (email, title) => {
    const value = `${email.trim().toLowerCase()}\0${title.trim().toLowerCase()}`;

    const data = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const title = document.getElementById("title").value.trim();

    if (!firstName || !lastName || !email || !title) {
        message.textContent =
            "Please fill in every field (spaces alone don't count).";
        message.className = "form-message error";
        return;
    }

    message.textContent = "Submitting…";
    message.className = "form-message info";
    submitButton.disabled = true;

    try {
        const normalizedEmail = email.toLowerCase();
        const normalizedTitle = title.toLowerCase();

        const loanKey = await createLoanKey(
            normalizedEmail,
            normalizedTitle
        );

        const keyRef = doc(db, "activeLoans", loanKey);
        const loanRef = doc(collection(db, "loans"));

        await runTransaction(db, async (transaction) => {
            const keySnapshot = await transaction.get(keyRef);

            // The borrower already has this title checked out.
            if (keySnapshot.exists()) {
                throw new Error("DUPLICATE_LOAN");
            }

            const now = Timestamp.now();

            transaction.set(loanRef, {
                first_name: firstName,
                last_name: lastName,
                email: email,
                email_normalized: normalizedEmail,
                book_title: title,
                book_title_normalized: normalizedTitle,
                status: "checked_out",
                checkout_date: now,
                return_date: null,
                created_at: now
            });

            transaction.set(keyRef, {
                loan_id: loanRef.id,
                status: "checked_out",
                created_at: now
            });
        });

        message.textContent =
            `"${title}" checked out to ${firstName} ${lastName}.`;
        message.className = "form-message success";

        form.reset();

    } catch (error) {
        console.error(error);

        if (error.message === "DUPLICATE_LOAN") {
            message.textContent =
                `${firstName} ${lastName} already has "${title}" checked out. ` +
                `It needs to be checked in first before another copy can go to the same person.`;
        } else {
            message.textContent =
                "Something went wrong: " + error.message;
        }

        message.className = "form-message error";

    } finally {
        submitButton.disabled = false;
    }
});

