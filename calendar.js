const firebaseConfig = {
  apiKey: "AIzaSyB9rOOglOPQ0pzOwuFq-P_Puo9lroDPU7A",
  authDomain: "cabincalendar3.firebaseapp.com",
  projectId: "cabincalendar3",
  storageBucket: "cabincalendar3.firebasestorage.app",
  messagingSenderId: "373184478865",
  appId: "1:373184478865:web:cf1e0e816be89107538930"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
            let currentDate = new Date();
            let today = new Date();
            const db = firebase.firestore();
            let selectedDate = null;

            function renderCalendar() {
                const monthName = document.getElementById("monthName");
                const calendarGrid = document.getElementById("calendarGrid");

                currentDate.setDate(1);
                const firstDayIndex = currentDate.getDay();
                const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                
                monthName.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                calendarGrid.innerHTML = "";

                for (let i = 1; i <= lastDay; i++) {
                    let day = document.createElement("div");
                    day.classList.add("day");
                    day.textContent = i;
                    day.addEventListener("click", () => openEventModal(i));
                    calendarGrid.appendChild(day);
                }
            }

            function openEventModal(day) {
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
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
        alert("Event title and start date are required!");
        return;
    }

    db.collection("events").add({
        title,
        start,
        end,
        startTime,
        endTime,
        details,
        color,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => {
        renderCalendar();
        closeEventModal();
    }).catch(error => {
        console.error("Error adding event: ", error);
    });
}


            function deleteEvent() {
                closeEventModal();
            }

            document.getElementById("prevBtn").addEventListener("click", () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });

            document.getElementById("nextBtn").addEventListener("click", () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });

            document.getElementById("todayBtn").addEventListener("click", () => {
                currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
                renderCalendar();
            });

            document.getElementById("saveEvent").addEventListener("click", saveEvent);
            document.getElementById("cancelEvent").addEventListener("click", closeEventModal);
            document.getElementById("deleteEvent").addEventListener("click", deleteEvent);

            renderCalendar();
        });
