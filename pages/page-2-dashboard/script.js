/**
 * Relationship Hub - Dashboard
 * Windows 98 Style with real-time countdown
 */

// State
let state = {
    yourLocation: null,
    theirLocation: null,
    nextReunionDate: null,
    relationshipStartDate: null,
    timezoneYou: 'Asia/Jakarta',
    timezoneThem: 'America/New_York',
    moodYou: { emoji: '😊', text: 'Happy' },
    moodThem: { emoji: '💻', text: 'Working' },
    stats: {
        daysTogether: 0,
        videoCallHours: 0,
        distanceKm: 0,
        messagesExchanged: '0'
    },
    weather: {
        you: { emoji: '☀️', temp: '28°C', desc: 'Sunny' },
        them: { emoji: '☁️', temp: '12°C', desc: 'Cloudy' }
    },
    // Tracking for live updates
    lastCoords: {
        you: null,
        them: null
    }
};

// DOM Elements
const elements = {
    // Profile 2 (Them)
    avatar1: document.getElementById('avatar1'),
    name1: document.getElementById('name1'),
    loc1: document.getElementById('loc1'),
    time1: document.getElementById('time1'),
    moodEmoji1: document.getElementById('moodEmoji1'),
    moodText1: document.getElementById('moodText1'),

    // Profile 2 (Them)
    avatar2: document.getElementById('avatar2'),
    name2: document.getElementById('name2'),
    loc2: document.getElementById('loc2'),
    time2: document.getElementById('time2'),
    moodEmoji2: document.getElementById('moodEmoji2'),
    moodText2: document.getElementById('moodText2'),

    // Distance
    distanceKm: document.getElementById('distanceKm'),

    // Countdown
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    reunionDate: document.getElementById('reunionDate'),
    journeyProgress: document.getElementById('journeyProgress'),
    progressPercent: document.getElementById('progressPercent'),
    quoteBox: document.getElementById('quoteBox'),

    // Status Bar
    daysTogether: document.getElementById('daysTogether'),
    callHours: document.getElementById('callHours'),
    distanceStat: document.getElementById('distanceStat'),
    messages: document.getElementById('messages'),
    syncTime: document.getElementById('syncTime'),
    weather1: null, // Will create dynamically if needed or just update text
    weather2: null,
    // Navigation
    backBtn: document.getElementById('backBtn'),
    nextBtn: document.getElementById('nextBtn')
};

// Quotes array
const quotes = [
    "Distance means so little when someone means so much",
    "Together forever, never apart. Maybe in distance, but never in heart",
    "The pain of parting is nothing to the joy of meeting again",
    "I carry your heart with me, I carry it in my heart",
    "In true love, the smallest distance is too great",
    "Love knows not distance; it hath no continent; its eyes are for the stars"
];

// Initialize
function init() {
    loadData();
    setupEventListeners();
    startRealTimeUpdates();
    rotateQuotes();
    updateRealTimeWeather();
}

