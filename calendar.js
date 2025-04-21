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
            calendarGrid.appendChild(blank
