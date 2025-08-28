import { db } from "./firebase-config.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db, storage } from "./firebase-config.js";

const addEventBtn = document.getElementById("addEventBtn");
const eventModal = document.getElementById("eventModal");
const closeModal = document.getElementById("closeModal");
const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");

const filterType = document.getElementById("filter-type");
const filterMonth = document.getElementById("filter-month");
const applyFiltersBtn = document.getElementById("applyFilters");

let selectedEventId = null;

addEventBtn.addEventListener("click", () => { eventForm.reset(); selectedEventId=null; eventModal.style.display="block"; });
closeModal.addEventListener("click", () => eventModal.style.display="none");
window.addEventListener("click", e => { if (e.target===eventModal) eventModal.style.display="none"; });

function getCurrentFilters() {
    return { type: filterType.value, month: filterMonth.value };
}

async function loadEvents(filters={}) {
    eventList.innerHTML="<h2>Events</h2>";
    let q = query(collection(db,"events"), orderBy("start"));
    if (filters.type) q = query(collection(db,"events"), where("color","==",filters.type), orderBy("start"));
    try {
        const snapshot = await getDocs(q);
        snapshot.forEach(docSnap => {
            const e = docSnap.data();
            if (filters.month && e.start.slice(0,7)!==filters.month) return;
            const div = document.createElement("div");
            div.className="event-item";
            div.innerHTML = `
                <h3>${e.title}</h3>
                <p><strong>Date:</strong> ${new Date(e.start).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${e.startTime || "N/A"}</p>
                <p><strong>Type:</strong> ${e.color}</p>
                <p>${e.details || ""}</p>
                ${e.imageURL? `<img src="${e.imageURL}" class="event-img">` : ""}
                <button class="edit-btn" data-id="${docSnap.id}">Edit</button>
                <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
            `;
            eventList.appendChild(div);
        });
    } catch(e) { console.error("Error loading events:", e); }
}

// Save
eventForm.addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("event-id").value;
    const title = document.getElementById("event-name").value;
    const start = document.getElementById("event-date").value;
    const startTime = document.getElementById("event-time").value;
    const color = document.getElementById("event-type").value;
    const details = document.getElementById("event-desc").value;
    const file = document.getElementById("event-image").files[0];

    let imageURL = null;
    if(file) {
        const sRef = ref(storage, `events/${Date.now()}_${file.name}`);
        await uploadBytes(sRef, file);
        imageURL = await getDownloadURL(sRef);
    }

    const data = { title, start, startTime, color, details, imageURL };
    try {
        if(id) await updateDoc(doc(db,"events",id), data);
        else await addDoc(collection(db,"events"), data);
        eventForm.reset(); eventModal.style.display="none"; loadEvents(getCurrentFilters());
    } catch(err){ console.error("Error saving event:",err); }
});

// Edit/Delete
eventList.addEventListener("click", async e => {
    const id = e.target.dataset.id; if(!id) return;
    if(e.target.classList.contains("edit-btn")){
        const dSnap = await getDocs(doc(db,"events",id));
        const data = dSnap.data();
        selectedEventId = id;
        document.getElementById("event-id").value=id;
        document.getElementById("event-name").value=data.title;
        document.getElementById("event-date").value=data.start;
        document.getElementById("event-time").value=data.startTime || "";
        document.getElementById("event-type").value=data.color;
        document.getElementById("event-desc").value=data.details || "";
        eventModal.style.display="block";
    }
    if(e.target.classList.contains("delete-btn")){
        if(confirm("Delete this event?")) { await deleteDoc(doc(db,"events",id)); loadEvents(getCurrentFilters()); }
    }
});

// Apply filters
applyFiltersBtn.addEventListener("click", ()=> loadEvents(getCurrentFilters()));

// Initial load
window.addEventListener("DOMContentLoaded", ()=> loadEvents());
