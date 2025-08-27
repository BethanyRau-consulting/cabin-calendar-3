import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addEventForm = document.getElementById('addEventForm');
const eventList = document.getElementById('eventList');
const filterType = document.getElementById('filterType');
const filterMonth = document.getElementById('filterMonth');
const filterYear = document.getElementById('filterYear');
const todayBtn = document.getElementById('todayBtn');

let allEvents = [];

// Load events on page load
async function loadEvents() {
    const snapshot = await getDocs(collection(db, "events"));
    allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderEvents(allEvents);
    populateFilters();
}

function populateFilters() {
    const months = [...new Set(allEvents.map(e => new Date(e.date).getMonth()))];
    const years = [...new Set(allEvents.map(e => new Date(e.date).getFullYear()))];

    filterMonth.innerHTML = '<option value="">All</option>' + 
        months.map(m => `<option value="${m}">${new Date(2000, m).toLocaleString('default', { month: 'long' })}</option>`).join('');
    filterYear.innerHTML = '<option value="">All</option>' + 
        years.map(y => `<option value="${y}">${y}</option>`).join('');
}

function renderEvents(events) {
    eventList.innerHTML = "";
    events.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(event => {
        const li = document.createElement('li');
        const dateFormatted = new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        li.innerHTML = `
            <span style="color:${event.type || 'black'}; font-weight:bold;">${event.name}</span>
            <p>${dateFormatted} ${event.time || ''}</p>
            <p>${event.description || ''}</p>
            <button class="editBtn" data-id="${event.id}">Edit</button>
            <button class="deleteBtn" data-id="${event.id}">Delete</button>
        `;
        eventList.appendChild(li);
    });

    document.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await deleteDoc(doc(db, "events", e.target.dataset.id));
            loadEvents();
        });
    });

    document.querySelectorAll('.editBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const event = allEvents.find(ev => ev.id === e.target.dataset.id);
            if (event) {
                document.getElementById('eventName').value = event.name;
                document.getElementById('eventDate').value = event.date;
                document.getElementById('eventTime').value = event.time;
                document.getElementById('eventDescription').value = event.description;
                document.getElementById('eventType').value = event.type;

                addEventForm.onsubmit = async (ev) => {
                    ev.preventDefault();
                    await updateDoc(doc(db, "events", event.id), {
                        name: eventName.value,
                        date: eventDate.value,
                        time: eventTime.value,
                        description: eventDescription.value,
                        type: eventType.value
                    });
                    addEventForm.reset();
                    addEventForm.onsubmit = saveEvent;
                    loadEvents();
                };
            }
        });
    });
}

async function saveEvent(e) {
    e.preventDefault();
    await addDoc(collection(db, "events"), {
        name: eventName.value,
        date: eventDate.value,
        time: eventTime.value,
        description: eventDescription.value,
        type: eventType.value
    });
    addEventForm.reset();
    loadEvents();
}

addEventForm.addEventListener('submit', saveEvent);

[filterType, filterMonth, filterYear].forEach(filter => {
    filter.addEventListener('change', () => {
        const type = filterType.value;
        const month = filterMonth.value;
        const year = filterYear.value;
        const filtered = allEvents.filter(e => {
            const d = new Date(e.date);
            return (!type || e.type === type) &&
                   (!month || d.getMonth() == month) &&
                   (!year || d.getFullYear() == year);
        });
        renderEvents(filtered);
    });
});

todayBtn.addEventListener('click', () => {
    const today = new Date();
    const filtered = allEvents.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
    renderEvents(filtered);
});

loadEvents();
