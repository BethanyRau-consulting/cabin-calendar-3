document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `journal.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");

    // ✅ Initialize Firestore
    const db = firebase.firestore();
    const journalEntriesDiv = document.getElementById("journalEntries");
    let selectedEntryId = null; // Stores the ID of the entry being edited

    // ✅ Fetch journal entries from Firestore
    function fetchEntries() {
        db.collection("journal").orderBy("date", "asc").get().then(snapshot => {
            journalEntriesDiv.innerHTML = ""; // Clear previous entries
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
            <button class="edit-btn" data-id="${id}" data-name="${data.name}" data-date="${data.date}" data-details="${data.details}">Edit</button>
            <button class="delete-btn" data-id="${id}">Delete</button>
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
        event.preventDefault(); // 🚀 Prevent form from refreshing

        const name = document.getElementById("entryName").value;
        const date = document.getElementById("entryDate").value;
        const details = document.getElementById("entryDetails").value;

        if (!name || !date || !details) {
            alert("⚠️ All fields are required!");
            return;
        }

        console.log("📌 Adding or updating journal entry:", { name, date, details });

        if (selectedEntryId) {
            // ✅ Update an existing entry
            db.collection("journal").doc(selectedEntryId).update({
                name,
                date,
                details
            }).then(() => {
                console.log("✅ Journal entry updated!");
                selectedEntryId = null; // Reset selection
                clearForm();
                fetchEntries();
            }).catch(error => {
                console.error("❌ Error updating entry:", error);
            });
        } else {
            // ✅ Add a new entry
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
    }

    // ✅ Clear form after submission or cancel
    function clearForm() {
        document.getElementById("entryName").value = "";
        document.getElementById("entryDate").value = "";
        document.getElementById("entryDetails").value = "";
        selectedEntryId = null; // Reset edit mode
    }

    // ✅ Handle Edit Button Click
    journalEntriesDiv.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-btn")) {
            selectedEntryId = event.target.getAttribute("data-id");
            document.getElementById("entryName").value = event.target.getAttribute("data-name");
            document.getElementById("entryDate").value = event.target.getAttribute("data-date");
            document.getElementById("entryDetails").value = event.target.getAttribute("data-details");

            console.log("✏️ Editing entry:", selectedEntryId);
        }
    });

    // ✅ Handle Delete Button Click
    journalEntriesDiv.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const entryId = event.target.getAttribute("data-id");
            if (confirm("❌ Are you sure you want to delete this entry?")) {
                db.collection("journal").doc(entryId).delete().then(() => {
                    console.log("✅ Journal entry deleted!");
                    fetchEntries();
                }).catch(error => {
                    console.error("❌ Error deleting entry:", error);
                });
            }
        }
    });

    // ✅ Attach event listeners
    document.getElementById("journalForm").addEventListener("submit", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", clearForm);

    // ✅ Fetch and display entries when the page loads
    fetchEntries();
});
