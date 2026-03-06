/* Tour Booking System - Core Logic */

class TourBooking {
    constructor(config) {
        this.tourId = config.tourId;
        this.basePrice = config.basePrice;
        this.containerId = config.containerId;
        this.formAction = config.formAction;
        this.guideImage = config.guideImage || null;
        this.guideName = config.guideName || "Your Guide";
        this.tourName = config.tourName || "Tour";
        this.joinDiscount = config.joinDiscount || 0;

        this.container = document.getElementById(this.containerId);
        if (!this.container) return;

        this.currentDate = new Date();
        this.selectedDate = null;
        this.guests = 1;
        this.currentStep = 1;
        this.bookedDates = [];
        this.bookedTours = {}; // dateString -> summary

        this.init();

        // Cache management: Load instantly for UX, fetch fresh in background
        this.loadFromCache();
        this.fetchCalendarEvents();
    }

    loadFromCache() {
        try {
            const CACHE_KEY = 'wbtt_global_calendar_cache';
            const cache = localStorage.getItem(CACHE_KEY);
            if (cache) {
                const { data, timestamp } = JSON.parse(cache);
                this.lastFreshness = timestamp;

                this.bookedTours = {};
                this.bookedDates = window.parseICS(data, this.bookedTours);
                this.renderCalendar();
            }
        } catch (e) {
            console.warn("TourBooking cache load failed", e);
        }
    }

    init() {
        this.renderWidget();
        this.cacheElements();
        this.attachListeners();
        this.renderCalendar(); // Initial render to avoid blank screen
    }

    cacheElements() {
        this.els = {
            calendarGrid: this.container.querySelector('#calendarGrid'),
            monthYear: this.container.querySelector('#monthYear'),
            prevMonth: this.container.querySelector('#prevMonth'),
            nextMonth: this.container.querySelector('#nextMonth'),
            summaryText: this.container.querySelector('#selectedDateText'),
            guestCount: this.container.querySelector('#guestCount'),
            minusGuest: this.container.querySelector('#minusGuest'),
            plusGuest: this.container.querySelector('#plusGuest'),
            mainBtn: this.container.querySelector('#mainBookingBtn'),
            backBtn: this.container.querySelector('#backBtn'),
            footerGuests: this.container.querySelector('#footerGuests'),
            footerTotal: this.container.querySelector('#footerTotal'),
            hiddenDate: this.container.querySelector('#hiddenDate'),
            hiddenGuests: this.container.querySelector('#hiddenGuests'),
            hiddenTotal: this.container.querySelector('#hiddenTotal'),
            form: this.container.querySelector('#tour-contact-form'),
            detailsPanel: this.container.querySelector('.booking-details')
        };
    }

    renderWidget() {
        const guideHtml = this.guideImage ? `
            <div class="guide-profile">
                <img src="${this.guideImage}" alt="${this.guideName}" class="guide-avatar">
            </div>
        ` : '';

        const headerContent = `
            <div class="booking-header-content">
                <h3 class="booking-title">Book your tour</h3>
                <p class="booking-subtitle">Choose your preferred date</p>
            </div>
        `;

        this.container.innerHTML = `
      <div class="tour-booking-widget">
        <!-- Step 1: Calendar -->
        <div class="booking-step active" data-step="1">
          <div class="booking-header">
            ${guideHtml}
            ${headerContent}
          </div>
          
          <div class="booking-calendar-container">
            <div class="cal-nav">
              <button class="cal-btn" id="prevMonth">&lt;</button>
              <div class="cal-month" id="monthYear"></div>
              <button class="cal-btn" id="nextMonth">&gt;</button>
            </div>
            <div class="cal-grid" id="calendarGrid"></div>
            <div class="join-info">
                <i class="fas fa-users-viewfinder mr-1"></i> Join an existing group & save ${Math.round(this.joinDiscount * 100)}%
            </div>
          </div>
        </div>

        <!-- Step 2: Details -->
        <div class="booking-step" data-step="2">
          <div class="booking-header">
            ${guideHtml}
            <div class="booking-header-content">
                <h3 class="booking-title">Confirm Details</h3>
                <p class="booking-subtitle" id="selectedDateText"></p>
            </div>
          </div>
          
          <div class="booking-details">
            <div class="form-group">
              <label>Number of riders</label>
              <div class="guest-counter">
                <span class="text-sm font-medium">Riders</span>
                <div class="counter-controls">
                  <button class="counter-btn" id="minusGuest">-</button>
                  <span class="count-display" id="guestCount">1</span>
                  <button class="counter-btn" id="plusGuest">+</button>
                </div>
              </div>
            </div>

            <form id="tour-contact-form" action="${this.formAction}" method="POST">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="name" class="form-input" placeholder="Your name" required>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="email" class="form-input" placeholder="your@email.com" required>
              </div>
              <input type="hidden" name="date" id="hiddenDate">
              <input type="hidden" name="guests" id="hiddenGuests">
              <input type="hidden" name="total" id="hiddenTotal">
              <input type="hidden" name="tour" value="${this.tourId}">
            </form>
          </div>
        </div>

        <div class="booking-footer">
          <div class="summary-row">
            <div class="summary-details">
              <span id="footerGuests">1 Rider</span> • ${this.tourName}
            </div>
            <div class="total-price" id="footerTotal">$${this.basePrice}</div>
          </div>
          <button class="booking-btn btn-primary" id="mainBookingBtn">Select a date</button>
          <button class="booking-btn btn-secondary hidden" id="backBtn">Previous step</button>
        </div>
      </div>
    `;
    }

