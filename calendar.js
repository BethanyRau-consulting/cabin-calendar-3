document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in `calendar.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    let currentDate = new Date();
    let selectedEventId = null;

    const eventTypeMap = {
        "None": { label: "Open", color: "#FFFFFF" },
        "Green": { label: "Family Time", color: "#A8E6A3" },
        "Yellow": { label: "Family Time (Visitors Welcome!)", color: "#FFF4A3" },
        "Red": { label: "Golf Weekend", color: "#FFB3B3" },
        "Orange": { label: "Hunting", color: "#FFD699" },
        "Blue": { label: "Work Weekend", color: "#A3D9FF" },
        "Purple": { label: "Trout Weekend", color: "#D3A3FF" }
    };

    function renderCalendar() {
        const monthName = document.getElementById("monthName");
        const calendarGrid = document.getElementById("calendarGrid");
        currentDate.setDate(1);
        const firstDayIndex = currentDate.getDay();
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        monthName.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        calendarGrid.innerHTML = "";

        for (let i = 0; i < firstDayIndex; i++) {
            const blank = document.createElement("div");
            blank.classList.add("day", "empty");
            calendarGrid.appendChild(blank);
        }

        for (let i = 1; i <= lastDay; i++) {
            const day = document.createElement("div");
            day.classList.add("day");
            const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            day.dataset.date = dateStr;

            const dateNumber = document.createElement("div");
            dateNumber.classList.add("date-number");
            dateNumber.textContent = i;
            day.appendChild(dateNumber);

            calendarGrid.appendChild(day);
        }

        fetchEvents();
    }

    function fetchEvents() {
        db.collection("events").get().then(snapshot => {
            snapshot.forEach(doc => {
                const event = doc.data();
                if (!event.start) return;

                event.id = doc.id; // ✅ Store Firestore ID for editing/deleting

                const startDate = new Date(event.start + "T00:00:00");
                const endDate = event.end ? new Date(event.end + "T00:00:00") : new Date(event.start + "T00:00:00");

                let current = new Date(startDate);
                while (current <= endDate) {
                    const eventDateStr = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;

                    document.querySelectorAll(`.day[data-date="${eventDateStr}"]`).forEach(dayElement => {
                        let container = dayElement.querySelector(".event-container");
                        if (!container) {
                            container = document.createElement("div");
                            container.classList.add("event-container");
                            dayElement.appendChild(container);
                        }

                        const eventData = eventTypeMap[event.color] || eventTypeMap["None"];
                        const eventDiv = document.createElement("div");
                        eventDiv.classList.add("event-block");
                        eventDiv.style.backgroundColor = eventData.color;
                        eventDiv.textContent = event.title;

                        eventDiv.addEventListener("click", (e) => {
                            e.stopPropagation();
                            openEventModal(eventDateStr, event.id, event);
                        });

                        container.appendChild(eventDiv);
                    });

                    current.setDate(current.getDate() + 1);
                }
            });
        }).catch(error => {
            console.error("❌ Error loading events:", error);
        });
    }

    function openEventModal(date, eventId = null, eventData = {}) {
        selectedEventId = eventId;
        document.getElementById("eventStart").value = date;
        document.getElementById("eventTitle").value = eventData.title || "";
        document.getElementById("eventEnd").value = eventData.end || "";
        document.getElementById("eventStartTime").value = eventData.startTime || "";
        document.getElementById("eventEndTime").value = eventData.endTime || "";
        document.getElementById("eventType").value = eventData.color || "None";
        document.getElementById("eventDetails").value = eventData.details || "";
        document.getElementById("eventModal").style.display = "block";
    }

    function closeEventModal() {
        document.getElementById("eventModal").style.display = "none";
        selectedEventId = null; // ✅ Clear on cancel
    }

    function saveEvent() {
        const title = document.getElementById("eventTitle").value;
        const start = document.getElementById("eventStart").value;
        const end = document.getElementById("eventEnd").value || start;
        const startTime = document.getElementById("eventStartTime").value;
        const endTime = document.getElementById("eventEndTime").value;
        const type = document.getElementById("eventType").value;
        const details = document.getElementById("eventDetails").value;

        if (!title || !start) {
            alert("⚠️ Event title and start date are required!");
            return;
        }

        const eventData = { title, start, end, startTime, endTime, type, details, color: type };

        if (selectedEventId) {
            db.collection("events").doc(selectedEventId).set(eventData).then(() => {
                console.log("✅ Event updated!");
                renderCalendar();
                closeEventModal();
            }).catch(error => {
                console.error("❌ Error updating event:", error);
            });
        } else {
            db.collection("events").add(eventData).then(() => {
                console.log("✅ Event added!");
                renderCalendar();
                closeEventModal();
            }).catch(error => {
                console.error("❌ Error adding event:", error);
            });
        }
    }

    function deleteEvent() {
        if (!selectedEventId) {
            alert("No event selected to delete.");
            return;
        }

        db.collection("events").doc(selectedEventId).delete().then(() => {
            console.log("✅ Event deleted.");
            selectedEventId = null;
            closeEventModal();
            renderCalendar();
        }).catch(error => {
            console.error("❌ Error deleting event:", error);
        });
    }

    // Navigation + Modal button listeners
    document.getElementById("prevBtn").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById("todayBtn").addEventListener("click", () => {
        currentDate = new Date();
        renderCalendar();
    });

    document.getElementById("cancelEvent").addEventListener("click", closeEventModal);
    document.getElementById("saveEvent").addEventListener("click", saveEvent);
    document.getElementById("deleteEvent").addEventListener("click", deleteEvent);

    renderCalendar();
});
