// Map Picker Functionality

const mapPicker = {
    map: null,
    marker: null,
    currentTarget: null, // 'yourLocation' or 'theirLocation'

    open(target) {
        this.currentTarget = target;
        document.getElementById('mapPickerModal').classList.remove('hidden');

        // Initialize map if not already
        if (!this.map) {
            this.initMap();
        }

        // Set initial location from existing config
        const config = state.getConfig();
        const coords = target === 'yourLocation'
            ? config.dashboard?.yourLocation?.coordinates
            : config.dashboard?.theirLocation?.coordinates;

        if (coords) {
            this.map.setView(coords, 10);
            this.setMarker(coords);
        }
    },

    close() {
        document.getElementById('mapPickerModal').classList.add('hidden');
        this.currentTarget = null;
        document.getElementById('selectedLocationText').textContent = 'Click on map to pick...';
        document.getElementById('confirmLocationBtn').disabled = true;
    },

    initMap() {
        this.map = L.map('leafletPickerContainer').setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // Click handler
        this.map.on('click', (e) => {
            this.setMarker([e.latlng.lat, e.latlng.lng]);
            this.updateSelectedText(e.latlng.lat, e.latlng.lng);
        });
    },

    setMarker(coords) {
        if (this.marker) {
            this.marker.setLatLng(coords);
        } else {
            this.marker = L.marker(coords).addTo(this.map);
        }
        document.getElementById('confirmLocationBtn').disabled = false;
    },

    updateSelectedText(lat, lng) {
        document.getElementById('selectedLocationText').textContent =
            `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    },

    search() {
        const query = document.getElementById('mapSearchInput').value;
        if (!query) return;

        // Use Nominatim for geocoding
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const result = data[0];
                    const lat = parseFloat(result.lat);
                    const lon = parseFloat(result.lon);

                    this.map.setView([lat, lon], 13);
                    this.setMarker([lat, lon]);
                    this.updateSelectedText(lat, lon);
                } else {
                    alert('Location not found');
                }
            })
            .catch(err => {
                console.error('Search error:', err);
                alert('Error searching location');
            });
    },

    openForPin(inputId) {
        this.currentTarget = inputId; // Store the ID of the input field
        document.getElementById('mapPickerModal').classList.remove('hidden');

        if (!this.map) this.initMap();

        const input = document.getElementById(inputId);
        if (input && input.value) {
            const coords = input.value.split(',').map(Number);
            if (coords.length === 2 && !isNaN(coords[0])) {
                this.map.setView(coords, 10);
                this.setMarker(coords);
                this.updateSelectedText(coords[0], coords[1]);
            }
        }
    },

    confirm() {
        if (!this.marker || !this.currentTarget) return;

        const latlng = this.marker.getLatLng();
        const coords = [latlng.lat, latlng.lng];

        // Update the input field
        // If currentTarget is one of the predefined ones, use those IDs, otherwise use it as the ID itself
        const targetId = (this.currentTarget === 'yourLocation') ? 'yourCoords' :
            (this.currentTarget === 'theirLocation') ? 'theirCoords' :
                this.currentTarget;

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.value = coords.map(c => c.toFixed(6)).join(', ');
            // Trigger change for state saving if it's a dynamic item
            targetEl.dispatchEvent(new Event('input', { bubbles: true }));
        }

        this.close();
    }
};
