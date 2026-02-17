// Utility Functions

const utils = {
    // Generate timezone options HTML
    getTimezoneOptions(selectedValue) {
        return TIMEZONES.map(tz =>
            `<option value="${tz.value}" ${tz.value === selectedValue ? 'selected' : ''}>${tz.label}</option>`
        ).join('');
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const icon = document.getElementById('notificationIcon');
        const text = document.getElementById('notificationText');
        if (!notification || !text) return;

        // Apply type styles
        icon.textContent = type === 'success' ? 'check_circle' : 'info';
        icon.className = `material-symbols-outlined ${type === 'success' ? 'text-emerald-400' : 'text-amber-400'}`;
        text.textContent = message;

        notification.classList.remove('opacity-0', 'pointer-events-none');
        notification.classList.add('translate-y-2');

        setTimeout(() => {
            notification.classList.add('opacity-0', 'pointer-events-none');
            notification.classList.remove('translate-y-2');
        }, 3000);
    },

    // Download JSON file
    downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Merge objects deeply
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    },

    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Truncate text
    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Get file extension
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    },

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Calculate reading time
    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Convert degrees to radians
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    // Calculate distance between two coordinates (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    // Compress image before upload
    async compressImage(file, maxWidth = 1200, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas to Blob failed'));
                    }, 'image/jpeg', quality);
                };
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('File read failed'));
            reader.readAsDataURL(file);
        });
    },

    // Extract GPS coordinates and date from photo metadata
    async extractExifData(file) {
        return new Promise((resolve) => {
            if (typeof EXIF === 'undefined' || !file.type.startsWith('image/')) {
                resolve(null);
                return;
            }
            EXIF.getData(file, function () {
                try {
                    const exifData = {};
                    const latDMS = EXIF.getTag(this, 'GPSLatitude');
                    const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
                    const lngDMS = EXIF.getTag(this, 'GPSLongitude');
                    const lngRef = EXIF.getTag(this, 'GPSLongitudeRef');

                    if (latDMS && lngDMS) {
                        let lat = utils.dmsToDecimal(latDMS[0], latDMS[1], latDMS[2]);
                        let lng = utils.dmsToDecimal(lngDMS[0], lngDMS[1], lngDMS[2]);
                        if (latRef === 'S') lat = -lat;
                        if (lngRef === 'W') lng = -lng;
                        exifData.lat = lat;
                        exifData.lng = lng;
                    }

                    const dateOriginal = EXIF.getTag(this, 'DateTimeOriginal');
                    if (dateOriginal) {
                        const parts = dateOriginal.split(' ')[0].split(':');
                        if (parts.length === 3) {
                            exifData.date = `${parts[0]}-${parts[1]}-${parts[2]}`;
                        }
                    }
                    resolve(Object.keys(exifData).length > 0 ? exifData : null);
                } catch (e) {
                    console.error('[EXIF] Error:', e);
                    resolve(null);
                }
            });
        });
    },

    dmsToDecimal(degrees, minutes, seconds) {
        return degrees + (minutes / 60) + (seconds / 3600);
    },

    // Update preview image helper
    updatePreview(inputId, url) {
        const previewId = 'prev_' + inputId;
        const previewEl = document.getElementById(previewId);
        if (previewEl) {
            previewEl.src = url;
            if (url) {
                previewEl.classList.remove('hidden');
            } else {
                previewEl.classList.add('hidden');
            }
        }
    },

    // Handle media upload to Cloudflare via Worker
    async handleMediaUpload(input, targetInputId) {
        const file = input.files[0];
        if (!file) return;

        const targetInput = document.getElementById(targetInputId);
        const originalValue = targetInput ? targetInput.value : '';

        try {
            if (targetInput) {
                targetInput.value = 'Uploading...';
                targetInput.disabled = true;
            }

            // Extract EXIF data before compression (compression might strip it)
            let exifData = null;
            if (file.type.startsWith('image/')) {
                exifData = await this.extractExifData(file);
                console.log('[Upload] EXIF Data:', exifData);
            }

            let fileToUpload = file;
            if (file.type.startsWith('image/')) {
                const compressedBlob = await this.compressImage(file, 1200, 0.85);
                fileToUpload = new File([compressedBlob], file.name, { type: 'image/jpeg' });
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);

            const response = await fetch('https://valentine-upload.aldoramadhan16.workers.dev/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload server error');
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Upload failed');

            if (targetInput) {
                targetInput.value = result.url;
                targetInput.disabled = false;
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Update preview
            const previewId = 'prev_' + targetInputId;
            const previewEl = document.getElementById(previewId);
            if (previewEl) {
                previewEl.src = result.url;
                previewEl.classList.remove('hidden');
            }

            // Auto-fill from EXIF if available
            if (exifData) {
                // Handle date
                const dateId = targetInputId.replace('photo', 'date').replace('image', 'date');
                const dateInput = document.getElementById(dateId);
                if (dateInput && (!dateInput.value || dateInput.value === new Date().toISOString().split('T')[0])) {
                    dateInput.value = exifData.date;
                    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
                }

                // Handle coordinates (for Map Pins)
                if (exifData.lat && exifData.lng) {
                    const coordsId = targetInputId.replace('photo', 'coords');
                    const coordsInput = document.getElementById(coordsId);
                    if (coordsInput) {
                        coordsInput.value = `${exifData.lat.toFixed(6)}, ${exifData.lng.toFixed(6)}`;
                        coordsInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            }

            this.showNotification('File uploaded successfully!');
            return result.url;
        } catch (error) {
            console.error('[Upload] Error:', error);
            this.showNotification('Upload failed: ' + error.message, 'error');
            if (targetInput) {
                targetInput.value = originalValue;
                targetInput.disabled = false;
            }
        }
    },

    // Get video duration in format M:SS
    async getVideoDuration(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const duration = video.duration;
                window.URL.revokeObjectURL(video.src);

                if (isNaN(duration) || duration === Infinity || duration < 0.1) {
                    console.warn('[Video] Invalid duration detected:', duration);
                    resolve('0:00');
                    return;
                }

                const seconds = Math.floor(duration);
                const m = Math.floor(seconds / 60);
                const s = seconds % 60;
                resolve(`${m}:${s.toString().padStart(2, '0')}`);
            };
            video.onerror = (e) => {
                console.error('[Video] Metadata load error:', e);
                window.URL.revokeObjectURL(video.src);
                resolve('0:00');
            };
            video.src = URL.createObjectURL(file);
        });
    }
};
