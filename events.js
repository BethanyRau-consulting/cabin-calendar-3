document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");

    // Initialize Firestore
    const db = firebase.firestore();
    const eventList = document.getElementById("eventList");
    const monthName = document.getElementById("monthName");
    let currentDate = new Date();

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
                console.error("❌ Error fetching events: ", error);
            });
    }

    function displayEvent(event) {
        const eventItem = document.createElement("div");
        eventItem.classList.add("event-item");
        eventItem.innerHTML = `
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${event.start} - ${event.end || event.start}</p>
            <p><strong>Time:</strong> ${event.startTime || "N/A"} - ${event.endTime || "N/A"}</p>
            <p><strong>Details:</strong> ${event.details || "No details provided."}</p>
            <p><strong>Type:</strong> ${event.color || "N/A"}</p> 
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
