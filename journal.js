import { 
  db, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp
} from './firebase-config.js';

// Convert file to Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const journalEntriesDiv = document.getElementById("journalEntries");
    const filterSelect = document.getElementById("filterOrder");
    const monthYearSelect = document.getElementById("filterMonthYear");

    const modal = document.getElementById("journalModal");
    const openBtn = document.getElementById("openJournalForm");
    const closeBtn = document.getElementById("closeModal");
    const modalTitle = document.getElementById("modalTitle");

    let selectedEntryId = null; // Tracks editing entry
    const journalCollection = collection(db, "journal");

    // Open modal
    function openModal(title) {
        modalTitle.textContent = title;
        modal.style.display = "block";
    }

    // Close modal
    function closeModal() {
        modal.style.display = "none";
        resetForm();
    }

    openBtn.addEventListener("click", () => openModal("Add Journal Entry"));
    closeBtn.addEventListener("click", closeModal);
    window.addEventListener("click", e => { if (e.target == modal) closeModal(); });

    // Fetch and render journal entries
    async function fetchEntries(order = "asc", monthYear = "") {
        try {
            let q = query(journalCollection, orderBy("date", order));
            if (monthYear) {
                const start = `${monthYear}-01`;
                const end = `${monthYear}-31`;
                q = query(journalCollection, where("date", ">=", start), where("date", "<=", end), orderBy("date", order));
            }
            const snapshot = await getDocs(q);
            journalEntriesDiv.innerHTML = "";
            if (snapshot.empty) {
                journalEntriesDiv.innerHTML = "<p>No journal entries found.</p>";
            } else {
                snapshot.forEach(docSnap => displayEntry(docSnap.id, docSnap.data()));
            }
        } catch (err) {
            console.error("Error fetching journal entries:", err);
        }
    }

    function displayEntry(id, data) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("journal-entry");
        const safeDetails = data.details ? data.details.replace(/'/g, "&#39;") : "";
        entryDiv.innerHTML = `
            <h3>${data.name} - ${formatDate(data.date)}</h3>
            <p>${data.details || ""}</p>
            ${data.imageBase64 ? `<img src="${data.imageBase64}" class="journal-img">` : ""}
            <button onclick="editEntry('${id}', '${data.name}', '${data.date}', '${safeDetails}')">Edit</button>
            <button onclick="deleteEntry('${id}')">Delete</button>
        `;
        journalEntriesDiv.appendChild(entryDiv);
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    // Edit entry
    window.editEntry = function(id, name, date, details) {
        document.getElementById("entryName").value = name;
        document.getElementById("entryDate").value = date;
        document.getElementById("entryDetails").value = details;
        selectedEntryId = id;
        modalTitle.textContent = "Edit Journal Entry";
        openModal("Edit Journal Entry");
    };

    // Delete entry
    window.deleteEntry = async function(id) {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            await deleteDoc(doc(db, "journal", id));
            fetchEntries(filterSelect.value, monthYearSelect.value);
        } catch (err) {
            console.error("Error deleting entry:", err);
        }
    };

    // Submit entry
    async function submitEntry() {
        const name = document.getElementById("entryName").value;
        const date = document.getElementById("entryDate").value;
        const details = document.getElementById("entryDetails").value;
        const file = document.getElementById("journal-image").files[0];

        if (!name || !date || !details) {
            alert("All fields are required!");
            return;
        }

        let imageBase64 = null;
        if (file) {
            imageBase64 = await getBase64(file);
        }

        const data = { name, date, details };
        if (imageBase64) data.imageBase64 = imageBase64;

        try {
            if (selectedEntryId) {
                await updateDoc(doc(db, "journal", selectedEntryId), data);
            } else {
                await addDoc(journalCollection, { ...data, createdAt: serverTimestamp() });
            }
            closeModal();
            fetchEntries(filterSelect.value, monthYearSelect.value);
        } catch (err) {
            console.error("Error saving entry:", err);
        }
    }

    function resetForm() {
        document.getElementById("entryName").value = "";
        document.getElementById("entryDate").value = "";
        document.getElementById("entryDetails").value = "";
        document.getElementById("journal-image").value = "";
        selectedEntryId = null;
        modalTitle.textContent = "Add Journal Entry";
    }

    document.getElementById("submitEntry").addEventListener("click", submitEntry);
    document.getElementById("cancelEntry").addEventListener("click", closeModal);
    filterSelect.addEventListener("change", () => fetchEntries(filterSelect.value, monthYearSelect.value));
    monthYearSelect.addEventListener("change", () => fetchEntries(filterSelect.value, monthYearSelect.value));

    fetchEntries();
});
