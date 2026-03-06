/**
 * Tour Utilities
 * Handles dynamic data injection and simplified booking initialization.
 */

/**
 * Injects tour data (prices, names) into placeholders across the page.
 * Looks for elements with data-tour-price and data-tour-name attributes.
 */
function injectTourData() {
    if (typeof TOURS_DATA === 'undefined') {
        console.error('TOURS_DATA not found. Please include tours-data.js before tour-utils.js');
        return;
    }

    // Inject Prices
    document.querySelectorAll('[data-tour-price]').forEach(el => {
        const tourId = el.getAttribute('data-tour-price');
        if (TOURS_DATA[tourId]) {
            const price = TOURS_DATA[tourId].price;

            // If it's a simple span/div, update text
            if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'P') {
                el.textContent = price;
            }

            // Also update data-price attribute if it exists on the same element 
            // (used for filtering in destinations.html)
            if (el.hasAttribute('data-price')) {
                el.setAttribute('data-price', price);
            }

            // Check if immediate parent or closest article needs data-price update
            const card = el.closest('[data-price]');
            if (card) {
                card.setAttribute('data-price', price);
            }
        }
    });

    // Inject Names
    document.querySelectorAll('[data-tour-name]').forEach(el => {
        const tourId = el.getAttribute('data-tour-name');
        if (TOURS_DATA[tourId]) {
            el.textContent = TOURS_DATA[tourId].name;
        }
    });
}

/**
 * Initializes a tour page with centralized data.
 * @param {string} tourId - The key in TOURS_DATA (e.g., 'sigiriya')
 */
function initTourPage(tourId) {
    const data = TOURS_DATA[tourId];
    if (!data) {
        console.error(`Tour data not found for ID: ${tourId}`);
        return;
    }

    const config = {
        tourId: tourId,
        tourName: data.name,
        basePrice: data.price,
        formAction: data.formAction,
        guideImage: data.guideImage,
        guideName: data.guideName,
        joinDiscount: data.joinDiscount || 0
    };

    // Init Desktop Widget
    if (document.getElementById('tour-booking-sidebar')) {
        window.bookingSidebar = new TourBooking({ ...config, containerId: 'tour-booking-sidebar' });
    }

    // Init Mobile Drawer Widget
    if (document.getElementById('tour-booking-mobile')) {
        window.bookingMobile = new TourBooking({ ...config, containerId: 'tour-booking-mobile' });
    }

    // Initial injection
    injectTourData();
}

// Standalone global iCal parser used by the booking system, index page, and special offers page
window.parseICS = function (icsData, bookedToursMap = {}) {
    const events = [];
    const lines = icsData.split(/\r?\n/);
    let currentEvent = null;

    lines.forEach(line => {
        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent.start && currentEvent.end) {
                // Filter out "Rent an E-Bike" events
                const summary = currentEvent.summary || "";
                if (!summary.includes("Rent an E-Bike")) {
                    events.push(currentEvent);
                }
            }
            currentEvent = null;
        } else if (currentEvent) {
            if (line.startsWith('DTSTART')) {
                const match = line.match(/[;:](\d{8})/);
                if (match) currentEvent.start = match[1];
            } else if (line.startsWith('DTEND')) {
                const match = line.match(/[;:](\d{8})/);
                if (match) currentEvent.end = match[1];
            } else if (line.startsWith('SUMMARY')) {
                currentEvent.summary = line.substring(line.indexOf(':') + 1).trim();
            }
        }
    });

    const booked = new Set();
    events.forEach(ev => {
        const startStr = ev.start; // YYYYMMDD
        const endStr = ev.end;

        const start = new Date(startStr.substring(0, 4), startStr.substring(4, 6) - 1, startStr.substring(6, 8));
        const end = new Date(endStr.substring(0, 4), endStr.substring(4, 6) - 1, endStr.substring(6, 8));

        let curr = new Date(start);
        while (curr < end) {
            const yr = curr.getFullYear();
            const mo = String(curr.getMonth() + 1).padStart(2, '0');
            const da = String(curr.getDate()).padStart(2, '0');
            const ds = `${yr}-${mo}-${da}`;

            booked.add(ds);
            if (!bookedToursMap[ds]) bookedToursMap[ds] = [];
            if (!bookedToursMap[ds].includes(ev.summary)) bookedToursMap[ds].push(ev.summary);
            curr.setDate(curr.getDate() + 1);
        }
        if (start.getTime() === end.getTime()) {
            const yr = start.getFullYear();
            const mo = String(start.getMonth() + 1).padStart(2, '0');
            const da = String(start.getDate()).padStart(2, '0');
            const ds = `${yr}-${mo}-${da}`;

            booked.add(ds);
            if (!bookedToursMap[ds]) bookedToursMap[ds] = [];
            if (!bookedToursMap[ds].includes(ev.summary)) bookedToursMap[ds].push(ev.summary);
        }
    });

    return Array.from(booked);
};

// Automatically inject data on load for pages that might not call initTourPage (like index/destinations)
document.addEventListener('DOMContentLoaded', injectTourData);
