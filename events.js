document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const eventList = document.getElementById("eventList");
    let selectedEventId = null;

    function fetchEvents(filterDate = "") {
        let query = db.collection("events").orderBy("start", "asc");

        if (filterDate) {
            const [year, month] = filterDate.split("-");
            query = query.where("start", ">=", `${year}-${month}-01`)
                         .where("start", "<=", `${year}-${month}-31`);
        }

        query.get().then(snapshot => {
            eventList.innerHTML = "";
            if (snapshot.empty) {
                eventList.innerHTML = "<p>No events found.</p>";
            } else {
                snapshot.forEach(doc => {
                    displayEvent(doc.id, doc.data());
                });
            }
        }).catch(error => {
            console.error("❌ Error fetching events:", error);
        });
    }

    function displayEvent(id, data) {
        const eventItem = document.createElement("div");
        eventItem.classList.add("event-item");
        eventItem.innerHTML = `
            <h3>${data.title}</h3>
            <p><strong>Date:</strong> ${formatDate(data.start)}</p>
            <p><strong>Type:</strong> ${getEventType(data.color)}</p>
            <button class="edit-btn" data-id="${id}">Edit</button>
            <button class="delete-btn" data-id="${id}">Delete</button>
        `;
        eventList.appendChild(eventItem);
    }

    function formatDate(date) {
        const d = new Date(date + "T12:00:00Z"); // Fixes date offset issue
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    function getEventType(color) {
        const eventTypes = {
            "None": "Open",
            "Green": "Family Time",
            "Yellow": "Family Time (Visitors Welcome!)",
            "Red": "Golf Weekend",
            "Orange": "Hunting",
            "Blue": "Work Weekend",
            "Purple": "Trout Weekend"
        };
        return eventTypes[color] || "Unknown Type";
    }

    function editEvent(eventId) {
        db.collection("events").doc(eventId).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById("eventId").value = eventId;
                document.getElementById("eventTitle").value = data.title;
                document.getElementById("eventDate").value = data.start;
                document.getElementById("eventType").value = data.color;
            }
        }).catch(error => {
            console.error("❌ Error fetching event:", error);
        });
    }

    function deleteEvent(eventId) {
        if (confirm("❌ Are you sure you want to delete this event?")) {
            db.collection("events").doc(eventId).delete().then(() => {
                fetchEvents();
            }).catch(error => {
                console.error("❌ Error deleting event:", error);
            });
        }
    }

    document.getElementById("applyFilters").addEventListener("click", () => {
        const filterDate = document.getElementById("filterDate").value;
        fetchEvents(filterDate);
    });

    document.getElementById("eventForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const eventId = document.getElementById("eventId").value;
        const title = document.getElementById("eventTitle").value;
        const date = document.getElementById("eventDate").value;
        const color = document.getElementById("eventType").value;

        if (!title || !date) {
            alert("⚠️ Title and date are required!");
            return;
        }

        const eventData = { title, start: date, color };

        if (eventId) {
            db.collection("events").doc(eventId).update(eventData).then(() => {
                fetchEvents();
                document.getElementById("eventForm").reset();
            });
        } else {
            db.collection("events").add(eventData).then(() => {
                fetchEvents();
                document.getElementById("eventForm").reset();
            });
        }
    });

    eventList.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-btn")) {
            editEvent(event.target.dataset.id);
        } else if (event.target.classList.contains("delete-btn")) {
            deleteEvent(event.target.dataset.id);
        }
    });

    fetchEvents();
});
