const backgrounds = [
    'assets/background(1).jpeg',
    'assets/background(2).jpeg',
    'assets/background(3).jpeg',
    'assets/background(4).jpeg',
    'assets/background(5).jpeg',
    'assets/background(6).jpeg',
    'assets/background(7).jpeg'
];

// Function to change background image every 30 seconds (adjust time as needed)
function changeBackground() {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    document.body.style.backgroundImage = `url('${backgrounds[randomIndex]}')`;
}

// Change background every 30 seconds
setInterval(changeBackground, 30000);

// Initially set a random background when the page loads
changeBackground();

const API_URL = "https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=Saudi%20Arabia";
let currentLang = 'en';

const translations = {
    en: {
        title: "Muslim Prayer Times",
        nextPrayer: "Next Prayer",
    },
    ar: {
        title: "مواقيت الصلاة",
        nextPrayer: "الصلاة القادمة",
    },
};

function changeLanguage(lang) {
    currentLang = lang;
    document.getElementById("title").textContent = translations[lang].title;
    document.querySelector("#next-prayer h2").textContent = translations[lang].nextPrayer;
    fetchPrayerTimes();
}

async function fetchPrayerTimes() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const timings = data.data.timings;
        const date = data.data.date.gregorian;
        const hijriDate = data.data.date.hijri;

        // Display today's date
        document.getElementById("today-date").textContent =
            currentLang === 'en'
                ? `Today: ${date.day} ${date.month.en} ${date.year}`
                : `اليوم: ${date.day} ${date.month.ar} ${date.year}`;

        // Display Hijri date
        document.getElementById("hijri-date").textContent =
            currentLang === 'en'
                ? `Hijri: ${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} AH`
                : `هجري: ${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year}`;

        // Display prayer times
        const prayerTimesDiv = document.getElementById("prayer-times");
        const requiredPrayers = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        prayerTimesDiv.innerHTML = requiredPrayers
            .map(prayer =>
                `<div class="prayer">${prayer}: ${timings[prayer]}</div>`
            )
            .join("");

        // Calculate next prayer time
        calculateNextPrayer(timings);
    } catch (error) {
        console.error("Error fetching prayer times:", error);
        document.getElementById("prayer-times").innerHTML = `<p>Error loading prayer times.</p>`;
    }
}

function calculateNextPrayer(timings) {
    const now = new Date();
    const prayerTimes = Object.keys(timings)
        .filter(prayer => ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(prayer))
        .map(prayer => ({
            name: prayer,
            time: new Date(`${now.toDateString()} ${timings[prayer]}`),
        }));

    // Find next prayer time
    const nextPrayer = prayerTimes.find(prayer => prayer.time > now) || prayerTimes[0];

    document.getElementById("next-prayer-name").textContent = `${nextPrayer.name}: ${nextPrayer.time.toLocaleTimeString()}`;

    updateCountdown(nextPrayer.time);
}

function updateCountdown(nextPrayerTime) {
    const countdownElement = document.getElementById("countdown");
    const interval = setInterval(() => {
        const now = new Date();
        const diff = nextPrayerTime - now;

        if (diff <= 0) {
            clearInterval(interval);
            fetchPrayerTimes(); // Refresh prayer times
        } else {
            const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
            const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
            countdownElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }, 1000);
}

// Fetch prayer times on page load
fetchPrayerTimes();
