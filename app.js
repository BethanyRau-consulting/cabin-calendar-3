document.addEventListener("DOMContentLoaded", () => {
    let currentDate = new Date();

    function renderCalendar() {
        const monthName = document.getElementById("monthName");
        const calendarGrid = document.getElementById("calendarGrid");
        
        currentDate.setDate(1);
        const firstDayIndex = currentDate.getDay();
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const prevLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        
        monthName.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        calendarGrid.innerHTML = "";
        
        for (let i = firstDayIndex; i > 0; i--) {
            calendarGrid.innerHTML += `<div class="day" style="color: lightgray;">${prevLastDay - i + 1}</div>`;
        }
        
        for (let i = 1; i <= lastDay; i++) {
            calendarGrid.innerHTML += `<div class="day">${i}</div>`;
        }
    }

    function prevMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }

    function nextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }

    document.querySelector(".header button:nth-child(1)").addEventListener("click", prevMonth);
    document.querySelector(".header button:nth-child(3)").addEventListener("click", nextMonth);

    renderCalendar();
});
