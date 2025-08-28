import { db, collection, query, where, getDocs } from './firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
    const journalEntriesDiv = document.getElementById("journalEntries");
    const filterSelect = document.getElementById("filterOrder");
    const monthYearSelect = document.getElementById("filterMonthYear");

    let selectedEntryId = null;

    async function fetchEntries(order = "asc", monthYear = "") {
        try {
            let q = query(collection(db, "journal"), orderBy("date", order));

            if (monthYear) {
                q = query(
                    collection(db, "journal"),
                    where("date", ">=", `${monthYear}-01`),
                    where("date", "<=", `${monthYear}-31`),
                    orderBy("date", order)
                );
            }

            const snapshot = await getDocs(q);
            journalEntriesDiv.innerHTML = "";

            if (snapshot.empty) {
                journalEntriesDiv.innerHTML = "<p>No journal entries found.</p>";
                return;
            }

            snapshot.forEach(docSnap => {
                displayEntry(docSnap.id, docSnap.data());
            });
        } catch (error) {
            console.error("Error fetching journal entries:", error);
        }
    }

    function displayEntry(id, data) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("journal-entry");

        const safeDetails = data.details.replace(/'/g, "&#39;");

        entryDiv.innerHTML = `
            <h3>${data.name} - ${formatDate(data.date)}</h3>
            <p>${data.details}</p>
            <button onclick="editEntry('${id}', '${data.name}', '${data.date}', '${safeDetails}')">Edit</button>
            <button onclick="deleteEntry('${id}')">Delete</button>
        `;
        journalEntriesDiv.appendChild(entryDiv);
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    window.editEntry = function (id, name, date, details) {
        document.getElementById("entryName").value = name;
        document.getElementById("entryDate").value = date;
        document.getElementById("entryDetails").value = details;
        selectedEntryId = id;
        document.getElementById("submitEntry").textContent = "Update";
    };

    async function submitEntry() {
        const name = document.getElementById("entryName").value;
        const date = document.getElementById("entryDate").value;
        const details = document.getElementById("entryDetails").value;

        if (!name || !date || !details) {
            alert("All fields are required!");
            return;
        }

        try {
            if (selectedEntryId) {
                await updateDoc(doc(db, "journal", selectedEntryId), { name, date, details });
                console.log("Journal entry updated!");
            } else {
                await addDoc(collection(db, "journal"), { name, date, details, createdAt: serverTimestamp() });
                console.log("Journal entry added!");
            }
            resetForm();
            fetchEntries(filterSelect.value, monthYearSelect.value);
        } catch (error) {
            console.error("Error saving entry:", error);
        }
    }

    window.deleteEntry = async function (id) {
        if (confirm("Are you sure you want to delete this entry?")) {
            try {
                await deleteDoc(doc(db, "journal", id));
                console.log("Entry deleted!");
                fetchEntries(filterSelect.value, monthYearSelect.value);
            } catch (error) {
                console.error("Error deleting entry:", error);
            }
        }
    };

    function resetForm() {
        document.getElementById("entryName").value = "";
        document.getElementById("entryDate").value = "";
        document.getElementById("entryDetails").value = "";
        selectedEntryId = null;
        document.getElementById("submitEntry").textContent = "Submit";
    }

    // Event listeners
    filterSelect.addEventListener("change", () => fetchEntries(filterSelect.value, monthYearSelect.value));
    monthYearSelect.addEventListener("change", () => fetchEntries(filterSelect.value, monthYearSelect.value));
    document.getElementById("submitEntry").addEventListener("click", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", resetForm);

    // Load initial entries
    fetchEntries();
});
