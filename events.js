// Ensure Firebase is initialized before using Firestore
if (typeof firebase === "undefined") {
    console.error("Firebase SDK not loaded. Ensure Firebase scripts are included in your HTML.");
} else {
    console.log("✅ Firebase SDK loaded successfully.");
}

// Initialize Firebase Firestore
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    const eventList = document.getElementById("eventList");
    const monthName = document.getElementById("monthName");
    let currentDate = new Date();

    const colorMapping = {
        "#00FF00": "Family Time",
        "#FFFF00": "Family Time (Visitors Welcome)",
        "#FF0000": "Golf Weekend",
        "#FFA500": "Hunting",
        "#0000FF": "Work Weekend",
        "#800080": "Trout Weekend"
    };

    function formatDate(dateStr) {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    }

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
                console.error("Error fetching events: ", error);
            });
    }

    function displayEvent(event) {
        const eventItem = document.createElement("div");
        eventItem.classList.add("event-item");
        const eventType = colorMapping[event.color] || "Unknown Type";
        eventItem.innerHTML = `
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${formatDate(event.start)} - ${formatDate(event.end || event.start)}</p>
            <p><strong>Time:</strong> ${event.startTime || "N/A"} - ${event.endTime || "N/A"}</p>
            <p><strong>Details:</strong> ${event.details || "No details provided."}</p>
            <p><strong>Type:</strong> ${eventType}</p>
        `;
        eventList.appendChild(eventItem);
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
