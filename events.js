(function() {
  if (!window.db) {
    console.error("Firestore (db) not available. Make sure firebase-config.js loaded before events.js");
    return;
  }

  const addEventBtn = document.getElementById("addEventBtn");
  const eventModal = document.getElementById("eventModal");
  const closeModalBtn = document.getElementById("closeModal");
  const eventForm = document.getElementById("eventForm");
  const eventList = document.getElementById("eventList");

  // open modal
  addEventBtn.addEventListener("click", () => {
    document.getElementById("event-id").value = "";
    eventForm.reset();
    eventModal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", () => {
    eventModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === eventModal) eventModal.style.display = "none";
  });

  // load events
async function loadEvents(filters = {}) {
    eventList.innerHTML = "";

    let query = db.collection("events").orderBy("date");

    if (filters.type) {
        query = query.where("type", "==", filters.type);
    }

    const snapshot = await query.get();

    snapshot.forEach(doc => {
        const e = doc.data();

        // If filtering by month
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
}

  // handle add / update
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("event-id").value || null;
    const title = document.getElementById("event-name").value.trim();
    const start = document.getElementById("event-date").value; // YYYY-MM-DD
    const end = start; // form has no end field in events page — keep same day
    const startTime = document.getElementById("event-time").value || "";
    const endTime = "";
    const color = document.getElementById("event-type").value || "None";
    const details = document.getElementById("event-desc").value || "";
    const file = document.getElementById("event-image").files[0];

    let imageURL = null;
    try {
      if (file) {
        const ref = storage.ref(`events/${Date.now()}_${file.name}`);
        await ref.put(file);
        imageURL = await ref.getDownloadURL();
      }

      const payload = { title, start, end, startTime, endTime, color, details };
      if (imageURL) payload.imageURL = imageURL;

try {
    if (id) {
        await db.collection("events").doc(id).update(data);
    } else {
        await db.collection("events").add(data);
    }

    eventForm.reset();
    eventModal.style.display = "none";
    loadEvents(); // refresh the list immediately
} catch (error) {
    console.error("Error saving event:", error);
}


  // edit/delete
  eventList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const id = e.target.dataset.id;
      try {
        const docSnap = await db.collection("events").doc(id).get();
        if (!docSnap.exists) return alert("Event not found");
        const data = docSnap.data();
        document.getElementById("event-id").value = id;
        document.getElementById("event-name").value = data.title || "";
        document.getElementById("event-date").value = data.start || "";
        document.getElementById("event-time").value = data.startTime || "";
        document.getElementById("event-type").value = data.color || "None";
        document.getElementById("event-desc").value = data.details || "";
        // image input cannot be pre-filled
        eventModal.style.display = "block";
      } catch (err) {
        console.error("Error loading event for edit:", err);
      }
    }

    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      if (!confirm("Delete this event?")) return;
      try {
        await db.collection("events").doc(id).delete();
        loadEvents();
        window.dispatchEvent(new Event('eventsUpdated'));
      } catch (err) {
        console.error("Error deleting event:", err);
      }
    }
  });

  // load on start
  loadEvents();

  window.loadEvents = loadEvents;
})();
