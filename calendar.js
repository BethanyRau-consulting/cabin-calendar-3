import { db } from "./firebase-config.js";
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentDate = new Date();
let selectedEventId = null;

const eventTypeMap = {
  "None":   { label: "Open", color: "#FFFFFF" },
  "Green":  { label: "Family Time", color: "#A8E6A3" },
  "Yellow": { label: "Family Time (Visitors Welcome!)", color: "#FFF4A3" },
  "Red":    { label: "Golf Weekend", color: "#FFB3B3" },
  "Orange": { label: "Hunting", color: "#FFD699" },
  "Blue":   { label: "Work Weekend", color: "#A3D9FF" },
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

    day.addEventListener("click", () => openEventModal(dateStr));
    calendarGrid.appendChild(day);
  }

  fetchEventsAndRender();
}

async function fetchEventsAndRender() {
  try {
    const eventsCol = collection(db, "events");
    const snapshot = await getDocs(eventsCol);

    snapshot.forEach(docSnap => {
      const event = docSnap.data();
      if (!event.start) return;

      const startDate = new Date(event.start + "T00:00:00");
      const endDate = event.end ? new Date(event.end + "T00:00:00") : startDate;

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
            openEventModal(eventDateStr, docSnap.id, event);
          });
          container.appendChild(eventDiv);
        });
        current.setDate(current.getDate() + 1);
      }
    });
  } catch (err) {
    console.error("Error loading events for calendar:", err);
  }
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
  selectedEventId = null;
  document.getElementById("eventForm").reset();
  document.getElementById("eventModal").style.display = "none";
}

async function saveEventFromCalendar() {
  const title = document.getElementById("eventTitle").value;
  const start = document.getElementById("eventStart").value;
  const end = document.getElementById("eventEnd").value || start;
  const startTime = document.getElementById("eventStartTime").value;
  const endTime = document.getElementById("eventEndTime").value;
  const type = document.getElementById("eventType").value;
  const details = document.getElementById("eventDetails").value;

  if (!title || !start) {
    alert("Event title and start date are required!");
    return;
  }

  const payload = { title, start, end, startTime, endTime, color: type, details };

  try {
    if (selectedEventId) {
      await setDoc(doc(db, "events", selectedEventId), payload);
    } else {
      await addDoc(collection(db, "events"), payload);
    }
    renderCalendar();
    closeEventModal();
    window.dispatchEvent(new Event('eventsUpdated'));
  } catch (err) {
    console.error("Error saving event:", err);
  }
}

async function deleteEventFromCalendar() {
  if (!selectedEventId) {
    alert("No event selected to delete.");
    return;
  }
  try {
    await deleteDoc(doc(db, "events", selectedEventId));
    closeEventModal();
    renderCalendar();
    window.dispatchEvent(new Event('eventsUpdated'));
  } catch (err) {
    console.error("Error deleting event:", err);
  }
}

// Buttons
document.getElementById("prevBtn")?.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
document.getElementById("nextBtn")?.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
document.getElementById("todayBtn")?.addEventListener("click", () => { currentDate = new Date(); renderCalendar(); });
document.getElementById("saveEventBtn")?.addEventListener("click", saveEventFromCalendar);
document.getElementById("deleteEventBtn")?.addEventListener("click", deleteEventFromCalendar);
document.getElementById("cancelEventBtn")?.addEventListener("click", closeEventModal);

// Initial render
window.addEventListener("DOMContentLoaded", () => renderCalendar());
window.renderCalendar = renderCalendar;
