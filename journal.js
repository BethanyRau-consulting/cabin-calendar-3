document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `journal.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");

    // ✅ Initialize Firestore
    const db = firebase.firestore();
    const journalEntriesDiv = document.getElementById("journalEntries");

    // ✅ Fetch journal entries from Firestore
    function fetchEntries() {
        db.collection("journal").orderBy("date", "asc").get().then(snapshot => {
            journalEntriesDiv.innerHTML = ""; // Clear entries before adding new ones
            snapshot.forEach(doc => {
                displayEntry(doc.id, doc.data());
            });
        }).catch(error => {
            console.error("❌ Error fetching journal entries:", error);
        });
    }

    // ✅ Display a journal entry
    function displayEntry(id, data) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("journal-entry");
        entryDiv.innerHTML = `
            <h3>${data.name} - ${formatDate(data.date)}</h3>
            <p>${data.details}</p>
            <button onclick="editEntry('${id}', '${data.name}', '${data.date}', '${data.details}')">Edit</button>
            <button onclick="deleteEntry('${id}')">Delete</button>
        `;
        journalEntriesDiv.appendChild(entryDiv);
    }

    // ✅ Format date (YYYY-MM-DD → MM/DD/YYYY)
    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    // ✅ Add a new journal entry to Firestore
    function submitEntry(event) {
        event.preventDefault(); // 🚀 Prevent form submission from refreshing page

        const name = document.getElementById("entryName").value;
        const date = document.getElementById("entryDate").value;
        const details = document.getElementById("entryDetails").value;

        if (!name || !date || !details) {
            alert("⚠️ All fields are required!");
            return;
        }

        console.log("📌 Adding journal entry:", { name, date, details });

        db.collection("journal").add({
            name,
            date,
            details,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("✅ Journal entry successfully added to Firestore!");
            clearForm();
            fetchEntries();
        }).catch(error => {
            console.error("❌ Error adding entry:", error);
        });
    }

    // ✅ Clear form after submission
    function clearForm() {
        document.getElementById("entryName").value = "";
        document.getElementById("entryDate").value = "";
        document.getElementById("entryDetails").value = "";
    }

    // ✅ Edit a journal entry
    function editEntry(id, name, date, details) {
        document.getElementById("entryName").value = name;
        document.getElementById("entryDate").value = date;
        document.getElementById("entryDetails").value = details;

        document.getElementById("submitEntry").onclick = (event) => {
            event.preventDefault();
            db.collection("journal").doc(id).update({
                name,
                date,
                details
            }).then(() => {
                console.log("✅ Journal entry updated!");
                clearForm();
                fetchEntries();
            }).catch(error => {
                console.error("❌ Error updating entry:", error);
            });
        };
    }

    // ✅ Delete a journal entry from Firestore
    function deleteEntry(id) {
        if (confirm("❌ Are you sure you want to delete this entry?")) {
            db.collection("journal").doc(id).delete().then(() => {
                console.log("✅ Journal entry deleted!");
                fetchEntries();
            }).catch(error => {
                console.error("❌ Error deleting entry:", error);
            });
        }
    }

    // ✅ Attach event listeners
    document.getElementById("journalForm").addEventListener("submit", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", clearForm);

    // ✅ Fetch and display entries when the page loads
    fetchEntries();
});
