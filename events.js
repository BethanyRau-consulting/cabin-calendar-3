import { db, storage } from "./firebase-config.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const addEventBtn = document.getElementById("addEventBtn");
const eventModal = document.getElementById("eventModal");
const closeModal = document.getElementById("closeModal");
const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");
const filterType = document.getElementById("filter-type");
const filterMonth = document.getElementById("filter-month");
const applyFiltersBtn = document.getElementById("applyFilters");

let selectedEventId = null;

addEventBtn.addEventListener("click", () => {
  document.getElementById("event-id").value = "";
  eventForm.reset();
  eventModal.style.display = "block";
});

closeModal.addEventListener("click", () => (eventModal.style.display = "none"));
window.addEventListener("click", (e) => { if (e.target === eventModal) eventModal.style.display = "none"; });

function getCurrentFilters() {
  return { type: filterType?.value || "", month: filterMonth?.value || "" };
}

async function loadEvents(filters = {}) {
  eventList.innerHTML = "<h2>Events</h2>";
  const eventsCol = collection(db, "events");
  let q = filters.type ? query(eventsCol, where("type", "==", filters.type), orderBy("date")) : query(eventsCol, orderBy("date"));

  try {
    const snapshot = await getDocs(q);
    snapshot.forEach((docSnap) => {
      const e = docSnap.data();
      if (filters.month && e.date.substring(0, 7) !== filters.month) return;

      const div = document.createElement("div");
      div.className = "event-item";
      div.innerHTML = `
        <h3>${e.name}</h3>
        <p><strong>Date:</strong> ${new Date(e.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${e.time || "N/A"}</p>
        <p><strong>Type:</strong> ${e.type}</p>
        <p>${e.description || ""}</p>
        ${e.imageURL ? `<img src="${e.imageURL}" class="event-img">` : ""}
        <button class="edit-btn" data-id="${docSnap.id}">Edit</button>
        <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
      `;
      eventList.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

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
    const fileRef = ref(storage, `events/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    imageURL = await getDownloadURL(fileRef);
  }

  const data = { name, date, time, type, description, imageURL };

  try {
    if (id) {
      await updateDoc(doc(db, "events", id), data);
    } else {
      await addDoc(collection(db, "events"), data);
    }
    eventForm.reset();
    eventModal.style.display = "none";
    loadEvents(getCurrentFilters());
  } catch (error) {
    console.error("Error saving event:", error);
  }
});

eventList.addEventListener("click", async (e) => {
  const docId = e.target.dataset.id;
  if (!docId) return;

  if (e.target.classList.contains("edit-btn")) {
    const docSnap = await getDocs(doc(db, "events", docId));
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

  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", docId));
        loadEvents(getCurrentFilters());
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  }
});

applyFiltersBtn?.addEventListener("click", () => loadEvents(getCurrentFilters()));

window.addEventListener("DOMContentLoaded", () => loadEvents());
