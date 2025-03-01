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
    const todayBtn = document.getElementById("todayBtn");

    let selectedEventId = null;
    let currentDate = new Date();

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

    todayBtn.addEventListener("click", () => {
        filterMonthYear.value = currentDate.toISOString().slice(0, 7);
        fetchEvents("", filterMonthYear.value);
    });

    fetchEvents();
});
