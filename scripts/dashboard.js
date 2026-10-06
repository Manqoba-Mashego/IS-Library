import { collection, query, orderBy, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase-config.js";

let allLoans = [];
let currentFilter = "all";
let currentPage = 1;

const PAGE_SIZE = 15;

const showError = (msg) => {
    const banner = document.getElementById("error-banner");
    banner.textContent = msg;
    banner.style.display = "block";
};

const formatDate = (timestamp) => {
    if (!timestamp) return "—";

    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleDateString();
    }

    if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleDateString();
    }

    return timestamp;
};

const getFilteredLoans = () => {
    return currentFilter === "all"
        ? allLoans
        : allLoans.filter((loan) => loan.status === currentFilter);
};

const renderPaginationControls = (totalItems) => {
    const pagination = document.getElementById("pagination");
    const pageIndicator = document.getElementById("page-indicator");
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / PAGE_SIZE)
    );

    if (totalItems === 0 || totalPages === 1) {
        pagination.style.display = "none";
        return;
    }

    pagination.style.display = "flex";

    pageIndicator.textContent =
        `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
};

const render = () => {
    const tbody = document.getElementById("loans-body");
    const table = document.getElementById("loans-table");
    const empty = document.getElementById("empty");

    const filtered = getFilteredLoans();

    tbody.innerHTML = "";

    if (filtered.length === 0) {
        table.style.display = "none";
        empty.style.display = "block";

        renderPaginationControls(0);

        return;
    }

    empty.style.display = "none";
    table.style.display = "table";

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / PAGE_SIZE)
    );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * PAGE_SIZE;

    const pageItems = filtered.slice(
        start,
        start + PAGE_SIZE
    );

    pageItems.forEach((loan) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td data-label="Borrower">
                ${loan.first_name} ${loan.last_name}
            </td>

            <td data-label="Email">
                ${loan.email}
            </td>

            <td data-label="Book">
                ${loan.book_title}
            </td>

            <td data-label="Checked Out">
                ${formatDate(loan.checkout_date)}
            </td>

            <td data-label="Returned">
                ${formatDate(loan.return_date)}
            </td>

            <td data-label="Status">
                <span class="status-pill ${loan.status}">
                    ${loan.status.replace("_", " ")}
                </span>
            </td>

            <td data-label=""></td>
        `;

        if (loan.status === "checked_out") {
            const button = document.createElement("button");

            button.textContent = "Mark Returned";
            button.className = "mark-btn";

            button.addEventListener("click", () => {
                markReturned(loan.id);
            });

            tr.lastElementChild.appendChild(button);
        }

        tbody.appendChild(tr);
    });

    renderPaginationControls(filtered.length);
};

const updateStats = () => {
    document.getElementById("stat-total").textContent =
        allLoans.length;

    document.getElementById("stat-active").textContent =
        allLoans.filter(
            (loan) => loan.status === "checked_out"
        ).length;

    document.getElementById("stat-returned").textContent =
        allLoans.filter(
            (loan) => loan.status === "returned"
        ).length;
};

const loadLoans = async () => {
    document.getElementById("loading").style.display = "block";

    try {
        const loansQuery = query(
            collection(db, "loans"),
            orderBy("created_at", "desc")
        );

        const snapshot = await getDocs(loansQuery);

        allLoans = snapshot.docs.map((loanDoc) => ({
            id: loanDoc.id,
            ...loanDoc.data()
        }));

        updateStats();
        render();

    } catch (error) {
        console.error(error);

        showError(
            "Could not load loans: " + error.message
        );

    } finally {
        document.getElementById("loading").style.display = "none";
    }
};

const markReturned = async (id) => {
    try {
        const loanRef = doc(db, "loans", id);

        await updateDoc(loanRef, {
            status: "returned",
            return_date: Timestamp.now()
        });

        await loadLoans();

    } catch (error) {
        console.error(error);

        showError(
            "Could not update loan: " + error.message
        );
    }
};

document
    .querySelectorAll(".filters .filter-btn")
    .forEach((button) => {

        button.addEventListener("click", () => {
            document
                .querySelectorAll(".filters .filter-btn")
                .forEach((btn) => {
                    btn.classList.remove("active");
                });

            button.classList.add("active");

            currentFilter = button.dataset.filter;
            currentPage = 1;

            render();
        });
    });

document
    .getElementById("prev-page")
    .addEventListener("click", () => {

        if (currentPage > 1) {
            currentPage -= 1;
            render();
        }
    });

document
    .getElementById("next-page")
    .addEventListener("click", () => {

        const totalPages = Math.max(
            1,
            Math.ceil(
                getFilteredLoans().length / PAGE_SIZE
            )
        );

        if (currentPage < totalPages) {
            currentPage += 1;
            render();
        }
    });

document
    .getElementById("logout-button")
    .addEventListener("click", async () => {

        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error(error);

            showError(
                "Could not log out: " + error.message
            );
        }
    });

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "/";
        return;
    }

    await loadLoans();
});

