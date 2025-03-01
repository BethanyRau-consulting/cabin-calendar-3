document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `journal.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");

    // ✅ Initialize Firestore using `firebase.firestore()`
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
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    function submitEntry() {
        const name = document.getElementById("journalName").value;
        const date = document.getElementById("journalDate").value;
        const details = document.getElementById("journalDetails").value;

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
            clearForm();
            fetchEntries();
        }).catch(error => {
            console.error("❌ Error adding entry:", error);
        });
    }

    function clearForm() {
        document.getElementById("journalName").value = "";
        document.getElementById("journalDate").value = "";
        document.getElementById("journalDetails").value = "";
    }

    function editEntry(id, name, date, details) {
        document.getElementById("journalName").value = name;
        document.getElementById("journalDate").value = date;
        document.getElementById("journalDetails").value = details;

        document.getElementById("submitEntry").onclick = () => {
            db.collection("journal").doc(id).update({
                name,
                date,
                details
            }).then(() => {
                clearForm();
                fetchEntries();
            }).catch(error => {
                console.error("❌ Error updating entry:", error);
            });
        };
    }

    function deleteEntry(id) {
        if (confirm("❌ Are you sure you want to delete this entry?")) {
            db.collection("journal").doc(id).delete().then(() => {
                fetchEntries();
            }).catch(error => {
                console.error("❌ Error deleting entry:", error);
            });
        }
    }

    document.getElementById("submitEntry").addEventListener("click", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", clearForm);

    fetchEntries();
});
