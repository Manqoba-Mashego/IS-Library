let allLoans = [];
let currentFilter = "all";
let currentPage = 1;
const PAGE_SIZE = 15;

const showError = (msg) => {
    const banner = document.getElementById("error-banner");
    banner.textContent = msg;
    banner.style.display = "block";
}

const guard = async () => {
    const {data: { session }} = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = "/";
        return false;
    }
    return true;
}

const getFilteredLoans = () => {
    return currentFilter === "all" ? allLoans : allLoans.filter((l) => l.status === currentFilter);
}

const renderPaginationControls = (totalItems) => {
    const pagination = document.getElementById("pagination");
    const pageIndicator = document.getElementById("page-indicator");
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    if (totalItems === 0 || totalPages === 1) {
        pagination.style.display = "none";
        return;
    }

    pagination.style.display = "flex";
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

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

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    pageItems.forEach((loan) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="Borrower">${loan.first_name} ${loan.last_name}</td>
            <td data-label="Email">${loan.email}</td>
            <td data-label="Book">${loan.book_title}</td>
            <td data-label="Checked Out">${loan.checkout_date ?? "—"}</td>
            <td data-label="Returned">${loan.return_date ?? "—"}</td>
            <td data-label="Status"><span class="status-pill ${loan.status}">${loan.status.replace("_", " ")}</span></td>
            <td data-label=""></td>
          `;
        if (loan.status === "checked_out") {
            const btn = document.createElement("button");
            btn.textContent = "Mark Returned";
            btn.className = "mark-btn";
            btn.addEventListener("click", () => markReturned(loan.id));
            tr.lastElementChild.appendChild(btn);
        }
        tbody.appendChild(tr);
    });

    renderPaginationControls(filtered.length);
}

const updateStats = () => {
    document.getElementById("stat-total").textContent = allLoans.length;
    document.getElementById("stat-active").textContent = allLoans.filter((l) => l.status === "checked_out").length;
    document.getElementById("stat-returned").textContent = allLoans.filter((l) => l.status === "returned").length;
}

const loadLoans = async () => {
    document.getElementById("loading").style.display = "block";

    const { data, error } = await supabaseClient.from("loans").select("*").order("created_at", { ascending: false });

    document.getElementById("loading").style.display = "none";

    if (error) {
        showError("Could not load loans: " + error.message);
        return;
    }

    allLoans = data;
    updateStats();
    render();
}

const markReturned = async (id) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabaseClient.from("loans").update({ status: "returned", return_date: today }).eq("id", id);

    if (error) {
        showError("Could not update loan: " + error.message);
        return;
    }
    loadLoans();
}


document.querySelectorAll(".filters .filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filters .filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        currentPage = 1;
        render();
    });
});

document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage -= 1;
        render();
    }
});

document.getElementById("next-page").addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(getFilteredLoans().length / PAGE_SIZE));
    if (currentPage < totalPages) {
        currentPage += 1;
        render();
    }
});

document.getElementById("logout-button").addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "/";
    });

(async () => {
    const ok = await guard();
    if (ok) loadLoans();
})();
