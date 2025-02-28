//  Ensure Firebase is available before using it
if (typeof firebase === "undefined") {
    console.error("Firebase SDK not loaded. Ensure Firebase scripts are included in your HTML.");
} else {
    console.log(" Firebase SDK loaded successfully.");
}

//  Correct Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9rOOglOPQ0pzOwuFq-P_Puo9lroDPU7A",
    authDomain: "cabincalendar3.firebaseapp.com",
    projectId: "cabincalendar3",
    storageBucket: "cabincalendar3.appspot.com", // 
    messagingSenderId: "373184478865",
    appId: "1:373184478865:web:cf1e0e816be89107538930"
};

//  Initialize Firebase (Fixing `initializeApp` Error)
firebase.initializeApp(firebaseConfig);

//  Initialize Firestore
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
}

        for (let i = 1; i <= lastDay; i++) {
            let day = document.createElement("div");
            day.classList.add("day");
            day.textContent = i;
            day.dataset.date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            day.addEventListener("click", () => openEventModal(i));
            calendarGrid.appendChild(day);
        }

        //  Fetch latest events from Firestore
        db.collection("events").get().then(snapshot => {
            snapshot.forEach(doc => {
                const event = doc.data();
                const eventDate = event.start;
                const eventElements = document.querySelectorAll(`.day[data-date="${eventDate}"]`);

                eventElements.forEach(dayElement => {
                    dayElement.style.backgroundColor = event.color || "#ffcc00";
                    dayElement.title = event.title;
                });
            });
        }).catch(error => {
            console.error("Error loading events: ", error);
        });
    })

    function openEventModal(day) {
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        db.collection("events").where("start", "==", formattedDate).get().then(snapshot => {
            if (!snapshot.empty) {
                const eventDoc = snapshot.docs[0];
                const eventData = eventDoc.data();

                document.getElementById("eventTitle").value = eventData.title;
                document.getElementById("eventStart").value = eventData.start;
                document.getElementById("eventEnd").value = eventData.end || "";
                document.getElementById("eventStartTime").value = eventData.startTime || "";
                document.getElementById("eventEndTime").value = eventData.endTime || "";
                document.getElementById("eventDetails").value = eventData.details || "";
                document.getElementById("eventColor").value = eventData.color || "#ffcc00";

                selectedEventId = eventDoc.id;
            } else {
                selectedEventId = null;
            }

            document.getElementById("eventModal").style.display = "block";
        });
    }

    function closeEventModal() {
        document.getElementById("eventModal").style.display = "none";
        resetForm();
    }

    function resetForm() {
        document.getElementById("eventTitle").value = "";
        document.getElementById("eventStart").value = "";
        document.getElementById("eventEnd").value = "";
        document.getElementById("eventStartTime").value = "";
        document.getElementById("eventEndTime").value = "";
        document.getElementById("eventDetails").value = "";
        document.getElementById("eventColor").value = "#ffcc00";
        selectedEventId = null;
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

        if (selectedEventId) {
            db.collection("events").doc(selectedEventId).update({
                title, start, end, startTime, endTime, details, color
            }).then(() => {
                renderCalendar();
                closeEventModal();
            }).catch(error => {
                console.error("Error updating event: ", error);
            });
        } else {
            db.collection("events").add({
                title, start, end, startTime, endTime, details, color,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                renderCalendar();
                closeEventModal();
            }).catch(error => {
                console.error("Error adding event: ", error);
            });
        }
    }

    function deleteEvent() {
        if (selectedEventId) {
            db.collection("events").doc(selectedEventId).delete().then(() => {
                selectedEventId = null;
                renderCalendar();
                closeEventModal();
            }).catch(error => {
                console.error("Error deleting event: ", error);
            });
        }
    }

    //  Event Listeners
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

document.getElementById("saveEvent").addEventListener("click", () => {
    let title = document.getElementById("eventTitle").value;
    let start = new Date(document.getElementById("eventStart").value);
    let end = new Date(document.getElementById("eventEnd").value);
    let color = document.getElementById("eventColor").value;

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        let dateStr = d.toISOString().split("T")[0];
        document.querySelectorAll(`.day[data-date="${dateStr}"]`).forEach(dayElement => {
            dayElement.style.backgroundColor = color;
            dayElement.innerHTML += `<div class='event-title'>${title}</div>`;
        });
    }
});

    document.getElementById("saveEvent").addEventListener("click", saveEvent);
    document.getElementById("cancelEvent").addEventListener("click", closeEventModal);
    document.getElementById("deleteEvent").addEventListener("click", deleteEvent);

    renderCalendar();
});
