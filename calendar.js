// Run script only after the full HTML document is loaded
document.addEventListener("DOMContentLoaded", () => {

    // Check that Firebase SDK is loaded
    if (!firebase.apps.length) {
        console.error("Firebase SDK not loaded. Ensure scripts are included in `calendar.html`.");
        return;
    }

    console.log("Firebase SDK detected. Initializing Firestore...");

    // Initialize Firestore database
    const db = firebase.firestore();

    // Set initial calendar date and selected event
    let currentDate = new Date();
    let selectedEventId = null;

    // Mapping of event types to their display labels and colors
    const eventTypeMap = {
        "None":   { label: "Open", color: "#FFFFFF" },
        "Green":  { label: "Family Time", color: "#A8E6A3" },
        "Yellow": { label: "Family Time (Visitors Welcome!)", color: "#FFF4A3" },
        "Red":    { label: "Golf Weekend", color: "#FFB3B3" },
        "Orange": { label: "Hunting", color: "#FFD699" },
        "Blue":   { label: "Work Weekend", color: "#A3D9FF" },
        "Purple": { label: "Trout Weekend", color: "#D3A3FF" }
    };

    // Render the calendar view for the current month
    function renderCalendar() {
        const monthName = document.getElementById("monthName");
        const calendarGrid = document.getElementById("calendarGrid");

        // Set date to the first day of the month
        currentDate.setDate(1);
        const firstDayIndex = currentDate.getDay(); // Day of the week (0-6)
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); // Last day of the month

        // Display current month and year
        monthName.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

        // Clear previous calendar entries
        calendarGrid.innerHTML = "";

        // Fill in empty grid spots before the first day of the month
        for (let i = 0; i < firstDayIndex; i++) {
            const blank = document.createElement("div");
            blank.classList.add("day", "empty");
            calendarGrid.appendChild(blank);
        }

        // Create a day cell for each day of the month
        for (let i = 1; i <= lastDay; i++) {
            const day = document.createElement("div");
            day.classList.add("day");

            // Format date string (YYYY-MM-DD)
            const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            day.dataset.date = dateStr;

            // Display date number
            const dateNumber = document.createElement("div");
            dateNumber.classList.add("date-number");
            dateNumber.textContent = i;
            day.appendChild(dateNumber);

            // Add click event to open modal for new event
            day.addEventListener("click", () => openEventModal(dateStr));
            calendarGrid.appendChild(day);
        }

        // Load and display events from the database
        fetchEvents();
    }

    // Fetch events from Firestore and render them on the calendar
    function fetchEvents() {
        db.collection("events").get().then(snapshot => {
            snapshot.forEach(doc => {
                const event = doc.data();
                if (!event.start) return; // Skip events without start date

                event.id = doc.id; // Store document ID for later use

                // Parse event start and end dates
                const startDate = new Date(event.start + "T00:00:00");
                const endDate = event.end ? new Date(event.end + "T00:00:00") : startDate;

                // Loop through each date between start and end
                let current = new Date(startDate);
                while (current <= endDate) {
                    const eventDateStr = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;

                    // Select day element(s) matching the event date
                    document.querySelectorAll(`.day[data-date="${eventDateStr}"]`).forEach(dayElement => {
                        // Ensure there is a container for events in this cell
                        let container = dayElement.querySelector(".event-container");
                        if (!container) {
                            container = document.createElement("div");
                            container.classList.add("event-container");
                            dayElement.appendChild(container);
                        }

                        // Determine event display properties based on type
                        const eventData = eventTypeMap[event.color] || eventTypeMap["None"];
                        const eventDiv = document.createElement("div");
                        eventDiv.classList.add("event-block");
                        eventDiv.style.backgroundColor = eventData.color;
                        eventDiv.textContent = event.title;

                        // Add click event to edit this event
                        eventDiv.addEventListener("click", (e) => {
                            e.stopPropagation(); // Prevent opening new event modal
                            openEventModal(eventDateStr, event.id, event); // Open for editing
                        });

                        container.appendChild(eventDiv);
                    });

                    // Move to next day
                    current.setDate(current.getDate() + 1);
                }
            });
        }).catch(error => {
            console.error("Error loading events:", error);
        });
    }

    // Open the event modal with pre-filled data (for editing) or blank (for new)
    function openEventModal(date, eventId = null, eventData = {}) {
        selectedEventId = eventId;

        // Populate modal fields
        document.getElementById("eventStart").value = date;
        document.getElementById("eventTitle").value = eventData.title || "";
        document.getElementById("eventEnd").value = eventData.end || "";
        document.getElementById("eventStartTime").value = eventData.startTime || "";
        document.getElementById("eventEndTime").value = eventData.endTime || "";
        document.getElementById("eventType").value = eventData.color || "None";
        document.getElementById("eventDetails").value = eventData.details || "";

        // Show the modal
        document.getElementById("eventModal").style.display = "block";
    }

    // Hide the event modal and reset selected event
    function closeEventModal() {
        document.getElementById("eventModal").style.display = "none";
        selectedEventId = null;
    }

    // Save new or updated event to Firestore
    function saveEvent() {
        // Gather values from modal inputs
        const title = document.getElementById("eventTitle").value;
        const start = document.getElementById("eventStart").value;
        const end = document.getElementById("eventEnd").value || start;
        const startTime = document.getElementById("eventStartTime").value;
        const endTime = document.getElementById("eventEndTime").value;
        const type = document.getElementById("eventType").value;
        const details = document.getElementById("eventDetails").value;

        // Basic validation
        if (!title || !start) {
            alert("Event title and start date are required!");
            return;
        }

        // Create event object
        const eventData = { title, start, end, startTime, endTime, type, details, color: type };

        if (selectedEventId) {
            // Update existing event
            db.collection("events").doc(selectedEventId).set(eventData).then(() => {
                console.log("Event updated.");
                renderCalendar();
                closeEventModal();
            }).catch(error => {
                console.error("Error updating event:", error);
            });
        } else {
            // Add new event
            db.collection("events").add(eventData).then(() => {
                console.log("Event added.");
                renderCalendar();
                closeEventModal();
            }).catch(error => {
                console.error("Error adding event:", error);
            });
        }
    }

    // Delete the selected event from Firestore
    function deleteEvent() {
        if (!selectedEventId) {
            alert("No event selected to delete.");
            return;
        }

        db.collection("events").doc(selectedEventId).delete().then(() => {
            console.log("Event deleted.");
            selectedEventId = null;
            closeEventModal();
            renderCalendar();
        }).catch(error => {
            console.error("Error deleting event:", error);
        });
    }

    // Button listeners for calendar navigation and modal actions

    // Move to previous month
    document.getElementById("prevBtn").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    // Move to next month
    document.getElementById("nextBtn").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Jump to current date
    document.getElementById("todayBtn").addEventListener("click", () => {
        currentDate = new Date();
        renderCalendar();
    });

    // Modal buttons (only if these elements exist in your HTML)
    document.getElementById("saveEventBtn")?.addEventListener("click", saveEvent);
    document.getElementById("deleteEventBtn")?.addEventListener("click", deleteEvent);
    document.getElementById("closeModalBtn")?.addEventListener("click", closeEventModal);

    // Render the calendar initially
    renderCalendar();
}); // <-- This closes the DOMContentLoaded event listener
