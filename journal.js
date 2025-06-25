document.addEventListener("DOMContentLoaded", () => {
    // Check if Firebase SDK is loaded and initialized
    if (!firebase.apps.length) {
        console.error("Firebase SDK not loaded. Ensure scripts are included in `journal.html`.");
        return;
    }

    console.log("Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();

    // DOM elements references
    const journalEntriesDiv = document.getElementById("journalEntries");
    const filterSelect = document.getElementById("filterOrder");
    const monthYearSelect = document.getElementById("filterMonthYear");

    // Track the current journal entry being edited (null means adding new)
    let selectedEntryId = null; 

    // Fetch journal entries from Firestore, applying sorting and optional month/year filtering
    function fetchEntries(order = "asc", monthYear = "") {
        let query = db.collection("journal").orderBy("date", order);

        // If a month-year filter is selected, limit entries to that range
        if (monthYear) {
            query = query.where("date", ">=", `${monthYear}-01`)
                         .where("date", "<=", `${monthYear}-31`);
        }

        query.get().then(snapshot => {
            // Clear current displayed entries
            journalEntriesDiv.innerHTML = "";

            // If no entries found, show a friendly message
            if (snapshot.empty) {
                journalEntriesDiv.innerHTML = "<p>No journal entries found.</p>";
            } else {
                // Display each fetched entry
                snapshot.forEach(doc => {
                    displayEntry(doc.id, doc.data());
                });
            }
        }).catch(error => {
            console.error("Error fetching journal entries:", error);
        });
    }

    // Create and add a single journal entry to the page
    function displayEntry(id, data) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("journal-entry");

        // Escape single quotes in details to prevent JS string issues in onclick handlers
        const safeDetails = data.details.replace(/'/g, "&#39;");

        entryDiv.innerHTML = `
            <h3>${data.name} - ${formatDate(data.date)}</h3>
            <p>${data.details}</p>
            <button onclick="editEntry('${id}', '${data.name}', '${data.date}', '${safeDetails}')">Edit</button>
            <button onclick="deleteEntry('${id}')">Delete</button>
        `;
        journalEntriesDiv.appendChild(entryDiv);
    }

    // Helper to convert Firestore date string to a readable format
    function formatDate(date) {
        const d = new Date(date + "T00:00:00"); // Ensure no timezone issues
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    // Called when user clicks "Edit": populates form fields with entry data for updating
    window.editEntry = function (id, name, date, details) {
        document.getElementById("entryName").value = name;
        document.getElementById("entryDate").value = date;
        document.getElementById("entryDetails").value = details;
        selectedEntryId = id; // Mark this entry as being edited
        document.getElementById("submitEntry").textContent = "Update"; // Change button label
    };

    // Handles adding new or updating existing journal entries in Firestore
    function submitEntry() {
        const name = document.getElementById("entryName").value;
        const date = document.getElementById("entryDate").value;
        const details = document.getElementById("entryDetails").value;

        // Basic validation to ensure all fields are filled
        if (!name || !date || !details) {
            alert("⚠️ All fields are required!");
            return;
        }

        if (selectedEntryId) {
            // Update existing entry
            db.collection("journal").doc(selectedEntryId).update({
                name, date, details
            }).then(() => {
                console.log("Journal entry updated!");
                resetForm();
                fetchEntries(filterSelect.value, monthYearSelect.value);
            }).catch(error => {
                console.error("Error updating entry:", error);
            });
        } else {
            // Add new entry with a server timestamp for ordering
            db.collection("journal").add({
                name, date, details,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log("Journal entry added!");
                resetForm();
                fetchEntries(filterSelect.value, monthYearSelect.value);
            }).catch(error => {
                console.error("Error adding entry:", error);
            });
        }
    }

    // Called when user clicks "Delete": removes the entry after confirmation
    window.deleteEntry = function (id) {
        if (confirm("Are you sure you want to delete this entry?")) {
            db.collection("journal").doc(id).delete().then(() => {
                console.log("Entry deleted!");
                fetchEntries(filterSelect.value, monthYearSelect.value);
            }).catch(error => {
                console.error("Error deleting entry:", error);
            });
        }
    };

    // Resets the form to empty and prepares for adding a new entry
    function resetForm() {
        document.getElementById("entryName").value = "";
        document.getElementById("entryDate").value = "";
        document.getElementById("entryDetails").value = "";
        document.getElementById("submitEntry").textContent = "Submit";
        selectedEntryId = null;
    }

    // Update displayed entries when sort order or month/year filter changes
    filterSelect.addEventListener("change", () => fetchEntries(filterSelect.value, monthYearSelect.value));
    monthYearSelect.addEventListener("change", () => fetchEntries(filterSelect.value, monthYearSelect.value));

    // Hook up submit and cancel buttons
    document.getElementById("submitEntry").addEventListener("click", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", resetForm);

    // Initial load of journal entries
    fetchEntries();
});
