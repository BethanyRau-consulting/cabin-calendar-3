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
        currentDate.setDate(1);
        monthName.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        calendarGrid.innerHTML = "";
        
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= lastDay; i++) {
            let day = document.createElement("div");
            day.classList.add("day");
            day.textContent = i;
            day.dataset.date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            day.addEventListener("click", () => openEventModal(i));
            calendarGrid.appendChild(day);
        }

        // Fetch latest events from Firestore
        db.collection("events").get().then(snapshot => {
            snapshot.forEach(doc => {
                const event = doc.data();
                const eventDate = event.start;
                const eventElements = document.querySelectorAll(`.day[data-date="${eventDate}"]`);
                
                eventElements.forEach(dayElement => {
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

    function saveEvent() {
        const title = document.getElementById("eventTitle").value;
        const start = document.getElementById("eventStart").value;
        const end = document.getElementById("eventEnd").value;
        const startTime = document.getElementById("eventStartTime").value;
        const endTime = document.getElementById("eventEndTime").value;
        const details = document.getElementById("eventDetails").value;
        const color = document.getElementById("eventColor").value;
    
        if (!title || !start) {
            alert("Event title and start date are required!");
            return;
        }
    
        let batch = db.batch();  
        let startDate = new Date(start);
        let endDate = new Date(end);
    
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            let dateStr = d.toISOString().split("T")[0];
            let eventRef = db.collection("events").doc(); 
            batch.set(eventRef, { title, start: dateStr, startTime, endTime, details, color });
        }
    
        batch.commit().then(() => {
            console.log("✅ Event saved successfully!");
            renderCalendar();  
            closeEventModal();
        }).catch(error => {
            console.error("❌ Error adding event:", error);
        });
    }

    function deleteEvent() {
        if (selectedEventId) {
            db.collection("events").doc(selectedEventId).delete().then(() => {
                console.log("✅ Event deleted successfully!");
                renderCalendar();
                closeEventModal();
            }).catch(error => {
                console.error("❌ Error deleting event:", error);
            });
        }
    }

    function openEventModal(day) {
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        db.collection("events").where("start", "==", formattedDate).get().then(snapshot => {
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    const eventData = doc.data();
                    document.getElementById("eventTitle").value = eventData.title;
                    document.getElementById("eventStart").value = eventData.start;
                    document.getElementById("eventEnd").value = eventData.end || "";
                    document.getElementById("eventStartTime").value = eventData.startTime || "";
                    document.getElementById("eventEndTime").value = eventData.endTime || "";
                    document.getElementById("eventDetails").value = eventData.details || "";
                    document.getElementById("eventColor").value = eventData.color || "#ffcc00";
                    selectedEventId = doc.id;
                });
            } else {
                selectedEventId = null;
            }
            document.getElementById("eventModal").style.display = "block";
        });
    }

    function closeEventModal() {
        document.getElementById("eventModal").style.display = "none";
    }

    document.getElementById("saveEvent").addEventListener("click", saveEvent);
    document.getElementById("cancelEvent").addEventListener("click", closeEventModal);
    document.getElementById("deleteEvent").addEventListener("click", deleteEvent);

    renderCalendar();
});
