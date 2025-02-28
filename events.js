// Initialize Firestore
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    const eventList = document.getElementById("eventList");
    const filterDate = document.getElementById("filterDate");
    const filterType = document.getElementById("filterType");
    const applyFilters = document.getElementById("applyFilters");

    function fetchEvents() {
        let query = db.collection("events").orderBy("start");
        
        query.get().then(snapshot => {
            eventList.innerHTML = ""; // Clear previous results
            snapshot.forEach(doc => {
                const event = doc.data();
                displayEvent(event);
            });
        }).catch(error => {
            console.error("Error fetching events: ", error);
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

    applyFilters.addEventListener("click", () => {
        let query = db.collection("events").orderBy("start");
        
        if (filterDate.value) {
            query = query.where("start", "==", filterDate.value);
        }
        
        if (filterType.value !== "all") {
            query = query.where("color", "==", filterType.value);
        }

        query.get().then(snapshot => {
            eventList.innerHTML = "";
            if (snapshot.empty) {
                eventList.innerHTML = "<p>No events match the selected filters.</p>";
            } else {
                snapshot.forEach(doc => {
                    displayEvent(doc.data());
                });
            }
        }).catch(error => {
            console.error("Error applying filters: ", error);
        });
    });

    fetchEvents();
});
