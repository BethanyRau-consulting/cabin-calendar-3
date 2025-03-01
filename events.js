document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const eventListDiv = document.getElementById("eventList");

    const filterType = document.getElementById("filterType");
    const filterMonthYear = document.getElementById("filterMonthYear");
    const filterEventsBtn = document.getElementById("filterEvents");

    let selectedEventId = null;

    // 🔹 Map event colors to their names
    const eventTypeMap = {
        "None": "Open",
        "Green": "Family Time",
        "Yellow": "Family Time (Visitors Welcome!)",
        "Red": "Golf Weekend",
        "Orange": "Hunting",
        "Blue": "Work Weekend",
        "Purple": "Trout Weekend"
    };

    function fetchEvents(filterTypeValue = "", filterMonthValue = "") {
        let query = db.collection("events").orderBy("start", "asc");

        if (filterTypeValue) {
            query = query.where("type", "==", filterTypeValue);
        }

        if (filterMonthValue) {
            query = query.where("start", ">=", `${filterMonthValue}-01`)
                         .where("start", "<=", `${filterMonthValue}-31`);
        }

        query.get().then(snapshot => {
            eventListDiv.innerHTML = "";
            if (snapshot.empty) {
                eventListDiv.innerHTML = "<p>No events found.</p>";
            } else {
                snapshot.forEach(doc => {
                    displayEvent(doc.id, doc.data());
                });
            }
        }).catch(error => {
            console.error("❌ Error fetching events:", error);
        });
    }
function editEvent(id, title, start, end, startTime, endTime, type, details) {
    document.getElementById("eventTitle").value = title;
    document.getElementById("eventStart").value = start;
    document.getElementById("eventEnd").value = end || "";
    document.getElementById("eventStartTime").value = startTime || "";
    document.getElementById("eventEndTime").value = endTime || "";
    document.getElementById("eventType").value = type;
    document.getElementById("eventDetails").value = details || "";
    document.getElementById("submitEvent").dataset.eventId = id; // Store event ID for updating
}

document.getElementById("submitEvent").addEventListener("click", () => {
    const id = document.getElementById("submitEvent").dataset.eventId;
    const title = document.getElementById("eventTitle").value;
    const start = document.getElementById("eventStart").value;
    const end = document.getElementById("eventEnd").value;
    const startTime = document.getElementById("eventStartTime").value;
    const endTime = document.getElementById("eventEndTime").value;
    const type = document.getElementById("eventType").value;
    const details = document.getElementById("eventDetails").value;

    if (!title || !start) {
        alert("⚠️ Event title and start date are required!");
        return;
    }

    if (id) {
        // Update existing event
        db.collection("events").doc(id).update({
            title, start, end, startTime, endTime, type, details
        }).then(() => {
            console.log("✅ Event updated!");
            document.getElementById("submitEvent").dataset.eventId = ""; // Reset
            fetchEvents();
        }).catch(error => {
            console.error("❌ Error updating event:", error);
        });
    } else {
        // Add new event
        db.collection("events").add({
            title, start, end, startTime, endTime, type, details
        }).then(() => {
            console.log("✅ Event added!");
            fetchEvents();
        }).catch(error => {
            console.error("❌ Error adding event:", error);
        });
    }
});

function deleteEvent(id) {
    if (confirm("❌ Are you sure you want to delete this event?")) {
        db.collection("events").doc(id).delete().then(() => {
            console.log("✅ Event deleted!");
            fetchEvents();
        }).catch(error => {
            console.error("❌ Error deleting event:", error);
        });
    }
}

function displayEvent(id, data) {
    const eventDiv = document.createElement("div");
    eventDiv.classList.add("event-entry");
    eventDiv.innerHTML = `
        <h3>${data.title} - ${formatDate(data.start)}</h3>
        <p><strong>End Date:</strong> ${data.end ? formatDate(data.end) : "N/A"}</p>
        <p><strong>Time:</strong> ${data.startTime || "N/A"} - ${data.endTime || "N/A"}</p>
        <p><strong>Type:</strong> ${eventTypeMap[data.type] || "Unknown Type"}</p>
        <p><strong>Details:</strong> ${data.details || "No details provided."}</p>
        <button onclick="editEvent('${id}', '${data.title}', '${data.start}', '${data.end || ''}', '${data.startTime || ''}', '${data.endTime || ''}', '${data.type}', '${data.details.replace(/'/g, "&#39;")}')">Edit</button>
        <button onclick="deleteEvent('${id}')">Delete</button>
    `;
    eventListDiv.appendChild(eventDiv);
}


    function formatDate(date) {
        const d = new Date(date + "T00:00:00");
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    filterEventsBtn.addEventListener("click", () => {
        fetchEvents(filterType.value, filterMonthYear.value);
    });

    fetchEvents();
});
