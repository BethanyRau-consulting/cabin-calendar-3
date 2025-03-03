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
            <p><strong>Date:</strong> ${formatDate(data.start)} - ${data.end ? formatDate(data.end) : "N/A"}</p>
            <p><strong>Time:</strong> ${data.startTime || "N/A"} - ${data.endTime || "N/A"}</p>
            <p><strong>Type:</strong> ${getEventType(data.color)}</p>
            <p><strong>Details:</strong> ${data.details || "No details provided."}</p>
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
                document.getElementById("eventStart").value = data.start;
                document.getElementById("eventEnd").value = data.end || "";
                document.getElementById("eventStartTime").value = data.startTime || "";
                document.getElementById("eventEndTime").value = data.endTime || "";
                document.getElementById("eventType").value = data.color;
                document.getElementById("eventDetails").value = data.details || "";
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
        saveEvent();
    });

    fetchEvents();

    window.editEvent = editEvent;
    window.deleteEvent = deleteEvent;
});
