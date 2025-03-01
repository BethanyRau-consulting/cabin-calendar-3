document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `journal.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const journalEntriesDiv = document.getElementById("journalEntries");

    function fetchEntries() {
        db.collection("journal").orderBy("date", "asc").get().then(snapshot => {
            journalEntriesDiv.innerHTML = "";
            snapshot.forEach(doc => {
                displayEntry(doc.id, doc.data());
            });
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
            <button onclick="editEntry('${id}', '${data.name}', '${data.date}', '${data.details}')">Edit</button>
            <button onclick="deleteEntry('${id}')">Delete</button>
        `;
        journalEntriesDiv.appendChild(entryDiv);
    }

    function formatDate(date) {
        return date; // 🔹 Display exactly as stored in Firestore (YYYY-MM-DD)
    }

    function submitEntry() {
        const name = document.getElementById("entryName").value;
        const date = document.getElementById("entryDate").value;
        const details = document.getElementById("entryDetails").value;

        if (!name || !date || !details) {
            alert("⚠️ All fields are required!");
            return;
        }

        db.collection("journal").add({
            name,
            date,
            details,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("✅ Journal entry added!");

            // ✅ Clear the form
            document.getElementById("entryName").value = "";
            document.getElementById("entryDate").value = "";
            document.getElementById("entryDetails").value = "";

            // ✅ Refresh journal list immediately
            fetchEntries();
        }).catch(error => {
            console.error("❌ Error adding entry:", error);
        });
    }

    function editEntry(id, name, date, details) {
        document.getElementById("entryName").value = name;
        document.getElementById("entryDate").value = date;
        document.getElementById("entryDetails").value = details;

        document.getElementById("submitEntry").onclick = () => {
            db.collection("journal").doc(id).update({
                name,
                date,
                details
            }).then(() => {
                console.log("✅ Entry updated!");
                fetchEntries();
            }).catch(error => {
                console.error("❌ Error updating entry:", error);
            });
        };
    }

    function deleteEntry(id) {
        if (confirm("❌ Are you sure you want to delete this entry?")) {
            db.collection("journal").doc(id).delete().then(() => {
                console.log("✅ Entry deleted!");
                fetchEntries();
            }).catch(error => {
                console.error("❌ Error deleting entry:", error);
            });
        }
    }

    document.getElementById("submitEntry").addEventListener("click", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", () => {
        document.getElementById("journalForm").reset();
    });

    fetchEntries();
});
