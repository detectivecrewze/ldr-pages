/**
 * Enhanced Map Picker Module
 * Ported from Birthday Theme with premium features:
 * 1. Photon API Search (Better than Nominatim)
 * 2. Paste Google Maps Link Support
 * 3. Click on Map & Manual Coordinates
 * 4. Premium Pulse Marker
 */

const mapPicker = {
    map: null,
    marker: null,
    currentTarget: null, // Stores the input ID or target key ('yourLocation', 'theirLocation')
    searchDebounce: null,
    selectedLatLng: null,

    // Initialize map
    init() {
        if (this.map) return;

        // Detect if mobile
        const isMobile = window.innerWidth < 768;

        // Create map instance - default to Jakarta
        this.map = L.map('leafletPickerContainer', {
            zoomControl: !isMobile,
            tap: true,
            touchZoom: true,
            scrollWheelZoom: false
        }).setView([-6.2088, 106.8456], 13);

        if (isMobile) {
            L.control.zoom({ position: 'bottomright' }).addTo(this.map);
        }

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.map.on('click', (e) => {
            this.setMarker(e.latlng);
            this.hideResults();
        });

        const searchInput = document.getElementById('mapSearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.search(true);
            });
            searchInput.addEventListener('input', () => {
                if (this.searchDebounce) clearTimeout(this.searchDebounce);
                this.searchDebounce = setTimeout(() => this.search(false), 500);
            });
        }

        const gmapsInput = document.getElementById('gmapsLinkInput');
        if (gmapsInput) {
            gmapsInput.addEventListener('input', () => this.handleGoogleMapsLink(gmapsInput.value));
            gmapsInput.addEventListener('paste', (e) => {
                setTimeout(() => this.handleGoogleMapsLink(gmapsInput.value), 100);
            });
        }

        document.addEventListener('click', (e) => {
            const searchInput = document.getElementById('mapSearchInput');
            const resultsContainer = document.getElementById('mapSearchResults');
            if (searchInput && resultsContainer) {
                if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                    this.hideResults();
                }
            }
        });
    },

    // Backward compatibility for dashboard
    open(target) {
        this.currentTarget = target;
        this.showModal();

        // Get initial coords
        const config = state.getConfig();
        const coordsArray = target === 'yourLocation'
            ? config.dashboard?.yourLocation?.coordinates
            : config.dashboard?.theirLocation?.coordinates;

        this.setupInitialView(coordsArray);
    },

    // Backward compatibility for Journey Map pins
    openForPin(inputId) {
        this.currentTarget = inputId;
        this.showModal();

        const input = document.getElementById(inputId);
        let coordsArray = null;
        if (input && input.value) {
            coordsArray = input.value.split(',').map(v => parseFloat(v.trim()));
        }

        this.setupInitialView(coordsArray);
    },

    showModal() {
        const modal = document.getElementById('mapPickerModal');
        modal.classList.remove('hidden');
        this.switchTab('search');

        const searchInput = document.getElementById('mapSearchInput');
        const gmapsInput = document.getElementById('gmapsLinkInput');
        if (searchInput) searchInput.value = '';
        if (gmapsInput) {
            gmapsInput.value = '';
            gmapsInput.placeholder = 'Paste Google Maps browser link...';
        }
        this.hideResults();

        setTimeout(() => {
            this.init();
            this.map.invalidateSize();
        }, 100);
    },

    setupInitialView(coordsArray) {
        setTimeout(() => {
            if (coordsArray && coordsArray.length === 2 && !isNaN(coordsArray[0])) {
                const latlng = { lat: coordsArray[0], lng: coordsArray[1] };
                this.setMarker(latlng);
                this.map.setView(latlng, 15);
            } else {
                this.resetMarker();
            }
        }, 150);
    },

    close() {
        document.getElementById('mapPickerModal').classList.add('hidden');
        this.currentTarget = null;
    },

    setMarker(latlng) {
        this.selectedLatLng = latlng;
        const redPinIcon = L.divIcon({
            className: 'map-pin-div-icon',
            html: `
                <div class="map-pin-container">
                    <div class="map-pin-pulse"></div>
                    <div class="map-precision-dot"></div>
                    <div class="map-pin-body">
                        <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 52C20 52 40 38 40 20C40 8.95 31.05 0 20 0C8.95 0 0 8.95 0 20C0 38 20 52 20 52Z" fill="#EF4444"/>
                            <circle cx="20" cy="20" r="11" fill="white"/>
                            <circle cx="20" cy="20" r="5" fill="#EF4444"/>
                        </svg>
                    </div>
                </div>
            `,
            iconSize: [40, 52],
            iconAnchor: [20, 52]
        });

        if (this.marker) {
            this.marker.setIcon(redPinIcon);
            this.marker.setLatLng(latlng);
        } else {
            this.marker = L.marker(latlng, { icon: redPinIcon, draggable: true }).addTo(this.map);
            this.marker.on('dragend', () => {
                this.selectedLatLng = this.marker.getLatLng();
                this.updateUI();
            });
        }
        this.updateUI();
    },

    resetMarker() {
        if (this.marker) {
            this.map.removeLayer(this.marker);
            this.marker = null;
        }
        this.selectedLatLng = null;
        this.updateUI();
    },

    async updateUI() {
        const text = document.getElementById('selectedLocationText');
        const btn = document.getElementById('confirmLocationBtn');

        if (this.selectedLatLng) {
            const { lat, lng } = this.selectedLatLng;
            text.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            text.classList.remove('italic', 'text-gray-400');
            btn.disabled = false;

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                    headers: { 'User-Agent': 'LDRApp/1.0' }
                });
                const data = await response.json();
                if (data.display_name) text.textContent = data.display_name;
            } catch (e) { }
        } else {
            text.textContent = 'Click on map to pick...';
            text.classList.add('italic', 'text-gray-400');
            btn.disabled = true;
        }
    },

    async search(isFinal = false) {
        const query = document.getElementById('mapSearchInput').value.trim();
        if (query.length < 3) return this.hideResults();

        try {
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en`);
            const data = await response.json();
            if (data?.features?.length > 0) {
                this.showResults(data.features);
                if (isFinal) this.selectPhotonResult(data.features[0]);
            }
        } catch (e) {
            // Fallback to basic Nominatim if Photon fails
            this.searchNominatim(query, isFinal);
        }
    },

    async searchNominatim(query, isFinal) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            const data = await res.json();
            if (data?.length > 0) {
                const features = data.map(item => ({
                    geometry: { coordinates: [parseFloat(item.lon), parseFloat(item.lat)] },
                    properties: { name: item.display_name.split(',')[0], country: '' }
                }));
                this.showResults(features);
                if (isFinal) this.selectPhotonResult(features[0]);
            }
        } catch (e) { }
    },

    showResults(results) {
        const container = document.getElementById('mapSearchResults');
        if (!container) return;
        container.innerHTML = results.map(res => `
            <div class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-start gap-3 transition-colors group"
                onclick='mapPicker.selectPhotonResult(${JSON.stringify(res).replace(/'/g, "&#39;")})'>
                <div class="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <span class="material-symbols-outlined text-slate-400 group-hover:text-indigo-600 text-lg">location_on</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold text-slate-900 truncate">${res.properties.name || 'Unknown'}</div>
                    <div class="text-[10px] text-slate-400 truncate mt-0.5">${res.properties.city || ''} ${res.properties.country || ''}</div>
                </div>
            </div>
        `).join('');
        container.classList.remove('hidden');
    },

    hideResults() {
        const container = document.getElementById('mapSearchResults');
        if (container) container.classList.add('hidden');
    },

    selectPhotonResult(res) {
        const [lng, lat] = res.geometry.coordinates;
        const latlng = { lat, lng };
        this.map.setView(latlng, 16);
        this.setMarker(latlng);
        this.hideResults();
        const input = document.getElementById('mapSearchInput');
        if (input) input.value = res.properties.name || '';
    },

    handleGoogleMapsLink(url) {
        if (!url) return;

        // Extract coords from URL
        const pattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = url.match(pattern);

        if (match) {
            const latlng = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
            this.map.setView(latlng, 16);
            this.setMarker(latlng);
            utils.showNotification('Location detected from link!', 'success');
            document.getElementById('gmapsLinkInput').value = '';
        } else if (url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
            utils.showNotification('Please use a full browser URL, not a short link.', 'warning');
        }
    },

    switchTab(tab) {
        const searchTab = document.getElementById('tabSearch');
        const pasteTab = document.getElementById('tabPasteLink');
        const searchContent = document.getElementById('searchTabContent');
        const pasteContent = document.getElementById('pasteTabContent');

        if (tab === 'search') {
            searchTab.className = 'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all bg-white text-indigo-600 shadow-sm border border-slate-100';
            pasteTab.className = 'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all text-slate-500 hover:text-slate-700';
            searchContent.classList.remove('hidden');
            pasteContent.classList.add('hidden');
        } else {
            pasteTab.className = 'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all bg-white text-emerald-600 shadow-sm border border-slate-100';
            searchTab.className = 'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all text-slate-500 hover:text-slate-700';
            pasteContent.classList.remove('hidden');
            searchContent.classList.add('hidden');
        }
    },

    confirm() {
        if (!this.selectedLatLng || !this.currentTarget) return;

        const { lat, lng } = this.selectedLatLng;
        const coords = [lat, lng];

        // 1. Check if target is 'yourLocation' or 'theirLocation' (Dashboard)
        if (this.currentTarget === 'yourLocation' || this.currentTarget === 'theirLocation') {
            const fieldId = this.currentTarget === 'yourLocation' ? 'yourCoords' : 'theirCoords';
            const input = document.getElementById(fieldId);
            if (input) {
                input.value = coords.map(c => c.toFixed(6)).join(', ');
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            // Also update state directly for the dashboard
            state.updateNestedConfig('dashboard', this.currentTarget, { coordinates: coords });
        } else {
            // 2. Otherwise treat it as an input ID (Journey Map Pins)
            const input = document.getElementById(this.currentTarget);
            if (input) {
                input.value = coords.map(c => c.toFixed(6)).join(', ');
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        this.close();
        utils.showNotification('Location updated!', 'success');
    }
};

window.mapPicker = mapPicker;
