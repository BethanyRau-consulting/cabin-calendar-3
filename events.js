import { db, storage } from "./firebase-config.js";

// DOM Elements
const addEventBtn = document.getElementById("addEventBtn");
const eventModal = document.getElementById("eventModal");
const closeModal = document.getElementById("closeModal");
const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");

// Filter Elements
const filterType = document.getElementById("filter-type") || null;
const filterMonth = document.getElementById("filter-month") || null;
const applyFiltersBtn = document.getElementById("applyFilters") || null;

let selectedEventId = null;

// Open/Close Modal
addEventBtn.addEventListener("click", () => {
    document.getElementById("event-id").value = "";
    eventForm.reset();
    eventModal.style.display = "block";
});
closeModal.addEventListener("click", () => (eventModal.style.display = "none"));
window.addEventListener("click", (e) => {
    if (e.target === eventModal) eventModal.style.display = "none";
});

// Load Events from Firestore (with optional filters)
async function loadEvents(filters = {}) {
    eventList.innerHTML = "";
    let query = db.collection("events").orderBy("date");

    if (filters.type) {
        query = query.where("type", "==", filters.type);
    }

    try {
        const snapshot = await query.get();
        snapshot.forEach((doc) => {
            const e = doc.data();

            // Filter by month if provided
            if (filters.month) {
                const eventMonth = e.date.substring(0, 7); // "YYYY-MM"
                if (eventMonth !== filters.month) return;
            }

            const div = document.createElement("div");
            div.className = "event-item";
            div.innerHTML = `
                <h3>${e.name}</h3>
                <p><strong>Date:</strong> ${new Date(e.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${e.time || "N/A"}</p>
                <p><strong>Type:</strong> ${e.type}</p>
                <p>${e.description || ""}</p>
                ${e.imageURL ? `<img src="${e.imageURL}" class="event-img">` : ""}
                <button class="edit-btn" data-id="${doc.id}">Edit</button>
                <button class="delete-btn" data-id="${doc.id}">Delete</button>
            `;
            eventList.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

// Save Event
eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("event-id").value;
    const name = document.getElementById("event-name").value;
    const date = document.getElementById("event-date").value;
    const time = document.getElementById("event-time").value;
    const type = document.getElementById("event-type").value;
    const description = document.getElementById("event-desc").value;
    const file = document.getElementById("event-image").files[0];

    let imageURL = null;
    if (file) {
        const ref = storage.ref(`events/${Date.now()}_${file.name}`);
        await ref.put(file);
        imageURL = await ref.getDownloadURL();
    }

    const data = { name, date, time, type, description, imageURL };

    try {
        if (id) {
            await db.collection("events").doc(id).update(data);
        } else {
            await db.collection("events").add(data);
        }

        eventForm.reset();
        eventModal.style.display = "none";
        loadEvents(getCurrentFilters()); // refresh list after saving
    } catch (error) {
        console.error("Error saving event:", error);
    }
});

// Edit & Delete
eventList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
        const docId = e.target.dataset.id;
        const docSnap = await db.collection("events").doc(docId).get();
        if (docSnap.exists) {
            const data = docSnap.data();
            selectedEventId = docId;
            document.getElementById("event-id").value = docId;
            document.getElementById("event-name").value = data.name;
            document.getElementById("event-date").value = data.date;
            document.getElementById("event-time").value = data.time || "";
            document.getElementById("event-type").value = data.type;
            document.getElementById("event-desc").value = data.description || "";
            eventModal.style.display = "block";
        }
    }
    if (e.target.classList.contains("delete-btn")) {
        const docId = e.target.dataset.id;
        if (confirm("Delete this event?")) {
            try {
                await db.collection("events").doc(docId).delete();
                loadEvents(getCurrentFilters()); // refresh list after deletion
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        }
    }
});

// Filters
function getCurrentFilters() {
    return {
        type: filterType?.value || "",
        month: filterMonth?.value || ""
    };
}

applyFiltersBtn?.addEventListener("click", () => {
    loadEvents(getCurrentFilters());
});

// Initial load
window.onload = () => loadEvents();
