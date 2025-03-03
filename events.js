document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `events.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const eventList = document.getElementById("eventList");

    function fetchEvents(sortOrder = "newest", filterMonth = "", filterYear = "") {
        let query = db.collection("events").orderBy("start", sortOrder === "newest" ? "desc" : "asc");

        if (filterMonth && filterYear) {
            query = query.where("start", ">=", `${filterYear}-${filterMonth}-01`)
                         .where("start", "<=", `${filterYear}-${filterMonth}-31`);
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
            console.error("❌ Error fetching events:", error);
        });
    }

    function displayEvent(id, data) {
        const eventItem = document.createElement("div");
        eventItem.classList.add("event-item");
        eventItem.innerHTML = `
            <h3>${data.title}</h3>
            <p><strong>Date:</strong> ${formatDate(data.start)}</p>
            <p><strong>Type:</strong> ${data.color}</p>
            <button onclick="editEvent('${id}')">Edit</button>
            <button onclick="deleteEvent('${id}')">Delete</button>
        `;
        eventList.appendChild(eventItem);
    }

    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    function editEvent(id) {
        db.collection("events").doc(id).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById("eventTitle").value = data.title;
                document.getElementById("eventDate").value = data.start;
                document.getElementById("eventType").value = data.color;

                document.getElementById("eventForm").onsubmit = (e) => {
                    e.preventDefault();
                    const updatedTitle = document.getElementById("eventTitle").value;
                    const updatedDate = document.getElementById("eventDate").value;
                    const updatedColor = document.getElementById("eventType").value;

                    db.collection("events").doc(id).update({
                        title: updatedTitle,
                        start: updatedDate,
                        color: updatedColor
                    }).then(() => {
                        fetchEvents();
                        document.getElementById("eventForm").reset();
                    }).catch(error => {
                        console.error("❌ Error updating event:", error);
                    });
                };
            }
        }).catch(error => {
            console.error("❌ Error fetching event:", error);
        });
    }

    function deleteEvent(id) {
        if (confirm("❌ Are you sure you want to delete this event?")) {
            db.collection("events").doc(id).delete().then(() => {
                fetchEvents();
            }).catch(error => {
                console.error("❌ Error deleting event:", error);
            });
        }
    }

    document.getElementById("applyFilters").addEventListener("click", () => {
        const sortOrder = document.getElementById("sortOrder").value;
        const filterMonth = document.getElementById("filterMonth").value;
        const filterYear = document.getElementById("filterYear").value;
        fetchEvents(sortOrder, filterMonth, filterYear);
    });

    fetchEvents();
});
