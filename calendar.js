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

            day.addEventListener("click", () => openEventModal(day.dataset.date));
            calendarGrid.appendChild(day);
        }

        fetchEvents();
    }

    function fetchEvents() {
        db.collection("events").get().then(snapshot => {
            snapshot.forEach(doc => {
                const event = doc.data();
                if (!event.start || typeof event.start !== 'string') return;

                const startDate = new Date(event.start);
                const endDate = event.end ? new Date(event.end) : new Date(event.start);

                let current = new Date(startDate);
                while (current <= endDate) {
                    const eventDateStr = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
                    document.querySelectorAll(`.day[data-date="${eventDateStr}"]`).forEach(dayElement => {
                        dayElement.style.backgroundColor = event.color || "#ffcc00";
                        let titleDiv = dayElement.querySelector('.event-title');
                        if (!titleDiv) {
                            titleDiv = document.createElement('div');
                            titleDiv.classList.add('event-title');
                            dayElement.appendChild(titleDiv);
                        }
                        titleDiv.textContent = event.title;
                    });
                    current.setDate(current.getDate() + 1);
                }
            });
        });
    }

    function openEventModal(date) {
        selectedEventId = null;
        document.getElementById("eventStart").value = date;
        document.getElementById("eventEnd").value = date;
        document.getElementById("eventModal").style.display = "block";
    }

    function closeEventModal() {
        document.getElementById("eventModal").style.display = "none";
    }

    document.getElementById("prevBtn").addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    document.getElementById("nextBtn").addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    document.getElementById("todayBtn").addEventListener("click", () => { currentDate = new Date(); renderCalendar(); });
    document.getElementById("cancelEvent").addEventListener("click", closeEventModal);

    renderCalendar();
});
