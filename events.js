document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const eventList = document.getElementById("eventList");

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
            <button onclick="editEvent('${id}', '${data.title}', '${data.start}', '${data.color}')">Edit</button>
            <button onclick="deleteEvent('${id}')">Delete</button>
        `;
        eventList.appendChild(eventItem);
    }

    function formatDate(date) {
        const d = new Date(date);
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

    function editEvent(id, title, date, color) {
        document.getElementById("eventTitle").value = title;
        document.getElementById("eventDate").value = date;
        document.getElementById("eventType").value = color;

        document.getElementById("eventForm").onsubmit = (e) => {
            e.preventDefault();
            const updatedTitle = document.getElementById("eventTitle").value;
            const updatedDate = document.getElementById("eventDate").value;
            const updatedColor = document.getElementById("eventType").value;

            db.collection("events").doc(id).update({
                title: updatedTitle,
                start: updatedDate,
                color: updatedColor
            }).then(() => {
                fetchEvents();
                document.getElementById("eventForm").reset();
            }).catch(error => {
                console.error("❌ Error updating event:", error);
            });
        };
    }

    function deleteEvent(id) {
        if (confirm("❌ Are you sure you want to delete this event?")) {
            db.collection("events").doc(id).delete().then(() => {
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

    fetchEvents();
});
