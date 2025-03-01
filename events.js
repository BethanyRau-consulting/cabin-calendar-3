document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const eventListDiv = document.getElementById("eventList");
    let selectedEventId = null;

    function fetchEvents(order = "asc", monthYear = "") {
        let query = db.collection("events").orderBy("start", order);

        if (monthYear) {
            query = query.where("start", ">=", `${monthYear}-01`)
                         .where("start", "<=", `${monthYear}-31`);
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

    function displayEvent(id, data) {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event-entry");
        eventDiv.innerHTML = `
            <h3>${data.title} - ${formatDate(data.start)}</h3>
            <p><strong>End Date:</strong> ${data.end ? formatDate(data.end) : "N/A"}</p>
            <p><strong>Time:</strong> ${data.startTime || "N/A"} - ${data.endTime || "N/A"}</p>
            <p><strong>Details:</strong> ${data.details || "No details provided."}</p>
            <button onclick="editEvent('${id}', '${data.title}', '${data.start}', '${data.end || ''}', '${data.startTime || ''}', '${data.endTime || ''}', '${data.details.replace(/'/g, "&#39;")}')">Edit</button>
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
        const details = document.getElementById("eventDetails").value;

        if (!title || !start) {
            alert("⚠️ Event title and start date are required!");
            return;
        }

        if (selectedEventId) {
            db.collection("events").doc(selectedEventId).update({
                title, start, end, startTime, endTime, details
            }).then(() => {
                console.log("✅ Event updated!");
                resetForm();
                fetchEvents();
            }).catch(error => {
                console.error("❌ Error updating event:", error);
            });
        } else {
            db.collection("events").add({
                title, start, end, startTime, endTime, details,
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

    window.editEvent = function (id, title, start, end, startTime, endTime, details) {
        document.getElementById("eventTitle").value = title;
        document.getElementById("eventStart").value = start;
        document.getElementById("eventEnd").value = end;
        document.getElementById("eventStartTime").value = startTime;
        document.getElementById("eventEndTime").value = endTime;
        document.getElementById("eventDetails").value = details;
        selectedEventId = id;

        document.getElementById("submitEvent").textContent = "Update";
    };

    window.deleteEvent = function (id) {
        if (confirm("❌ Are you sure you want to delete this event?")) {
            db.collection("events").doc(id).delete().then(() => {
                console.log("✅ Event deleted!");
                fetchEvents();
            }).catch(error => {
                console.error("❌ Error deleting event:", error);
            });
        }
    };

    function resetForm() {
        document.getElementById("eventTitle").value = "";
        document.getElementById("eventStart").value = "";
        document.getElementById("eventEnd").value = "";
        document.getElementById("eventStartTime").value = "";
        document.getElementById("eventEndTime").value = "";
        document.getElementById("eventDetails").value = "";
        document.getElementById("submitEvent").textContent = "Submit";
        selectedEventId = null;
    }

    document.getElementById("submitEvent").addEventListener("click", submitEvent);
    document.getElementById("cancelEvent").addEventListener("click", resetForm);

    fetchEvents();
});
