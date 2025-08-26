
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase-utils.js';

async function checkUploadsAllowed() {
    const configRef = doc(db, 'config', 'limits');
    const configSnap = await getDoc(configRef);
    return configSnap.exists() && configSnap.data().allowUploads === true;
}

// Wait until the full HTML document has loaded before executing the script
document.addEventListener("DOMContentLoaded", () => {
    // Check if Firebase SDK is available
    if (typeof firebase === "undefined") {
        console.error("Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("Firebase SDK detected. Initializing Firestore...");

    // Initialize Firestore database reference
    const db = firebase.firestore();
    const eventList = document.getElementById("eventList");

    /**
     * Fetches events from Firestore and displays them
     * If a filter date is provided, it retrieves only events within that month
     */
    function fetchEvents(filterDate = "") {
        let query = db.collection("events").orderBy("start", "asc");

        // Apply date filtering if filterDate is provided
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
            console.error("Error fetching events:", error);
        });
    }

    /**
     * Creates and displays a single event item in the event list
     */
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

    /**
     * Formats a date string to a more user-friendly format
     */
    function formatDate(date) {
        const d = new Date(date + "T12:00:00Z");
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    /**
     * Converts the stored color code to a readable event type
     */
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

    /**
     * Loads an event’s data into the form for editing
     */
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
                document.getElementById("eventType").value = data.color || "None";
                document.getElementById("eventDetails").value = data.details || "";
            }
        }).catch(error => {
            console.error("Error fetching event:", error);
        });
    }

    /**
     * Deletes an event from the database
     * Refreshes the event list after deletion
     */
    function deleteEvent(eventId) {
        if (confirm("Are you sure you want to delete this event?")) {
            db.collection("events").doc(eventId).delete().then(() => {
                console.log("Event deleted!");
                fetchEvents();
                document.getElementById("eventForm").reset();
                document.getElementById("eventId").value = "";
            }).catch(error => {
                console.error("Error deleting event:", error);
            });
        }
    }

    /**
     * Clears the form and resets event ID for creating a new entry
     */
    function cancelEvent() {
        document.getElementById("eventForm").reset();
        document.getElementById("eventId").value = "";
    }

    /**
     * Saves a new event or updates an existing one in Firestore
     * Performs validation and resets the form on success
     */
    function saveEvent() {
        const eventId = document.getElementById("eventId").value;
        const title = document.getElementById("eventTitle").value;
        const start = document.getElementById("eventStart").value;
        const end = document.getElementById("eventEnd").value || null;
        const startTime = document.getElementById("eventStartTime").value || null;
        const endTime = document.getElementById("eventEndTime").value || null;
        const details = document.getElementById("eventDetails").value || "";
        const color = document.getElementById("eventType").value;

        // Ensure required fields are filled
        if (!title || !start) {
            alert("Title and start date are required!");
            return;
        }

        const eventData = { title, start, end, startTime, endTime, details, color };

        // If eventId exists, update the event; otherwise, create a new one
        if (eventId) {
            db.collection("events").doc(eventId).update(eventData).then(() => {
                console.log("Event updated!");
                fetchEvents();
                document.getElementById("eventForm").reset();
                document.getElementById("eventId").value = "";
            }).catch(error => {
                console.error("Error updating event:", error);
            });
        } else {
            db.collection("events").add(eventData).then(() => {
                console.log("Event added!");
                fetchEvents();
                document.getElementById("eventForm").reset();
            }).catch(error => {
                console.error("Error adding event:", error);
            });
        }
    }

    // Apply filter when user selects a month and clicks "Apply Filters"
    document.getElementById("applyFilters").addEventListener("click", () => {
        const filterDate = document.getElementById("filterDate").value;
        fetchEvents(filterDate);
    });

    // Handle event form submission
    document.getElementById("eventForm").addEventListener("submit", (e) => {
        e.preventDefault();
        saveEvent();
    });

    // Handle cancel button click
    document.getElementById("cancelEvent").addEventListener("click", cancelEvent);

    // Event delegation for edit and delete buttons
    eventList.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-btn")) {
            editEvent(event.target.dataset.id);
        } else if (event.target.classList.contains("delete-btn")) {
            deleteEvent(event.target.dataset.id);
        }
    });

    // Initial fetch to display all events on page load
    fetchEvents();
});
