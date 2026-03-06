/**
 * Centralized Tour Data Store
 * Use this file to update prices, guides, and form endpoints site-wide.
 */
const GLOBAL_CONFIG = {
    calendarUrl: "https://calendar.google.com/calendar/ical/wildbiketours%40gmail.com/public/basic.ics",
    corsProxy: "https://api.allorigins.win/raw?url=",
    calendarBridgeUrl: "https://script.google.com/macros/s/AKfycbwmctuVCvqPJ8q9xgkwB1EuTS5WNi--2L7LtIqPNSjem1QOvecv1LjqHH-TjyGK5Doh/exec" // TODO: Paste your Google Apps Script Web App URL here
};

const TOURS_DATA = {
    "sigiriya": {
        name: "Sigiriya Heritage",
        price: 35,
        guideName: "Nuwan",
        guideImage: "assets/Images/Gemini_Generated_Image_28jtol28jtol28jt.png",
        formAction: "https://formspree.io/f/xqedylkn",
        joinDiscount: 0.25
    },
    "kandy": {
        name: "Kandy Cultural",
        price: 45,
        guideName: "Lakindu",
        guideImage: "assets/Images/Gemini_Generated_Image_28jtol28jtol28jt.png",
        formAction: "https://formspree.io/f/xqedylkn",
        joinDiscount: 0.25
    },
    "dambulla": {
        name: "Dambulla Heritage",
        price: 79,
        guideName: "Nuwan",
        guideImage: "assets/Images/Gemini_Generated_Image_28jtol28jtol28jt.png",
        formAction: "https://formspree.io/f/xqedylkn",
        joinDiscount: 0.25
    },
    "adams-peak": {
        name: "Adams Peak Journey",
        price: 85,
        guideName: "Nuwan",
        guideImage: "assets/Images/Gemini_Generated_Image_28jtol28jtol28jt.png",
        formAction: "https://formspree.io/f/xqedylkn",
        joinDiscount: 0.25
    },
    "colombo-culture": {
        name: "Colombo Culture",
        price: 45,
        guideName: "Nuwan",
        guideImage: "assets/Images/Gemini_Generated_Image_28jtol28jtol28jt.png",
        formAction: "https://formspree.io/f/xqedylkn",
        joinDiscount: 0.25
    },
    "colombo-sunset": {
        name: "Sunset & Street Food",
        price: 75,
        guideName: "Nuwan",
        guideImage: "assets/Images/Gemini_Generated_Image_28jtol28jtol28jt.png",
        formAction: "https://formspree.io/f/xqedylkn",
        joinDiscount: 0.25
    },
    "colombo-charm": {
        name: "Colonial Charm",
        price: 89,
        guideName: "Nuwan",
        guideImage: "assets/Images/Gemini_Generated_Image_28jtol28jtol28jt.png",
        formAction: "https://formspree.io/f/xqedylkn",
        joinDiscount: 0.25
    }
};

// Also expose as a global for easier access in simple script tags if needed
window.TOURS_DATA = TOURS_DATA;
window.GLOBAL_CONFIG = GLOBAL_CONFIG;
