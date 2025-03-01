document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `journal.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const journalEntriesDiv = document.getElementById("journalEntries");
    const filterSelect = document.getElementById("filterOrder");
    const monthYearSelect = document.getElementById("filterMonthYear");

    let selectedEntryId = null; 

    function fetchEntries(order = "asc", monthYear = "") {
        let query = db.collection("journal").orderBy("date", order);

        if (monthYear) {
            query = query.where("date", ">=", `${monthYear}-01`)
                         .where("date", "<=", `${monthYear}-31`);
        }

        query.get().then(snapshot => {
            journalEntriesDiv.innerHTML = "";
            if (snapshot.empty) {
                journalEntriesDiv.innerHTML = "<p>No journal entries found.</p>";
            } else {
                snapshot.forEach(doc => {
                    displayEntry(doc.id, doc.data());
                });
            }
        }).catch(error => {
            console.error("❌ Error fetching journal entries:", error);
        });
    }

    function displayEntry(id, data) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("journal-entry");
        entryDiv.innerHTML = `
            <h3>${data.name} - ${formatDate(data.date)}</h3>
            <p>${data.details}</p>
            <button onclick="editEntry('${id}', '${data.name}', '${data.date}', '${data.details.replace(/'/g, "&#39;")}')">Edit</button>
            <button onclick="deleteEntry('${id}')">Delete</button>
        `;
        journalEntriesDiv.appendChild(entryDiv);
    }

    function formatDate(date) {
        const d = new Date(date + "T00:00:00");
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    window.editEntry = function (id, name, date, details) {
        document.getElementById("entryName").value = name;
        document.getElementById("entryDate").value = date;
        document.getElementById("entryDetails").value = details;
        selectedEntryId = id; 

        document.getElementById("submitEntry").textContent = "Update";
    };

    function submitEntry() {
        const name = document.getElementById("entryName").value;
        const date = document.getElementById("entryDate").value;
        const details = document.getElementById("entryDetails").value;

        if (!name || !date || !details) {
            alert("⚠️ All fields are required!");
            return;
        }

        if (selectedEntryId) {
            db.collection("journal").doc(selectedEntryId).update({
                name, date, details
            }).then(() => {
                console.log("✅ Journal entry updated!");
                resetForm();
                fetchEntries(filterSelect.value, monthYearSelect.value);
            }).catch(error => {
                console.error("❌ Error updating entry:", error);
            });
        } else {
            db.collection("journal").add({
                name, date, details,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log("✅ Journal entry added!");
                resetForm();
                fetchEntries(filterSelect.value, monthYearSelect.value);
            }).catch(error => {
                console.error("❌ Error adding entry:", error);
            });
        }
    }

    window.deleteEntry = function (id) {
        if (confirm("❌ Are you sure you want to delete this entry?")) {
            db.collection("journal").doc(id).delete().then(() => {
                console.log("✅ Entry deleted!");
                fetchEntries(filterSelect.value, monthYearSelect.value);
            }).catch(error => {
                console.error("❌ Error deleting entry:", error);
            });
        }
    };

    function resetForm() {
        document.getElementById("entryName").value = "";
        document.getElementById("entryDate").value = "";
        document.getElementById("entryDetails").value = "";
        document.getElementById("submitEntry").textContent = "Submit";
        selectedEntryId = null;
    }

    filterSelect.addEventListener("change", () => fetchEntries(filterSelect.value, monthYearSelect.value));
    monthYearSelect.addEventListener("change", () => fetchEntries(filterSelect.value, monthYearSelect.value));

    document.getElementById("submitEntry").addEventListener("click", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", resetForm);

    fetchEntries();
});
