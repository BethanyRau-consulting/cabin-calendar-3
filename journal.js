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
        return new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    document.getElementById("submitEntry").addEventListener("click", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", () => {
        document.getElementById("journalForm").reset();
    });

    fetchEntries();
});
