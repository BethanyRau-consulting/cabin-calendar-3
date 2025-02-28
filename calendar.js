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

                db.collection("events").add({
                    title, start, end, startTime, endTime, details, color, date: selectedDate
                }).then(() => {
                    renderCalendar();
                    closeEventModal();
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
