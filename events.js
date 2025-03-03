document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const eventList = document.getElementById("eventList");
    let selectedEventId = null;

    function fetchEvents(filterMonth = "", filterYear = "") {
        let query = db.collection("events").orderBy("start", "asc");

        if (filterMonth && filterYear) {
            query = query.where("start", ">=", `${filterYear}-${filterMonth}-01`)
                         .where("start", "<=", `${filterYear}-${filterMonth}-31`);
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
            <button onclick="editEvent('${id}')">Edit</button>
            <button onclick="deleteEvent('${id}')">Delete</button>
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
        const filterMonth = document.getElementById("filterMonth").value;
        const filterYear = document.getElementById("filterYear").value;
        fetchEvents(filterMonth, filterYear);
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

    fetchEvents();
});
