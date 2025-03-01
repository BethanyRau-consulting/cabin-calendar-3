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

            day.addEventListener("click", () => openEventModal(day.dataset.date, null));

            calendarGrid.appendChild(day);
        }

        fetchEvents();
    }

    function fetchEvents() {
        db.collection("events").get().then(snapshot => {
            snapshot.forEach(doc => {
                const event = doc.data();
                if (!event.start || typeof event.start !== 'string') return;

                let startDate = new Date(event.start + "T00:00:00");
                let endDate = event.end ? new Date(event.end + "T00:00:00") : startDate;

                let current = new Date(startDate);
                while (current <= endDate) {
                    const eventDateStr = current.toISOString().split("T")[0];
                    document.querySelectorAll(`.day[data-date="${eventDateStr}"]`).forEach(dayElement => {
                        dayElement.style.backgroundColor = event.color || "#ffcc00";

                        let titleDiv = dayElement.querySelector('.event-title');
                        if (!titleDiv) {
                            titleDiv = document.createElement('div');
                            titleDiv.classList.add('event-title');
                            dayElement.appendChild(titleDiv);
                        }
                        titleDiv.textContent = event.title;

                        dayElement.addEventListener("click", (eventClick) => {
                            eventClick.stopPropagation();
                            openEventModal(event.start, doc.id, event.title, event.color, event.details, event.startTime, event.endTime, event.end);
                        });
                    });
                    current.setDate(current.getDate() + 1);
                }
            });
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
