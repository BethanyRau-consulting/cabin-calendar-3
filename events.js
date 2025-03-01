document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const eventListDiv = document.getElementById("eventList");
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

    function fetchEvents() {
        db.collection("events").orderBy("start", "asc").get().then(snapshot => {
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

    function submitEvent() {
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

        if (selectedEventId) {
            db.collection("events").doc(selectedEventId).update({
                title, start, end, startTime, endTime, type, details
            }).then(() => {
                console.log("✅ Event updated!");
                resetForm();
                fetchEvents();
            }).catch(error => {
                console.error("❌ Error updating event:", error);
            });
        } else {
            db.collection("events").add({
                title, start, end, startTime, endTime, type, details,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log("✅ Event added!");
                resetForm();
                fetchEvents();
            }).catch(error => {
                console.error("❌ Error adding event:", error);
            });
        }
    }

    function resetForm() {
        document.getElementById("eventTitle").value = "";
        document.getElementById("eventStart").value = "";
        document.getElementById("eventEnd").value = "";
        document.getElementById("eventStartTime").value = "";
        document.getElementById("eventEndTime").value = "";
        document.getElementById("eventType").value = "None";
        document.getElementById("eventDetails").value = "";
        selectedEventId = null;
    }

    document.getElementById("submitEvent").addEventListener("click", submitEvent);
    document.getElementById("cancelEvent").addEventListener("click", resetForm);

    fetchEvents();
});
