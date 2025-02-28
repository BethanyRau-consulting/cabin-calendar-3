// Ensure Firebase is available before using it
if (typeof firebase === "undefined") {
    console.error("Firebase SDK not loaded. Ensure Firebase scripts are included in your HTML.");
} else {
    console.log("✅ Firebase SDK loaded successfully.");
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9rOOglOPQ0pzOwuFq-P_Puo9lroDPU7A",
    authDomain: "cabincalendar3.firebaseapp.com",
    projectId: "cabincalendar3",
    storageBucket: "cabincalendar3.appspot.com",
    messagingSenderId: "373184478865",
    appId: "1:373184478865:web:cf1e0e816be89107538930"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    let currentDate = new Date();
    let today = new Date();
    let selectedEventId = null;

    function renderCalendar() {
        const monthName = document.getElementById("monthName");
        const calendarGrid = document.getElementById("calendarGrid");
        const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const prevLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        
        monthName.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        calendarGrid.innerHTML = "";

        for (let i = firstDayIndex; i > 0; i--) {
            const day = document.createElement("div");
            day.classList.add("day", "prev-month");
            day.textContent = prevLastDay - i + 1;
            calendarGrid.appendChild(day);
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
                const eventDate = event.start;
                document.querySelectorAll(`.day[data-date="${eventDate}"]`).forEach(dayElement => {
                    dayElement.style.backgroundColor = event.color || "#ffcc00";
                    if (!dayElement.querySelector('.event-title')) {
                        let titleDiv = document.createElement('div');
                        titleDiv.classList.add('event-title');
                        titleDiv.textContent = event.title;
                        dayElement.appendChild(titleDiv);
                    }
                });
            });
        }).catch(error => {
            console.error("Error loading events: ", error);
        });
    }

    function prevMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }

    function nextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }

    document.getElementById("prevBtn").addEventListener("click", prevMonth);
    document.getElementById("nextBtn").addEventListener("click", nextMonth);
    document.getElementById("todayBtn").addEventListener("click", () => {
        currentDate = new Date();
        renderCalendar();
    });

    renderCalendar();
});