    attachListeners() {
        this.els.prevMonth.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        this.els.nextMonth.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        this.els.minusGuest.addEventListener('click', () => {
            if (this.guests > 1) {
                this.guests--;
                this.updateSummary();
            }
        });

        this.els.plusGuest.addEventListener('click', () => {
            this.guests++;
            this.updateSummary();
        });

        this.els.mainBtn.addEventListener('click', () => {
            if (this.currentStep === 1) {
                if (!this.selectedDate) return;
                this.goToStep(2);
            } else {
                this.submitForm();
            }
        });

        this.els.backBtn.addEventListener('click', () => {
            this.goToStep(1);
        });
    }

    renderCalendar() {
        const grid = this.els.calendarGrid;
        const monthYear = this.els.monthYear;
        if (!grid) return;

        grid.innerHTML = '';
        grid.classList.remove('loading');

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();

        monthYear.textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Weekdays
        const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        weekdays.forEach(day => {
            const el = document.createElement('div');
            el.className = 'cal-weekday';
            el.textContent = day;
            grid.appendChild(el);
        });

        // Offset for Monday start
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < offset; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day empty';
            grid.appendChild(empty);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let d = 1; d <= daysInMonth; d++) {
            try {
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                const date = new Date(year, month, d);

                // Robust YYYY-MM-DD formatting to avoid timezone shifts
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                const summaries = this.bookedTours[dateKey] || [];
                const isMatchingTour = Array.isArray(summaries) && summaries.some(s => s.toLowerCase().includes(this.tourName.toLowerCase()));
                const isManualBlock = Array.isArray(summaries) && summaries.some(s => s.includes("[CLOSED]") || s.includes("[FULL]"));

                const dayEl = document.createElement('div');
                dayEl.className = 'cal-day';
                dayEl.textContent = d;

                if (date < today || isManualBlock) {
                    dayEl.classList.add('disabled');
                    if (isManualBlock) {
                        dayEl.classList.add('booked');
                        dayEl.title = "Fully Booked";
                    }
                } else if (isMatchingTour) {
                    dayEl.classList.add('promo');
                    dayEl.title = "Join existing group - 25% OFF!";
                    dayEl.innerHTML += '<span class="promo-dot"></span>';
                    dayEl.addEventListener('click', () => this.selectDate(date));
                    if (this.selectedDate && date.getTime() === this.selectedDate.getTime()) {
                        dayEl.classList.add('selected');
                    }
                } else {
                    dayEl.addEventListener('click', () => this.selectDate(date));
                    if (this.selectedDate && date.getTime() === this.selectedDate.getTime()) {
                        dayEl.classList.add('selected');
                    }
                }

                grid.appendChild(dayEl);
            } catch (err) {
                console.error("Calendar day render error:", err);
            }
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        this.renderCalendar();
        this.updateSummary();
        this.els.mainBtn.textContent = 'Confirm selection';
    }

