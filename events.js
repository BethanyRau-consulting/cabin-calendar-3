// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB9rOOglOPQ0pzOwuFq-P_Puo9lroDPU7A",
  authDomain: "cabincalendar3.firebaseapp.com",
  projectId: "cabincalendar3",
  storageBucket: "cabincalendar3.firebasestorage.app",
  messagingSenderId: "373184478865",
  appId: "1:373184478865:web:cf1e0e816be89107538930"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const addEventBtn = document.getElementById("addEventBtn");
const eventModal = document.getElementById("eventModal");
const closeModal = document.getElementById("closeModal");
const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");

// Open/Close Modal
addEventBtn.addEventListener("click", () => {
    document.getElementById("event-id").value = "";
    eventForm.reset();
    eventModal.style.display = "block";
});
closeModal.addEventListener("click", () => eventModal.style.display = "none");
window.addEventListener("click", e => { if(e.target==eventModal) eventModal.style.display="none"; });

// Load Events from Firestore (sorted by date)
async function loadEvents() {
    eventList.innerHTML = ""; 
    const snapshot = await db.collection("events").orderBy("date").get();
    snapshot.forEach(doc => {
        const e = doc.data();
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
    if(file){
        const ref = storage.ref(`events/${Date.now()}_${file.name}`);
        await ref.put(file);
        imageURL = await ref.getDownloadURL();
    }

    const data = {name, date, time, type, description, imageURL};

    if(id){
        await db.collection("events").doc(id).update(data);
    } else {
        await db.collection("events").add(data);
    }

    eventForm.reset();
    eventModal.style.display = "none";
    loadEvents();
});

// Edit & Delete
eventList.addEventListener("click", async e => {
    if(e.target.classList.contains("edit-btn")){
        const docId = e.target.dataset.id;
        const docSnap = await db.collection("events").doc(docId).get();
        if(docSnap.exists){
            const data = docSnap.data();
            document.getElementById("event-id").value = docId;
            document.getElementById("event-name").value = data.name;
            document.getElementById("event-date").value = data.date;
            document.getElementById("event-time").value = data.time || "";
            document.getElementById("event-type").value = data.type;
            document.getElementById("event-desc").value = data.description || "";
            eventModal.style.display = "block";
        }
    }
    if(e.target.classList.contains("delete-btn")){
        const docId = e.target.dataset.id;
        if(confirm("Delete this event?")){
            await db.collection("events").doc(docId).delete();
            loadEvents();
        }
    }
});

// Initial load
window.onload = loadEvents;