// Load data from CONFIG
function loadData() {
    const config = window.CONFIG;
    if (config) {
        // Dashboard config
        if (config.dashboard) {
            state.yourLocation = config.dashboard.yourLocation || { name: 'You', coordinates: [0, 0] };
            state.theirLocation = config.dashboard.theirLocation || { name: 'Them', coordinates: [0, 0] };
            state.nextReunionDate = config.dashboard.nextReunionDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            state.timezoneYou = config.dashboard.yourLocation?.timezone || 'Asia/Jakarta';
            state.timezoneThem = config.dashboard.theirLocation?.timezone || 'America/New_York';

            // Moods
            if (config.dashboard.moods) {
                state.moodYou = config.dashboard.moods.you || state.moodYou;
                state.moodThem = config.dashboard.moods.them || state.moodThem;
            }

            // Weather
            if (config.dashboard.weather) {
                state.weather = { ...state.weather, ...config.dashboard.weather };
            }

            // Stats
            if (config.dashboard.stats) {
                state.stats = { ...state.stats, ...config.dashboard.stats };
            }
        }

        // Relationship start date from login
        if (config.login && config.login.relationshipStartDate) {
            state.relationshipStartDate = new Date(config.login.relationshipStartDate);
        }
        
        // Names from login config
        if (config.login) {
            if (config.login.youLabel) {
                state.yourLocation = state.yourLocation || {};
                state.yourLocation.personName = config.login.youLabel;
            }
            if (config.login.themLabel) {
                state.theirLocation = state.theirLocation || {};
                state.theirLocation.personName = config.login.themLabel;
            }
        }
    }

    // Calculate distance
    if (state.yourLocation && state.theirLocation) {
        state.stats.distanceKm = calculateDistance(
            state.yourLocation.coordinates,
            state.theirLocation.coordinates
        );
    }

    // Calculate days together
    if (state.relationshipStartDate) {
        const now = new Date();
        const diff = now - state.relationshipStartDate;
        state.stats.daysTogether = Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // Check for coordinate changes to trigger weather refresh
    const youCoordsChanged = JSON.stringify(state.yourLocation?.coordinates) !== JSON.stringify(state.lastCoords.you);
    const themCoordsChanged = JSON.stringify(state.theirLocation?.coordinates) !== JSON.stringify(state.lastCoords.them);

    if (youCoordsChanged || themCoordsChanged) {
        state.lastCoords.you = state.yourLocation?.coordinates ? [...state.yourLocation.coordinates] : null;
        state.lastCoords.them = state.theirLocation?.coordinates ? [...state.theirLocation.coordinates] : null;

        // Only debounced or simple call
        updateRealTimeWeather();
    }

    // Update UI
    updateProfiles();
    updateStats();
    updateReunionDisplay();
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const lat1 = coord1[0] * Math.PI / 180;
    const lat2 = coord2[0] * Math.PI / 180;
    const deltaLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const deltaLon = (coord2[1] - coord1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

// Update profile displays
function updateProfiles() {
    // Profile 1 (You)
    elements.name1.textContent = state.yourLocation?.personName || 'You';
    elements.loc1.textContent = `📍 ${state.yourLocation?.name || 'Location'}`;

    // Auto Mood 1
    const moodYou = getMoodByTime(state.timezoneYou);
    elements.moodEmoji1.textContent = moodYou.emoji;
    elements.moodText1.textContent = moodYou.text;

    // Update Photo 1
    if (state.yourLocation?.photo) {
        elements.avatar1.innerHTML = `<img src="${state.yourLocation.photo}" alt="You" onerror="this.parentElement.innerHTML='<span class=\\'avatar-icon\\'>👤</span>'">`;
    } else {
        elements.avatar1.innerHTML = `<span class="avatar-icon">👤</span>`;
    }

    // Profile 2 (Them)
    elements.name2.textContent = state.theirLocation?.personName || 'Them';
    elements.loc2.textContent = `📍 ${state.theirLocation?.name || 'Location'}`;

    // Auto Mood 2
    const moodThem = getMoodByTime(state.timezoneThem);
    elements.moodEmoji2.textContent = moodThem.emoji;
    elements.moodText2.textContent = moodThem.text;

    // Update Photo 2
    if (state.theirLocation?.photo) {
        elements.avatar2.innerHTML = `<img src="${state.theirLocation.photo}" alt="Them" onerror="this.parentElement.innerHTML='<span class=\\'avatar-icon\\'>👤</span>'">`;
    } else {
        elements.avatar2.innerHTML = `<span class="avatar-icon">👤</span>`;
    }

    // Update Weather display (simple injection)
    updateWeatherUI();

    // Distance
    elements.distanceKm.textContent = `${state.stats.distanceKm.toLocaleString()} km`;
}

function updateWeatherUI() {
    const w1 = state.weather.you;
    const w2 = state.weather.them;

    // Inject weather info into location area if not exists
    const loc1Area = elements.loc1.parentElement;
    const loc2Area = elements.loc2.parentElement;

    let weatherEl1 = loc1Area.querySelector('.weather-info');
    if (!weatherEl1) {
        weatherEl1 = document.createElement('div');
        weatherEl1.className = 'weather-info';
        weatherEl1.style.fontSize = '10px';
        weatherEl1.style.opacity = '0.7';
        weatherEl1.style.marginTop = '2px';
        loc1Area.appendChild(weatherEl1);
    }
    weatherEl1.textContent = `${w1.emoji} ${w1.temp} - ${w1.desc}`;

    let weatherEl2 = loc2Area.querySelector('.weather-info');
    if (!weatherEl2) {
        weatherEl2 = document.createElement('div');
        weatherEl2.className = 'weather-info';
        weatherEl2.style.fontSize = '10px';
        weatherEl2.style.opacity = '0.7';
        weatherEl2.style.marginTop = '2px';
        loc2Area.appendChild(weatherEl2);
    }
    weatherEl2.textContent = `${w2.emoji} ${w2.temp} - ${w2.desc}`;
}

// Weather Code mapping for Open-Meteo (WMO Codes)
function weatherCodeToInfo(code) {
    if (code === 0) return { emoji: '☀️', desc: 'Clear' };
    if (code <= 3) return { emoji: '☁️', desc: 'Partly Cloudy' };
    if (code >= 45 && code <= 48) return { emoji: '🌫️', desc: 'Foggy' };
    if (code >= 51 && code <= 67) return { emoji: '🌧️', desc: 'Rainy' };
    if (code >= 71 && code <= 77) return { emoji: '❄️', desc: 'Snowy' };
    if (code >= 80 && code <= 82) return { emoji: '🌦️', desc: 'Showers' };
    if (code >= 95) return { emoji: '⛈️', desc: 'Thunderstorm' };
    return { emoji: '🌤️', desc: 'Cloudy' };
}

// Fetch real-time weather from Open-Meteo API
async function updateRealTimeWeather() {
    console.log('[Weather] Fetching real-time updates...');
    const fetchOne = async (coords) => {
        if (!coords || coords.length < 2) return null;
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&current_weather=true`);
            const data = await res.json();
            if (data && data.current_weather) {
                const info = weatherCodeToInfo(data.current_weather.weathercode);
                return {
                    emoji: info.emoji,
                    temp: Math.round(data.current_weather.temperature) + '°C',
                    desc: info.desc
                };
            }
            return null;
        } catch (e) {
            console.error('[Weather] Error fetching:', e);
            return null;
        }
    };

    const w1 = await fetchOne(state.yourLocation?.coordinates);
    const w2 = await fetchOne(state.theirLocation?.coordinates);

    if (w1) state.weather.you = w1;
    if (w2) state.weather.them = w2;

    updateWeatherUI();
}

// Update status bar stats
function updateStats() {
    elements.daysTogether.textContent = `${state.stats.daysTogether.toLocaleString()} days`;
    elements.callHours.textContent = `${state.stats.videoCallHours.toLocaleString()} hrs`;
    elements.distanceStat.textContent = `${state.stats.distanceKm.toLocaleString()} km`;
    elements.messages.textContent = state.stats.messagesExchanged;
}

// Update reunion date display
function updateReunionDisplay() {
    if (state.nextReunionDate) {
        const date = new Date(state.nextReunionDate);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        elements.reunionDate.textContent = `Target: ${date.toLocaleDateString('en-US', options)}`;
    }
}

// Start real-time updates
function startRealTimeUpdates() {
    updateClocks();
    updateCountdown();
    updateProfiles(); // Initial call for auto-moods

    // Update every second
    setInterval(() => {
        updateClocks();
        updateCountdown();
    }, 1000);

    // Update profiles/moods every minute
    setInterval(() => {
        updateProfiles();
    }, 60000);
}

// Update local time clocks
function updateClocks() {
    const now = new Date();

    // Time 1 (You)
    try {
        const time1 = now.toLocaleTimeString('en-US', {
            timeZone: state.timezoneYou,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        elements.time1.textContent = time1;
    } catch (e) {
        elements.time1.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    // Time 2 (Them)
    try {
        const time2 = now.toLocaleTimeString('en-US', {
            timeZone: state.timezoneThem,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        elements.time2.textContent = time2;
    } catch (e) {
        elements.time2.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    // Sync time (server time)
    elements.syncTime.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}

// Logic for Mood/Status based on time
function getMoodByTime(timezone) {
    try {
        const now = new Date();
        const localHour = parseInt(now.toLocaleTimeString('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            hour12: false
        }));

        if (localHour >= 0 && localHour < 6) return { emoji: '😴', text: 'Sleeping' };
        if (localHour >= 6 && localHour < 9) return { emoji: '🌅', text: 'Waking up' };
        if (localHour >= 9 && localHour < 17) return { emoji: '💻', text: 'Working' };
        if (localHour >= 17 && localHour < 20) return { emoji: '🍱', text: 'Dinner time' };
        if (localHour >= 20 && localHour < 23) return { emoji: '🎬', text: 'Relaxing' };
        return { emoji: '🌙', text: 'Getting sleepy' };
    } catch (e) {
        return { emoji: '😊', text: 'Happy' };
    }
}

// Update countdown to reunion
function updateCountdown() {
    if (!state.nextReunionDate) return;

    const now = new Date();
    const target = new Date(state.nextReunionDate);
    const diff = target - now;

    if (diff <= 0) {
        // Reunion time!
        elements.days.textContent = '00';
        elements.hours.textContent = '00';
        elements.minutes.textContent = '00';
        elements.seconds.textContent = '00';
        elements.reunionDate.textContent = '🎉 IT\'S TIME TO MEET! 🎉';
        elements.journeyProgress.style.width = '100%';
        elements.progressPercent.textContent = '100%';
        return;
    }

    // Calculate time units
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Update display
    elements.days.textContent = days.toString().padStart(2, '0');
    elements.hours.textContent = hours.toString().padStart(2, '0');
    elements.minutes.textContent = minutes.toString().padStart(2, '0');
    elements.seconds.textContent = seconds.toString().padStart(2, '0');

    // Calculate progress (assume max wait is 180 days for 100%)
    const maxWait = 180 * 24 * 60 * 60 * 1000; // 180 days in ms
    const progress = Math.min(100, Math.max(0, ((maxWait - diff) / maxWait) * 100));
    elements.journeyProgress.style.width = `${progress}%`;
    elements.progressPercent.textContent = `${Math.round(progress)}%`;
}

// Rotate quotes every 30 seconds
function rotateQuotes() {
    let index = 0;
    setInterval(() => {
        index = (index + 1) % quotes.length;
        elements.quoteBox.textContent = `"${quotes[index]}"`;
    }, 30000);
}

// Setup event listeners
function setupEventListeners() {
    elements.backBtn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'NAVIGATE', direction: 'back' }, '*');
    });

    elements.nextBtn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'APP_COMPLETE' }, '*');
    });
}

// Listen for CONFIG_UPDATE from parent
window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'CONFIG_UPDATE' && e.data.config) {
        window.CONFIG = e.data.config;
        loadData();
    }
});

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
