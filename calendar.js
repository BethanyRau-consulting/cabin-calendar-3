import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

async function fetchEvents() {
    const events = [];
    try {
        const snapshot = await getDocs(collection(db, "events"));
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });
    } catch (err) {
        console.error("Error loading events:", err);
    }
    return events;
}

async function renderCalendar() {
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

        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`;
        day.dataset.date = dateStr;

        const dateNumber = document.createElement("div");
        dateNumber.classList.add("date-number");
        dateNumber.textContent = i;
        day.appendChild(dateNumber);

        day.addEventListener("click", () => openEventModal(dateStr));
        calendarGrid.appendChild(day);
    }

    const events = await fetchEvents();
    events.forEach(event => {
        const startDate = new Date(event.start);
        const endDate = event.end ? new Date(event.end) : startDate;
        let current = new Date(startDate);
        while (current <= endDate) {
            const eventDateStr = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,"0")}-${String(current.getDate()).padStart(2,"0")}`;
            document.querySelectorAll(`.day[data-date="${eventDateStr}"]`).forEach(dayEl => {
                let container = dayEl.querySelector(".event-container");
                if (!container) {
                    container = document.createElement("div");
                    container.classList.add("event-container");
                    dayEl.appendChild(container);
                }
                const data = eventTypeMap[event.color] || eventTypeMap["None"];
                const div = document.createElement("div");
                div.classList.add("event-block");
                div.style.backgroundColor = data.color;
                div.textContent = event.title;
                div.addEventListener("click", e => { e.stopPropagation(); openEventModal(eventDateStr, event.id, event); });
                container.appendChild(div);
            });
            current.setDate(current.getDate() + 1);
        }
    });
}

// Event modal functions (open/close) — similar to your current code
function openEventModal(date, id=null, data={}) { /* your existing modal logic */ }
function closeEventModal() { /* your existing modal logic */ }

// Buttons
document.getElementById("prevBtn").addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); });
document.getElementById("nextBtn").addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); });
document.getElementById("todayBtn").addEventListener("click", () => { currentDate = new Date(); renderCalendar(); });

window.addEventListener("DOMContentLoaded", () => renderCalendar());
window.renderCalendar = renderCalendar;
