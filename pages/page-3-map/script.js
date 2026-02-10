// Windows 98 Style Traveler Map Script - Windowed Version

const JourneyMapPage = {
    config: null,
    map: null,
    pins: [],
    currentPinIndex: 0,
    markers: [],
    polyline: null,
    journeyAnimationRunning: false,

    init() {
        this.loadConfig();
        this.loadPins();
        this.updateStats();
        this.setupEventListeners();

        // Safety timeout - force show map after 5 seconds max
        const safetyTimeout = setTimeout(() => {
            console.log('[Map] Safety timeout triggered');
            const loading = document.getElementById('mapLoading');
            if (loading && !loading.classList.contains('hidden')) {
                loading.classList.add('hidden');
                this.initializeMap();
            }
        }, 5000);

        // Animate loading progress
        this.animateLoading().then(() => {
            clearTimeout(safetyTimeout);
            this.initializeMap();
        }).catch(err => {
            console.error('[Map] Loading animation error:', err);
            clearTimeout(safetyTimeout);
            document.getElementById('mapLoading').classList.add('hidden');
        });
    },

    animateLoading() {
        return new Promise(resolve => {
            const texts = [
                'Preparing your journey...',
                'Unfolding the map...',
                'Plotting our adventures...',
                'Almost there...'
            ];

            const textEl = document.getElementById('loadingText');
            const progressEl = document.getElementById('loadingProgress');
            const percentEl = document.getElementById('loadingPercent');

            let progress = 0;
            const duration = 2500; // 2.5 seconds
            const interval = 50;
            const increment = 100 / (duration / interval);

            const timer = setInterval(() => {
                progress += increment;

                if (progressEl) progressEl.style.width = progress + '%';
                if (percentEl) percentEl.textContent = Math.min(Math.round(progress), 100) + '%';

                // Update text at certain percentages
                if (progress > 20 && progress < 25) textEl.textContent = texts[1];
                if (progress > 50 && progress < 55) textEl.textContent = texts[2];
                if (progress > 80 && progress < 85) textEl.textContent = texts[3];

                if (progress >= 100) {
                    clearInterval(timer);
                    setTimeout(resolve, 300);
                }
            }, interval);
        });
    },

    loadConfig() {
        if (window.parent && window.parent !== window && window.parent.CONFIG) {
            this.config = window.parent.CONFIG;
        } else if (window.CONFIG) {
            this.config = window.CONFIG;
        } else {
            this.config = {
                journeyMap: {
                    pins: [
                        { coords: [-6.174998, 106.826935], label: 'The First Date', photo: '', note: '', date: '2023-01-20' }
                    ]
                }
            };
        }
    },

    loadPins() {
        if (this.config?.journeyMap?.pins && Array.isArray(this.config.journeyMap.pins) && this.config.journeyMap.pins.length > 0) {
            this.pins = this.config.journeyMap.pins;
        } else {
            this.pins = [
                {
                    coords: [-6.174998, 106.826935],
                    label: "The First Date",
                    photo: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400",
                    note: "Where our story began.",
                    date: "Aug 2023"
                },
                {
                    coords: [-6.405206, 106.813331],
                    label: "On the Lake",
                    photo: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400",
                    note: "Lost in the blue with you.",
                    date: "Dec 2023"
                },
                {
                    coords: [-6.824265, 107.437921],
                    label: "Mountain Peak",
                    photo: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=400",
                    note: "Top of the world, side by side.",
                    date: "Mar 2024"
                }
            ];
        }
    },

    initializeMap() {
        try {
            // Calculate bounds for all pins
            const allCoords = this.pins.map(p => p.coords);

            // Validate coordinates
            if (allCoords.length === 0 || !allCoords[0] || allCoords[0].length !== 2) {
                console.error('[Map] Invalid coordinates:', allCoords);
                // Use default coordinates
                allCoords.push([-6.2088, 106.8456]);
            }

            const bounds = L.latLngBounds(allCoords);
            const center = bounds.getCenter();

            // Create map with world view initially
            this.map = L.map('loveMap', {
                center: center,
                zoom: 2,
                zoomControl: false,
                attributionControl: false,
                scrollWheelZoom: false
            });

            // Add zoom control at bottom right
            L.control.zoom({ position: 'bottomright' }).addTo(this.map);

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: 'abc'
            }).addTo(this.map);

            // Render pin list first
            this.renderPinList();

            // Hide loading AFTER map is created
            document.getElementById('mapLoading').classList.add('hidden');

            // Start the journey animation
            this.startJourneyAnimation();
        } catch (error) {
            console.error('[Map] Initialization error:', error);
            // Show error message and hide loading
            const loadingText = document.getElementById('loadingText');
            if (loadingText) {
                loadingText.textContent = 'Error loading map. Please refresh.';
                loadingText.style.color = '#ef4444';
            }
            document.getElementById('mapLoading').classList.add('hidden');
        }
    },

    async startJourneyAnimation() {
        if (this.pins.length === 0) return;

        this.journeyAnimationRunning = true;

        // Draw the journey line connecting all pins
        this.drawJourneyLine();

        // Animate through each pin
        for (let i = 0; i < this.pins.length; i++) {
            this.currentPinIndex = i;

            // Add marker for this pin
            this.addMarker(i);

            // Pan and zoom to this pin
            await this.animateToPin(i);

            // Show location card - DISABLED as per user request
            // this.showLocationCard(this.pins[i]);

            // Update UI
            this.updatePinListSelection(false); // false = don't scroll
            this.updateNavigator();

            // Wait before moving to next pin (except for last one)
            if (i < this.pins.length - 1) {
                await this.delay(2000);
            }
        }

        this.journeyAnimationRunning = false;

        // Final zoom out to show all pins
        this.showAllPins();

        // Show completion popup after a short delay
        setTimeout(() => {
            this.showPopup();
        }, 1500);
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    animateToPin(index) {
        return new Promise(resolve => {
            const pin = this.pins[index];

            // Fly to the pin with smooth animation
            this.map.flyTo(pin.coords, 12, {
                duration: 1.5,
                easeLinearity: 0.25
            });

            // Resolve after animation completes
            this.map.once('moveend', resolve);
        });
    },

    showAllPins() {
        if (this.pins.length < 2) return;

        const allCoords = this.pins.map(p => p.coords);
        const bounds = L.latLngBounds(allCoords);

        this.map.flyToBounds(bounds, {
            padding: [50, 50],
            duration: 1.5
        });
    },

    addMarker(index) {
        const pin = this.pins[index];

        const customIcon = L.divIcon({
            className: 'custom-pin',
            html: `
                <div class="pin-body">
                    <div class="pin-head">
                        <span>${index + 1}</span>
                    </div>
                    <div class="pin-pulse"></div>
                </div>
            `,
            iconSize: [30, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -38]
        });

        const marker = L.marker(pin.coords, { icon: customIcon }).addTo(this.map);

        marker.on('click', () => {
            this.showPin(index);
        });

        this.markers.push(marker);
    },

    drawJourneyLine() {
        if (this.pins.length < 2) return;

        const latlngs = this.pins.map(pin => pin.coords);

        this.polyline = L.polyline(latlngs, {
            color: '#c0392b',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.map);
    },

    showPin(index) {
        if (index < 0 || index >= this.pins.length) return;

        this.currentPinIndex = index;
        const pin = this.pins[index];

        // Pan to pin smoothly
        this.map.flyTo(pin.coords, 12, { duration: 1 });

        // Show card
        this.showLocationCard(pin);

        // Update list selection (without scrolling)
        this.updatePinListSelection(false);

        // Update navigator
        this.updateNavigator();
    },

    showLocationCard(pin) {
        const card = document.getElementById('locationCard');

        document.getElementById('cardImage').src = pin.photo;
        document.getElementById('cardTitle').textContent = pin.label;
        document.getElementById('cardDate').textContent = '📅 ' + pin.date;
        document.getElementById('cardNote').textContent = pin.note;

        card.classList.add('active');
    },

    hideLocationCard() {
        document.getElementById('locationCard').classList.remove('active');
    },

    renderPinList() {
        const list = document.getElementById('pinList');
        if (!list) return;

        list.innerHTML = this.pins.map((pin, index) => `
            <div class="pin-list-item" data-index="${index}">
                <span class="pin-list-number">${index + 1}</span>
                <img src="${pin.photo}" alt="${pin.label}" class="pin-thumb">
                <div class="pin-list-info">
                    <div class="pin-list-title">${pin.label}</div>
                    <div class="pin-list-date">📅 ${pin.date}</div>
                    <div class="pin-list-note">${pin.note}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        list.querySelectorAll('.pin-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.showPin(index);
            });
        });
    },

    updatePinListSelection(shouldScroll = false) {
        const items = document.querySelectorAll('.pin-list-item');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentPinIndex);
        });

        // Only scroll if explicitly requested (for journey animation)
        if (shouldScroll) {
            const activeItem = items[this.currentPinIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    },

    updateNavigator() {
        document.getElementById('currentPin').textContent = this.currentPinIndex + 1;
        document.getElementById('totalPins').textContent = this.pins.length;
    },

    nextPin() {
        const nextIndex = (this.currentPinIndex + 1) % this.pins.length;
        this.showPin(nextIndex);
    },

    prevPin() {
        const prevIndex = (this.currentPinIndex - 1 + this.pins.length) % this.pins.length;
        this.showPin(prevIndex);
    },

    updateStats() {
        document.getElementById('pinCount').textContent = this.pins.length;

        let totalDistance = 0;
        for (let i = 0; i < this.pins.length - 1; i++) {
            totalDistance += this.calculateDistance(
                this.pins[i].coords,
                this.pins[i + 1].coords
            );
        }
        document.getElementById('totalDistance').textContent = Math.round(totalDistance).toLocaleString();

        if (this.pins.length >= 2) {
            const dates = this.pins
                .map(p => p.date ? new Date(p.date) : null)
                .filter(d => d && !isNaN(d.getTime()));

            if (dates.length >= 2) {
                const minDate = new Date(Math.min(...dates));
                const maxDate = new Date(Math.max(...dates));
                const diffTime = Math.abs(maxDate - minDate);
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                document.getElementById('tripDuration').textContent = Math.max(1, days);
            } else {
                document.getElementById('tripDuration').textContent = '—';
            }
        } else {
            document.getElementById('tripDuration').textContent = '—';
        }
    },

    calculateDistance(coord1, coord2) {
        if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return 0;

        // Ensure they are numbers
        const lat1_val = parseFloat(coord1[0]);
        const lon1_val = parseFloat(coord1[1]);
        const lat2_val = parseFloat(coord2[0]);
        const lon2_val = parseFloat(coord2[1]);

        if (isNaN(lat1_val) || isNaN(lon1_val) || isNaN(lat2_val) || isNaN(lon2_val)) return 0;

        const R = 6371;
        const lat1 = lat1_val * Math.PI / 180;
        const lat2 = lat2_val * Math.PI / 180;
        const deltaLat = (lat2_val - lat1_val) * Math.PI / 180;
        const deltaLon = (lon2_val - lon1_val) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    },

    setupEventListeners() {
        document.getElementById('backButton').addEventListener('click', () => {
            window.parent.postMessage({ type: 'NAVIGATE', direction: 'close' }, '*');
        });

        document.getElementById('nextButton').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'APP_COMPLETE',
                appId: 'journey',
                nextApp: 'memories'
            }, '*');
        });

        document.getElementById('nextPin').addEventListener('click', () => {
            this.nextPin();
        });

        document.getElementById('prevPin').addEventListener('click', () => {
            this.prevPin();
        });

        document.getElementById('cardClose').addEventListener('click', () => {
            this.hideLocationCard();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.nextPin();
            else if (e.key === 'ArrowLeft') this.prevPin();
            else if (e.key === 'Escape') this.hideLocationCard();
        });
    },

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    },

    showPopup() {
        const popup = document.getElementById('completionPopup');
        if (!popup) return;

        // Update stats in popup
        const distance = document.getElementById('totalDistance').textContent;
        const placesCount = this.pins.length;

        document.getElementById('popupDistance').textContent = distance;
        document.getElementById('popupPlaces').textContent = placesCount;

        // Handle pluralization for places
        const placesLabel = document.getElementById('popupPlacesLabel');
        if (placesLabel) {
            placesLabel.textContent = placesCount === 1 ? 'beautiful place' : 'beautiful places';
        }

        popup.classList.add('active');
    },

    closePopup() {
        const popup = document.getElementById('completionPopup');
        if (popup) popup.classList.remove('active');
    },

    proceedToNext() {
        this.closePopup();
        window.parent.postMessage({
            type: 'APP_COMPLETE',
            appId: 'journey',
            nextApp: 'memories'
        }, '*');
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    JourneyMapPage.init();
});

// Listen for config updates
window.addEventListener('message', (e) => {
    if (e.data?.type === 'CONFIG_UPDATE') {
        window.CONFIG = e.data.config;
        JourneyMapPage.config = e.data.config;
        JourneyMapPage.loadPins();
        JourneyMapPage.updateStats();

        if (JourneyMapPage.map) {
            JourneyMapPage.destroy();
            JourneyMapPage.markers = [];
            JourneyMapPage.initializeMap();
        }
    }
});

window.addEventListener('beforeunload', () => {
    JourneyMapPage.destroy();
});
