/**
 * Watakatifu Adventures - JavaScript for interactive functionality
 * Features: Smooth scrolling, dynamic events from JSON, mobile menu, tab switching
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ====================
    // Mobile Menu Toggle
    // ====================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            // Toggle active class on menu toggle button
            this.classList.toggle('active');
            
            // Toggle active class on navigation menu
            navMenu.classList.toggle('active');
            
            // Toggle body scroll and overlay when menu is open
            const isActive = navMenu.classList.contains('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
            document.body.classList.toggle('menu-open', isActive);
        });
    }
    
    // Close mobile menu when clicking on a nav link
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    if (menuToggle) menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                    document.body.classList.remove('menu-open');
                }
            });
        });
    }
    
    // Close menu when clicking outside of it
    document.addEventListener('click', function(e) {
        if (menuToggle && navMenu && navMenu.classList.contains('active')) {
            if (!e.target.closest('.navbar')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.classList.remove('menu-open');
            }
        }
    });
    
    // ====================
    // Smooth Scrolling with Support for Both Pages and Anchors
    // ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (targetId === '#' || targetId === '') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Calculate header height for offset
                const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ====================
    // Event Tab Switching
    // ====================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding content
            const activeTab = document.getElementById(`${tabId}-events`);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        });
    });
    
    // ====================
    // Load Events from JSON
    // ====================
    // Load Events from JSON
    // ====================
    async function loadEvents() {
        try {
            console.log('Starting loadEvents function...');
            console.log('Current location:', window.location.href);
            console.log('Protocol:', window.location.protocol);
            
            // Determine the correct path based on protocol
            let eventsPath = '.data/events.json';
            
            // If using file:// protocol, we need to handle it differently
            if (window.location.protocol === 'file:') {
                console.warn('⚠ File protocol detected - CORS may block fetch');
                eventsPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + './data/events.json';
            }
            
            console.log('Fetching from:', eventsPath);
            
            const response = await fetch(eventsPath);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('✓ Events loaded successfully. Total events:', data.events.length);
            console.log('All events:', data.events);
            
            if (!data.events || data.events.length === 0) {
                console.warn('No events found in JSON');
                showError('No events available at the moment.');
                return;
            }
            
            // Separate upcoming and past events
            const upcomingEvents = data.events.filter(event => event.type === 'upcoming');
            const pastEvents = data.events.filter(event => event.type === 'past');
            
            console.log('✓ Upcoming events:', upcomingEvents.length, upcomingEvents);
            console.log('✓ Past events:', pastEvents.length, pastEvents);
            
            // Sort events by date (most recent first for past, soonest first for upcoming)
            upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
            pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            console.log('Sorted upcoming events:', upcomingEvents);
            console.log('Sorted past events:', pastEvents);
            
            // Display events
            console.log('Displaying upcoming events...');
            displayEvents(upcomingEvents, 'upcoming');
            
            console.log('Displaying past events...');
            displayEvents(pastEvents, 'past');
            
            console.log('✓ All events displayed successfully!');
            
        } catch (error) {
            console.error('✗ Error loading events:', error);
            console.error('Error message:', error.message);
            console.error('Stack:', error.stack);
            
            if (error.message.includes('Failed to fetch')) {
                console.error('Possible causes: CORS issue, file:// protocol, or server not running');
                showError('Cannot load events. Please make sure to serve the files over HTTP (not file://)');
            } else {
                showError('Could not load events. Check console for details.');
            }
        }
    }
    
    // ====================
    // Display Events Function
    // ====================
    function displayEvents(events, type) {
        const containerId = `${type}-events-grid`;
        const container = document.getElementById(containerId);
        
        console.log(`Displaying ${type} events in container: ${containerId}`, container);
        
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }
        
        // Clear loading message
        container.innerHTML = '';
        
        console.log(`Processing ${events.length} ${type} events`);
        
        // Check if there are events
        if (events.length === 0) {
            const noEvents = document.createElement('div');
            noEvents.className = 'no-events';
            noEvents.innerHTML = `
                <i class="fas fa-calendar-times"></i>
                <p>No ${type} events at the moment. Check back soon!</p>
            `;
            container.appendChild(noEvents);
            return;
        }
        
        // Create event cards
        events.forEach((event, index) => {
            console.log(`Creating card ${index + 1} for event:`, event.name);
            const eventCard = createEventCard(event, type);
            container.appendChild(eventCard);
        });
    }
    
    // ====================
    // Create Event Card
    // ====================
    function createEventCard(event, type) {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        // Format date for display
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Set category icon and color
        let categoryIcon = 'fas fa-map-marker-alt';
        let categoryText = 'Adventure';
        
        switch(event.category) {
            case 'roadtrip':
                categoryIcon = 'fas fa-road';
                categoryText = 'Road Trip';
                break;
            case 'travel':
                categoryIcon = 'fas fa-plane';
                categoryText = 'Travel';
                break;
            case 'social':
                categoryIcon = 'fas fa-users';
                categoryText = 'Social';
                break;
        }
        
        card.innerHTML = `
            <div class="event-image">
                <img src="images/image-${(event.id % 6) + 1}.jpg" alt="${event.name}" class="event-image-img">
            </div>
            <div class="event-header">
                <div class="event-date">${formattedDate}</div>
                <h3 class="event-name">${event.name}</h3>
                <div class="event-badge">${type === 'upcoming' ? 'Upcoming' : 'Completed'}</div>
            </div>
            <div class="event-content">
                <p class="event-description">${event.description}</p>
                <div class="event-category">
                    <i class="${categoryIcon}"></i> ${categoryText}
                </div>
            </div>
        `;
        
        // Make card clickable to open modal
        card.addEventListener('click', function() {
            openEventModal(event, categoryText, formattedDate);
        });
        
        return card;
    }
    
    // ====================
    // Event Modal Functions
    // ====================
    function openEventModal(event, categoryText, formattedDate) {
        const modal = document.getElementById('eventModal');
        
        document.getElementById('modalEventImage').src = `images/image-${(event.id % 6) + 1}.jpg`;
        document.getElementById('modalEventImage').alt = event.name;
        document.getElementById('modalEventName').textContent = event.name;
        document.getElementById('modalEventDate').textContent = formattedDate;
        document.getElementById('modalEventCategory').textContent = categoryText;
        document.getElementById('modalEventDescription').textContent = event.description;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeEventModal() {
        const modal = document.getElementById('eventModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Modal close button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEventModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEventModal();
            }
        });
    }
    
    // ====================
    // Show Error Message
    // ====================
    function showError(message) {
        const upcomingContainer = document.getElementById('upcoming-events-grid');
        const pastContainer = document.getElementById('past-events-grid');
        
        const errorHtml = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
        
        if (upcomingContainer) upcomingContainer.innerHTML = errorHtml;
        if (pastContainer) pastContainer.innerHTML = errorHtml;
    }
    
    // ====================
    // WhatsApp Button Interaction
    // ====================
    const whatsappBtns = document.querySelectorAll('[id^="whatsappBtn"]');
    
    whatsappBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // For demo purposes, we'll show a message if the WhatsApp number is not changed
            const phoneNumber = 'https://wa.me/+254768887393';
            
            if (phoneNumber === '') {
                // This is a demo number, show a friendly alert
                e.preventDefault();
                alert("This is a demo website. In a real implementation, clicking this button would open WhatsApp with the group link.\n\nTo test the functionality, you can replace the phone number in the HTML with your actual WhatsApp group invite link.");
                
                // Log to console for developers
                console.log('Demo WhatsApp button clicked. Replace the phone number in the href attribute with your actual WhatsApp group link.');
            }
        });
    });
    
    // ====================
    // Set Current Year in Footer
    // ====================
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // ====================
    // Sticky Header on Scroll
    // ====================
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow to header when scrolled
        if (scrollTop > 100) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // ====================
    // Enhanced Hover Effects for Mobile & Interactive Elements
    // ====================
    const interactiveElements = document.querySelectorAll('.activity-card, .benefit-card, .event-card, .btn');
    
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        });
    });
    
    // ====================
    // Initialize Page
    // ====================
    // Load events when page loads
    console.log('DOM Content Loaded - Starting to load events...');
    
    // Check if containers exist
    console.log('upcoming-events-grid exists:', !!document.getElementById('upcoming-events-grid'));
    console.log('past-events-grid exists:', !!document.getElementById('past-events-grid'));
    
    loadEvents();
    
    // Log initialization
    console.log('Watakatifu Adventures website initialized successfully!');
    
});