    updateSummary() {
        if (!this.selectedDate) return;

        let total = this.basePrice * this.guests;

        // Use robust formatting to match calendar keys
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        const day = this.selectedDate.getDate();
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const summaries = this.bookedTours[dateKey] || [];
        const isPromo = Array.isArray(summaries) && summaries.some(s => s.toLowerCase().includes(this.tourName.toLowerCase()));

        if (isPromo) {
            total = Math.round(total * (1 - this.joinDiscount));
        }

        this.els.guestCount.textContent = this.guests;
        this.els.footerGuests.textContent = `${this.guests} Rider${this.guests > 1 ? 's' : ''}`;

        if (isPromo) {
            this.els.footerTotal.innerHTML = `<span class="text-xs text-gold line-through mr-1 font-normal">$${this.basePrice * this.guests}</span> $${total}`;
            this.els.summaryText.innerHTML = `${this.selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} <br> <span class="text-gold font-bold text-xs uppercase tracking-wider">★ Join Group Pricing: ${Math.round(this.joinDiscount * 100)}% Discount Applied</span>`;
        } else if (this.selectedDate) {
            this.els.footerTotal.textContent = `$${total}`;
            this.els.summaryText.textContent = this.selectedDate.toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            });
        }

        if (this.selectedDate) {
            const year = this.selectedDate.getFullYear();
            const month = this.selectedDate.getMonth();
            const day = this.selectedDate.getDate();
            this.els.hiddenDate.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        this.els.hiddenGuests.value = this.guests;
        this.els.hiddenTotal.value = total;
    }

    goToStep(step) {
        this.currentStep = step;
        this.container.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
        this.container.querySelector(`.booking-step[data-step="${step}"]`).classList.add('active');

        if (step === 2) {
            this.els.mainBtn.textContent = 'Complete Booking';
            this.els.backBtn.classList.remove('hidden');
        } else {
            this.els.mainBtn.textContent = this.selectedDate ? 'Confirm selection' : 'Select a date';
            this.els.backBtn.classList.add('hidden');
        }
    }

    async submitForm() {
        const form = this.els.form;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const btn = this.els.mainBtn;
        btn.disabled = true;
        btn.textContent = 'Booking...';

        const formData = new FormData(form);

        try {
            const response = await fetch(this.formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Post to Calendar Bridge (Instant Sync)
                this.postToCalendarBridge(formData);

                this.els.detailsPanel.innerHTML = `
          <div class="text-center py-8">
            <div class="text-emerald text-4xl mb-4">✓</div>
            <h4 class="text-xl font-bold mb-2">Booking Confirmed!</h4>
            <p class="text-slate text-sm">We've added your booking to our schedule. We'll contact you within 24 hours to say hello!</p>
          </div>
        `;
                btn.classList.add('hidden');
                this.els.backBtn.classList.add('hidden');
            } else {
                throw new Error();
            }
        } catch (err) {
            alert('There was an error. Please try again or contact us via WhatsApp.');
            btn.disabled = false;
            btn.textContent = 'Complete Booking';
        }
    }

    async postToCalendarBridge(formData) {
        if (!window.GLOBAL_CONFIG || !window.GLOBAL_CONFIG.calendarBridgeUrl) return;

        const data = {
            customerName: formData.get('name'),
            tourName: TOURS_DATA[this.tourId] ? TOURS_DATA[this.tourId].name : this.tourId,
            date: formData.get('date'),
            guests: formData.get('guests')
        };

        try {
            // Using a simple request (text/plain) ensures no CORS preflight is triggered
            // which allows the POST to reach Google Apps Script reliably from a browser
            await fetch(window.GLOBAL_CONFIG.calendarBridgeUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(data)
            });
        } catch (err) {
            console.error('Bridge error:', err);
        }
    }

    async fetchCalendarEvents() {
        if (!window.GLOBAL_CONFIG || !window.GLOBAL_CONFIG.calendarUrl) return;

        const CACHE_KEY = 'wbtt_global_calendar_cache';
        const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 mins

        // Stale-While-Revalidate refresh check
        if (this.lastFreshness && (Date.now() - this.lastFreshness < REFRESH_THRESHOLD)) {
            return; // Cache is very fresh
        }

        const grid = this.els.calendarGrid;
        if (grid && !this.bookedDates.length) {
            grid.classList.add('loading');
            grid.innerHTML = '<div class="cal-sync-msg">Syncing availability...</div>';
        }

        const calendarUrl = window.GLOBAL_CONFIG.calendarUrl + (window.GLOBAL_CONFIG.calendarUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
        const url = window.GLOBAL_CONFIG.corsProxy + encodeURIComponent(calendarUrl);

        try {
            const response = await fetch(url);
            const data = await response.text();

            // Update Global Cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));

            this.bookedTours = {};
            this.bookedDates = window.parseICS(data, this.bookedTours);
            this.renderCalendar();
            this.lastFreshness = Date.now();
        } catch (err) {
            console.error('Error fetching calendar:', err);
            if (grid) {
                grid.classList.remove('loading');
                if (!this.bookedDates.length) this.renderCalendar();
            }
        }
    }
}

// Standalone global iCal parser now located in tour-utils.js

// Global initialization for tour pages
document.addEventListener('DOMContentLoaded', () => {
    // Mobile drawer logic
    const drawer = document.getElementById('bookingDrawer');
    const overlay = document.getElementById('bookingDrawerOverlay');

    window.openBookingDrawer = () => {
        if (drawer && overlay) {
            overlay.style.display = 'block';
            setTimeout(() => drawer.classList.add('open'), 10);
            document.body.style.overflow = 'hidden';

            // Refresh mobile booking calendar on open to ensure latest data
            if (window.bookingMobile && typeof window.bookingMobile.fetchCalendarEvents === 'function') {
                window.bookingMobile.fetchCalendarEvents();
            }
        }
    };

    window.closeBookingDrawer = () => {
        if (drawer && overlay) {
            drawer.classList.remove('open');
            setTimeout(() => overlay.style.display = 'none', 400);
            document.body.style.overflow = '';
        }
    };

    if (overlay) overlay.addEventListener('click', window.closeBookingDrawer);
});
