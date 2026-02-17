/**
 * LDR Studio - Premium Map Picker Module
 * Fully ported from Valentine Project with robust features:
 * 1. Photon API Search (Better than Nominatim)
 * 2. Advanced Google Maps Link Parser (Regex patterns)
 * 3. Short Link Help Tooltip
 * 4. Click on Map & Manual Precision Selection
 * 5. Multi-target support (Dashboard & Generic Inputs)
 */

window.mapPicker = {
    map: null,
    marker: null,
    currentTarget: null, // Stores the target key ('yourLocation', 'theirLocation') or an element ID
    selectedLatLng: null,
    searchDebounce: null,

    // Initialize map
    init() {
        if (this.map) return;

        // Create map instance - bias to Indonesia
        this.map = L.map('leafletPickerContainer', {
            zoomControl: true,
            tap: true,
            touchZoom: true,
            scrollWheelZoom: true
        }).setView([-6.2088, 106.8456], 13);

        // Add OSM tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(this.map);

        // Map click handler
        this.map.on('click', (e) => {
            this.setMarker(e.latlng);
            this.hideResults();
        });

        // Search Input Events
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

        // GMaps Link Events
        const gmapsInput = document.getElementById('gmapsLinkInput');
        if (gmapsInput) {
            gmapsInput.addEventListener('input', () => this.handleGoogleMapsLink(gmapsInput.value));
            gmapsInput.addEventListener('paste', () => {
                setTimeout(() => this.handleGoogleMapsLink(gmapsInput.value), 100);
            });
        }

        // Close results on outside click
        document.addEventListener('click', (e) => {
            const resultsContainer = document.getElementById('mapSearchResults');
            if (resultsContainer && !resultsContainer.contains(e.target) && e.target.id !== 'mapSearchInput') {
                this.hideResults();
            }
        });
    },

    // Open picker for a target
    open(target) {
        this.currentTarget = target;
        this.showModal();

        // Get initial coords
        let coordsArray = null;
        if (target === 'yourLocation' || target === 'theirLocation') {
            const config = window.StudioState?.config?.dashboard;
            if (config && config[target]) {
                coordsArray = config[target].coordinates;
            }
        } else {
            const input = document.getElementById(target);
            if (input && input.value) {
                coordsArray = input.value.split(',').map(v => parseFloat(v.trim()));
            }
        }

        // Initial setup
        setTimeout(() => {
            this.init();
            this.map.invalidateSize();

            if (coordsArray && coordsArray.length === 2 && !isNaN(coordsArray[0])) {
                const latlng = { lat: coordsArray[0], lng: coordsArray[1] };
                this.setMarker(latlng);
                this.map.setView(latlng, 15);
            } else {
                this.resetMarker();
            }
        }, 150);
    },

    showModal() {
        const modal = document.getElementById('mapPickerModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.switchTab('search');

            // Clear inputs
            const searchInput = document.getElementById('mapSearchInput');
            const gmapsInput = document.getElementById('gmapsLinkInput');
            if (searchInput) searchInput.value = '';
            if (gmapsInput) {
                gmapsInput.value = '';
                gmapsInput.placeholder = 'Tempel link browser ke sini...';
            }
            this.hideResults();
        }
    },

    close() {
        const modal = document.getElementById('mapPickerModal');
        if (modal) modal.classList.add('hidden');
        this.currentTarget = null;
    },

    switchTab(tab) {
        const searchTab = document.getElementById('tabSearch');
        const pasteTab = document.getElementById('tabPasteLink');
        const searchContent = document.getElementById('searchTabContent');
        const pasteContent = document.getElementById('pasteTabContent');

        if (!searchTab || !pasteTab) return;

        if (tab === 'search') {
            searchTab.className = 'flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white text-blue-600 shadow-sm border border-gray-100';
            pasteTab.className = 'flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-gray-400 hover:text-gray-600';
            searchContent?.classList.remove('hidden');
            pasteContent?.classList.add('hidden');
        } else {
            pasteTab.className = 'flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white text-emerald-600 shadow-sm border border-gray-100';
            searchTab.className = 'flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-gray-400 hover:text-gray-600';
            pasteContent?.classList.remove('hidden');
            searchContent?.classList.add('hidden');
        }
    },

    setMarker(latlng) {
        this.selectedLatLng = latlng;

        // Premium Pulse Icon
        const markerIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `
                <div class="relative w-10 h-10 flex items-center justify-center">
                    <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                    <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        if (this.marker) {
            this.marker.setLatLng(latlng);
        } else {
            this.marker = L.marker(latlng, { icon: markerIcon, draggable: true }).addTo(this.map);
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
            if (btn) btn.disabled = false;

            // Reverse geocode for friendly name
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                    headers: { 'User-Agent': 'LDRStudio/1.0' }
                });
                const data = await res.json();
                if (data && data.display_name) {
                    text.textContent = data.display_name;
                }
            } catch (e) { }
        } else {
            if (text) {
                text.textContent = 'Klik pada peta untuk memilih...';
                text.classList.add('italic', 'text-gray-400');
            }
            if (btn) btn.disabled = true;
        }
    },

    // =============================================
    // SEARCH LOGIC (Photon API)
    // =============================================
    async search(isFinal = false) {
        const query = document.getElementById('mapSearchInput')?.value.trim();
        if (!query || query.length < 3) {
            this.hideResults();
            return;
        }

        try {
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en`);
            const data = await res.json();
            if (data && data.features && data.features.length > 0) {
                this.showResults(data.features);
                if (isFinal) this.selectPhotonResult(data.features[0]);
            }
        } catch (e) {
            console.warn('Search failed:', e);
        }
    },

    showResults(results) {
        const container = document.getElementById('mapSearchResults');
        if (!container) return;

        container.innerHTML = results.map(res => {
            const name = res.properties.name || 'Unknown';
            const sub = [res.properties.city, res.properties.country].filter(Boolean).join(', ');
            return `
                <div class="px-5 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-start gap-4 transition-all group"
                    onclick='window.mapPicker.selectPhotonResult(${JSON.stringify(res).replace(/'/g, "&#39;")})'>
                    <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <span class="material-symbols-outlined text-lg">location_on</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-black text-gray-800 truncate">${name}</div>
                        <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate mt-0.5">${sub}</div>
                    </div>
                </div>
            `;
        }).join('');
        container.classList.remove('hidden');
    },

    hideResults() {
        document.getElementById('mapSearchResults')?.classList.add('hidden');
    },

    selectPhotonResult(res) {
        const coords = res.geometry.coordinates;
        const latlng = { lat: coords[1], lng: coords[0] };
        this.map.setView(latlng, 16);
        this.setMarker(latlng);
        this.hideResults();

        const input = document.getElementById('mapSearchInput');
        if (input) input.value = res.properties.name || '';
    },

    // =============================================
    // GMAPS LINK PARSER (The core fix)
    // =============================================
    handleGoogleMapsLink(url) {
        if (!url || url.length < 5) return;

        // 1. Try raw coordinates first
        const rawCoords = this.parseRawCoordinates(url);
        if (rawCoords) {
            this.applyCoordinates(rawCoords);
            return;
        }

        // 2. Check for short links
        if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
            this.showShortLinkHelp();
            return;
        }

        // 3. Robust Regex Extraction
        const coords = this.extractCoordsFromLink(url);
        if (coords) {
            this.applyCoordinates(coords);
            if (typeof window.EditorUX !== 'undefined') window.EditorUX.showNotification('📍 Lokasi terdeteksi dari link!', 'success');
        } else if (url.includes('google.com/maps')) {
            if (typeof window.EditorUX !== 'undefined') window.EditorUX.showNotification('Gagal membaca koordinat. Gunakan link browser penuh.', 'error');
        }
    },

    parseRawCoordinates(input) {
        const pattern = /^(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/;
        const match = input.trim().match(pattern);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                return { lat, lng };
            }
        }
        return null;
    },

    extractCoordsFromLink(url) {
        // Pattern 1: /@lat,lng format
        const p1 = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const m1 = url.match(p1);
        if (m1) return { lat: parseFloat(m1[1]), lng: parseFloat(m1[2]) };

        // Pattern 2: ?q=lat,lng
        const p2 = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const m2 = url.match(p2);
        if (m2) return { lat: parseFloat(m2[1]), lng: parseFloat(m2[2]) };

        // Pattern 4: /place/lat,lng
        const p4 = /(-?\d{1,3}\.\d{4,}),\s*(-?\d{1,3}\.\d{4,})/;
        const m4 = url.match(p4);
        if (m4) return { lat: parseFloat(m4[1]), lng: parseFloat(m4[2]) };

        return null;
    },

    applyCoordinates(coords) {
        const latlng = { lat: coords.lat, lng: coords.lng };
        if (this.map) {
            this.map.setView(latlng, 16);
            this.setMarker(latlng);
            const input = document.getElementById('gmapsLinkInput');
            if (input) {
                input.value = '';
                input.placeholder = '✓ Lokasi Berhasil Diset!';
            }
        }
    },

    showShortLinkHelp() {
        if (typeof window.EditorUX !== 'undefined') {
            window.EditorUX.showNotification('ℹ️ Gunakan link browser penuh. Klik tombol "Help" untuk panduan.', 'warning');
        }
    },

    // =============================================
    // FINAL CONFIRMATION
    // =============================================
    confirm() {
        if (!this.selectedLatLng || !this.currentTarget) return;

        const { lat, lng } = this.selectedLatLng;
        const coords = [lat, lng];

        // 1. Dashboard targets
        if (this.currentTarget === 'yourLocation' || this.currentTarget === 'theirLocation') {
            const fieldId = this.currentTarget === 'yourLocation' ? 'yourCoords' : 'theirCoords';
            const input = document.getElementById(fieldId);
            if (input) {
                input.value = coords.map(c => c.toFixed(6)).join(', ');
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            // Update StudioState
            if (window.Editor.DashboardEditor) {
                window.Editor.DashboardEditor._config[this.currentTarget].coordinates = coords;
                window.Editor.DashboardEditor.syncToState();
            }
        } else {
            // 2. Generic Input ID (e.g. Journey Map Pins)
            const input = document.getElementById(this.currentTarget);
            if (input) {
                input.value = coords.map(c => c.toFixed(6)).join(', ');
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        this.close();
        if (typeof window.EditorUX !== 'undefined') window.EditorUX.showNotification('Lokasi tersimpan! 📍', 'success');
    }
};
