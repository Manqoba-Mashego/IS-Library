import {doc, getDoc, runTransaction, Timestamp} from "firebase/firestore";

import { db } from "../firebase-config.js";

const form = document.getElementById("checkin-form");
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

    const email = document.getElementById("email").value.trim();
    const title = document.getElementById("title").value.trim();

    if (!email || !title) {
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
        const keySnapshot = await getDoc(keyRef);

        if (!keySnapshot.exists()) {
            message.textContent =
                "No active loan found for that email and book title. " +
                "Double-check the spelling.";
            message.className = "form-message error";
            return;
        }

        const activeLoan = keySnapshot.data();

        if (activeLoan.status !== "checked_out") {
            message.textContent =
                "No active loan found for that email and book title.";
            message.className = "form-message error";
            return;
        }

        const loanRef = doc(db, "loans", activeLoan.loan_id);

        await runTransaction(db, async (transaction) => {
            const loanSnapshot = await transaction.get(loanRef);
            const currentKeySnapshot = await transaction.get(keyRef);

            if (!loanSnapshot.exists()) {
                throw new Error("LOAN_NOT_FOUND");
            }

            if (!currentKeySnapshot.exists()) {
                throw new Error("LOAN_ALREADY_RETURNED");
            }

            const loan = loanSnapshot.data();

            if (
                loan.status !== "checked_out" ||
                loan.email_normalized !== normalizedEmail ||
                loan.book_title_normalized !== normalizedTitle
            ) {
                throw new Error("LOAN_NOT_FOUND");
            }

            transaction.update(loanRef, {
                status: "returned",
                return_date: Timestamp.now()
            });

            transaction.delete(keyRef);
        });

        message.textContent = `"${title}" checked in. Thanks!`;
        message.className = "form-message success";

        form.reset();

    } catch (error) {
        console.error(error);

        if (
            error.message === "LOAN_NOT_FOUND" ||
            error.message === "LOAN_ALREADY_RETURNED"
        ) {
            message.textContent =
                "No active loan found for that email and book title. " +
                "Double-check the spelling.";
        } else {
            message.textContent =
                "Something went wrong: " + error.message;
        }

        message.className = "form-message error";

    } finally {
        submitButton.disabled = false;
    }
});
