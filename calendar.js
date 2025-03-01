document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase App is not initialized! Check `calendar.html`.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    let currentDate = new Date();
    let selectedEventId = null;

function renderCalendar() {
    const monthName = document.getElementById("monthName");
    const calendarGrid = document.getElementById("calendarGrid");
    const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    monthName.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    calendarGrid.innerHTML = "";

    // Add blank spaces until the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
        const blank = document.createElement("div");
        blank.classList.add("day", "empty");
        calendarGrid.appendChild(blank);
    }

    for (let i = 1; i <= lastDay; i++) {
        const day = document.createElement("div");
        day.classList.add("day");
        day.textContent = i;
        day.dataset.date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        day.addEventListener("click", () => openEventModal(day.dataset.date));

        // Create an inner div for event colors
        const eventColorContainer = document.createElement("div");
        eventColorContainer.classList.add("event-colors");
        day.appendChild(eventColorContainer);

        calendarGrid.appendChild(day);
    }

    fetchEvents();
}

function fetchEvents() {
    db.collection("events").get().then(snapshot => {
        let eventsByDate = {};

        snapshot.forEach(doc => {
            const event = doc.data();
            if (!event.start || typeof event.start !== 'string') return;

            const startDate = new Date(event.start);
            const endDate = event.end ? new Date(event.end) : new Date(event.start);
            let current = new Date(startDate);

            while (current <= endDate) {
                const eventDateStr = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
                
                if (!eventsByDate[eventDateStr]) {
                    eventsByDate[eventDateStr] = [];
                }
                eventsByDate[eventDateStr].push(event.color || "#ffcc00");

                current.setDate(current.getDate() + 1);
            }
        });

        // Apply colors to the calendar days
        Object.keys(eventsByDate).forEach(date => {
            const dayElements = document.querySelectorAll(`.day[data-date="${date}"]`);
            dayElements.forEach(dayElement => {
                const eventColorContainer = dayElement.querySelector(".event-colors");
                eventColorContainer.innerHTML = ""; // Clear previous colors

                const colors = eventsByDate[date];
                colors.forEach(color => {
                    const colorDiv = document.createElement("div");
                    colorDiv.style.backgroundColor = color;
                    colorDiv.classList.add("event-color");
                    eventColorContainer.appendChild(colorDiv);
                });
            });
        });
    }).catch(error => {
        console.error("❌ Error loading events:", error);
    });
}


    function openEventModal(date, eventId = null, title = "", color = "#ffcc00", details = "", startTime = "", endTime = "", endDate = date) {
        console.log(`📅 Opening event modal for date: ${date}`);

        selectedEventId = eventId;

        document.getElementById("eventTitle").value = title;
        document.getElementById("eventStart").value = date;
        document.getElementById("eventEnd").value = endDate;
        document.getElementById("eventStartTime").value = startTime;
        document.getElementById("eventEndTime").value = endTime;
        document.getElementById("eventDetails").value = details;
        document.getElementById("eventColor").value = color;

        document.getElementById("eventModal").style.display = "block";
    }

    function closeEventModal() {
        document.getElementById("eventModal").style.display = "none";
    }

    function saveEvent() {
        const title = document.getElementById("eventTitle").value;
        const start = document.getElementById("eventStart").value;
        const end = document.getElementById("eventEnd").value;
        const startTime = document.getElementById("eventStartTime").value;
        const endTime = document.getElementById("eventEndTime").value;
        const details = document.getElementById("eventDetails").value;
        const color = document.getElementById("eventColor").value;

        if (!title || !start) {
            alert("⚠️ Event title and start date are required!");
            return;
        }

        const eventData = { title, start, end, startTime, endTime, details, color };

        if (selectedEventId) {
            db.collection("events").doc(selectedEventId).update(eventData).then(() => {
                closeEventModal();
                renderCalendar();
            }).catch(error => {
                console.error("❌ Error updating event:", error);
            });
        } else {
            db.collection("events").add(eventData).then(() => {
                closeEventModal();
                renderCalendar();
            }).catch(error => {
                console.error("❌ Error adding event:", error);
            });
        }
    }

    function deleteEvent() {
        if (!selectedEventId) return;

        if (confirm("❌ Are you sure you want to delete this event?")) {
            db.collection("events").doc(selectedEventId).delete().then(() => {
                closeEventModal();
                renderCalendar();
            }).catch(error => {
                console.error("❌ Error deleting event:", error);
            });
        }
    }

    document.getElementById("prevBtn").addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    document.getElementById("nextBtn").addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    document.getElementById("todayBtn").addEventListener("click", () => { currentDate = new Date(); renderCalendar(); });

    document.getElementById("cancelEvent").addEventListener("click", closeEventModal);
    document.getElementById("saveEvent").addEventListener("click", saveEvent);
    document.getElementById("deleteEvent").addEventListener("click", deleteEvent);

    renderCalendar();
});
