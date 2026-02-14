/**
 * Watakatifu Adventures - JavaScript
 * Fixed version with image support + clean JSON loading
 */

document.addEventListener('DOMContentLoaded', function() {

    /* ====================
       Mobile Menu Toggle
    ==================== */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');

            const isActive = navMenu.classList.contains('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    /* ====================
       Event Tabs
    ==================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(`${tabId}-events`).classList.add('active');
        });
    });

    /* ====================
       Load Events
    ==================== */
    async function loadEvents() {
        try {
            const response = await fetch('data/events.json');

            if (!response.ok) {
                throw new Error('Failed to fetch events.json');
            }

            const data = await response.json();

            if (!data.events || data.events.length === 0) {
                showError("No events available at the moment.");
                return;
            }

            const upcomingEvents = data.events.filter(e => e.type === "upcoming");
            const pastEvents = data.events.filter(e => e.type === "past");

            upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
            pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

            displayEvents(upcomingEvents, "upcoming");
            displayEvents(pastEvents, "past");

        } catch (error) {
            console.error("Error loading events:", error);
            showError("Could not load events.");
        }
    }

    /* ====================
       Display Events
    ==================== */
    function displayEvents(events, type) {
        const container = document.getElementById(`${type}-events-grid`);
        if (!container) return;

        container.innerHTML = "";

        if (events.length === 0) {
            container.innerHTML = `
                <div class="no-events">
                    <p>No ${type} events at the moment.</p>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const card = createEventCard(event, type);
            container.appendChild(card);
        });
    }

    /* ====================
       Create Event Card
    ==================== */
    function createEventCard(event, type) {
        const card = document.createElement("div");
        card.className = "event-card";

        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        let categoryIcon = "fas fa-map-marker-alt";
        let categoryText = "Adventure";

        switch (event.category) {
            case "roadtrip":
                categoryIcon = "fas fa-road";
                categoryText = "Road Trip";
                break;
            case "travel":
                categoryIcon = "fas fa-plane";
                categoryText = "Travel";
                break;
            case "social":
                categoryIcon = "fas fa-users";
                categoryText = "Social";
                break;
        }

        // Use image from JSON or fallback
        const eventImage = event.image ? event.image : "images/event-placeholder.jpg";

        card.innerHTML = `
            <div class="event-image">
                <img src="${eventImage}" alt="${event.name}" class="event-image-img">
            </div>
            <div class="event-header">
                <div class="event-date">${formattedDate}</div>
                <h3 class="event-name">${event.name}</h3>
                <div class="event-badge">${type === "upcoming" ? "Upcoming" : "Completed"}</div>
            </div>
            <div class="event-content">
                <p class="event-description">${event.description}</p>
                <div class="event-category">
                    <i class="${categoryIcon}"></i> ${categoryText}
                </div>
            </div>
        `;

        card.addEventListener("click", function () {
            openEventModal(event, categoryText, formattedDate, eventImage);
        });

        return card;
    }

    /* ====================
       Event Modal
    ==================== */
    function openEventModal(event, categoryText, formattedDate, eventImage) {
        const modal = document.getElementById("eventModal");

        document.getElementById("modalEventImage").src = eventImage;
        document.getElementById("modalEventName").textContent = event.name;
        document.getElementById("modalEventDate").textContent = formattedDate;
        document.getElementById("modalEventCategory").textContent = categoryText;
        document.getElementById("modalEventDescription").textContent = event.description;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeEventModal() {
        document.getElementById("eventModal").classList.remove("active");
        document.body.style.overflow = "";
    }

    const closeBtn = document.querySelector(".modal-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeEventModal);
    }

    const modal = document.getElementById("eventModal");
    if (modal) {
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                closeEventModal();
            }
        });
    }

    /* ====================
       Show Error
    ==================== */
    function showError(message) {
        const upcoming = document.getElementById("upcoming-events-grid");
        const past = document.getElementById("past-events-grid");

        const errorHTML = `
            <div class="loading">
                <p>${message}</p>
            </div>
        `;

        if (upcoming) upcoming.innerHTML = errorHTML;
        if (past) past.innerHTML = errorHTML;
    }

    /* ====================
       Footer Year
    ==================== */
    const currentYearElement = document.getElementById("currentYear");
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    /* ====================
       INIT
    ==================== */
    loadEvents();

});
