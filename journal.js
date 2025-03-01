// Ensure Firebase is available before using it
if (typeof firebase === "undefined") {
    console.error("Firebase SDK not loaded. Ensure Firebase scripts are included in your HTML.");
} else {
    console.log("✅ Firebase SDK loaded successfully.");
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9rOOglOPQ0pzOwuFq-P_Puo9lroDPU7A",
    authDomain: "cabincalendar3.firebaseapp.com",
    projectId: "cabincalendar3",
    storageBucket: "cabincalendar3.appspot.com",
    messagingSenderId: "373184478865",
    appId: "1:373184478865:web:cf1e0e816be89107538930"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    const journalForm = document.getElementById("journalForm");
    const journalEntries = document.getElementById("journalEntries");
    let editingEntryId = null;

    function loadEntries() {
        db.collection("journal").orderBy("date", "asc").get().then(snapshot => {
            journalEntries.innerHTML = "";
            snapshot.forEach(doc => {
                displayEntry(doc.id, doc.data());
            });
        }).catch(error => console.error("Error fetching journal entries:", error));
    }

    function displayEntry(id, entry) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("entry");
        entryDiv.innerHTML = `
            <h3>${entry.name} - ${entry.date}</h3>
            <p>${entry.details}</p>
            <button onclick="editEntry('${id}', '${entry.name}', '${entry.date}', '${entry.details}')">Edit</button>
            <button onclick="deleteEntry('${id}')">Delete</button>
        `;
        journalEntries.appendChild(entryDiv);
    }

    function submitEntry(event) {
        event.preventDefault();
        const name = document.getElementById("entryName").value;
        const date = document.getElementById("entryDate").value;
        const details = document.getElementById("entryDetails").value;
        
        if (!name || !date || !details) {
            alert("All fields are required!");
            return;
        }

        const entryData = { name, date, details };

        if (editingEntryId) {
            db.collection("journal").doc(editingEntryId).update(entryData).then(() => {
                console.log("✅ Entry updated successfully!");
                editingEntryId = null;
                journalForm.reset();
                loadEntries();
            }).catch(error => console.error("❌ Error updating entry:", error));
        } else {
            db.collection("journal").add(entryData).then(() => {
                console.log("✅ Entry added successfully!");
                journalForm.reset();
                loadEntries();
            }).catch(error => console.error("❌ Error adding entry:", error));
        }
    }

    function editEntry(id, name, date, details) {
        document.getElementById("entryName").value = name;
        document.getElementById("entryDate").value = date;
        document.getElementById("entryDetails").value = details;
        editingEntryId = id;
    }

    function deleteEntry(id) {
        db.collection("journal").doc(id).delete().then(() => {
            console.log("✅ Entry deleted successfully!");
            loadEntries();
        }).catch(error => console.error("❌ Error deleting entry:", error));
    }

    document.getElementById("cancelEntry").addEventListener("click", () => {
        journalForm.reset();
        editingEntryId = null;
    });
    
    journalForm.addEventListener("submit", submitEntry);

    loadEntries();
});
