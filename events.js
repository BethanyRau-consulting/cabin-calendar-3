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

    // 🔹 Mapping of Hex Codes to Event Type Names
    const colorMapping = {
        "#ff0000": "Red - Golf Weekend",
        "#ffa500": "Orange - Hunting",
        "#0000ff": "Blue - Work Weekend",
        "#800080": "Purple - Trout Weekend",
        "#008000": "Green - Family Time",
        "#ffff00": "Yellow - Family Time (Visitors Welcome!)",
        "#ff69b4": "Pink - Special Occasion",
        "#d3d3d3": "Gray - Other"
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

        // 🔹 Convert hex color to event name (fallback to "Unknown Type" if missing)
        const eventType = colorMapping[event.color] || "Unknown Type";

        eventItem.innerHTML = `
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${formatDate(event.start)} - ${event.end ? formatDate(event.end) : formatDate(event.start)}</p>
            <p><strong>Time:</strong> ${event.startTime || "N/A"} - ${event.endTime || "N/A"}</p>
            <p><strong>Details:</strong> ${event.details || "No details provided."}</p>
            <p><strong>Type:</strong> ${eventType}</p>
        `;
        eventList.appendChild(eventItem);
    }

    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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
