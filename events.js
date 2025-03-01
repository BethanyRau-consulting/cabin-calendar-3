document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const eventList = document.getElementById("eventList");
    const monthName = document.getElementById("monthName");
    let currentDate = new Date();

const colorMapping = {
    "#ff0000": "Red - Golf Weekend",
    "#ffa500": "Orange - Hunting",
    "#0000ff": "Blue - Work Weekend",
    "#800080": "Purple - Trout Weekend",
    "#008000": "Green - Family Time",
    "#ffff00": "Yellow - Family Time (Visitors Allowed)",
    "#ff69b4": "Pink - Special Occasion",
    "#d3d3d3": "Gray - Other",
    "#ffcc00": "Yellow - Cabin Use",
    "#00ff00": "Bright Green - Family Gathering"
};


    function fetchEventsForMonth() {
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        monthName.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

        db.collection("events")
            .where("start", ">=", `${year}-${month}-01`)
            .where("start", "<=", `${year}-${month}-31`)
            .orderBy("start")
            .get()
            .then(snapshot => {
                eventList.innerHTML = "";
                if (snapshot.empty) {
                    eventList.innerHTML = "<p>No events found for this month.</p>";
                } else {
                    snapshot.forEach(doc => {
                        displayEvent(doc.data());
                    });
                }
            })
            .catch(error => {
                console.error("❌ Error fetching events:", error);
            });
    }

function displayEvent(event) {
    const eventItem = document.createElement("div");
    eventItem.classList.add("event-item");

    // 🔹 Use the exact stored date string without converting to a Date object
    const startDate = event.start;  
    const endDate = event.end ? event.end : event.start;

    // 🔹 Convert hex color to event name (fallback to "Unknown Type" if missing)
    const eventType = colorMapping[event.color.toLowerCase()] || "Unknown Type";

    eventItem.innerHTML = `
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${formatDate(startDate)} - ${formatDate(endDate)}</p>
        <p><strong>Time:</strong> ${event.startTime || "N/A"} - ${event.endTime || "N/A"}</p>
        <p><strong>Details:</strong> ${event.details || "No details provided."}</p>
        <p><strong>Type:</strong> ${eventType}</p>
    `;
    eventList.appendChild(eventItem);
}

// ✅ Format Date Function (No UTC Conversion)
function formatDate(dateString) {
    return dateString; // 🔹 Display exactly as stored in Firestore
}


    document.getElementById("prevMonth").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        fetchEventsForMonth();
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        fetchEventsForMonth();
    });

    fetchEventsForMonth();
});
