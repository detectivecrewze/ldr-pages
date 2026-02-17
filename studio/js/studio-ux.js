/**
 * LDR Studio UX - The "Canva Magic" Layer
 */

const EditorUX = {
    selectedElement: null,

    init() {
        console.log('[UX] Initializing Studio UX...');
        this.setupTabs();
        this.setupToolbars();
        this.setupWindowEvents();
        this.setupViewportControls();

        // Show Welcome Wizard for first-time users
        if (!localStorage.getItem('ldr_wizard_completed')) {
            this.showWelcomeWizard();
        }
    },

    setupViewportControls() {
        console.log('[UX] Setting up Viewport Controls...');
        const viewport = document.querySelector('.viewport-wrapper');
        const bezel = document.querySelector('.device-bezel');
        const sensors = document.querySelector('.device-sensors');
        const zoomValue = document.querySelector('.zoom-value');

        this.currentZoom = 0.7; // Default 70%

        const applyZoom = () => {
            if (!viewport) return;
            viewport.style.transform = `scale(${this.currentZoom})`;
            if (zoomValue) zoomValue.textContent = Math.round(this.currentZoom * 100) + '%';
        };

        // Zoom Buttons
        const zoomInBtn = document.getElementById('btn-zoom-in');
        const zoomOutBtn = document.getElementById('btn-zoom-out');

        if (zoomInBtn) zoomInBtn.onclick = () => {
            this.currentZoom = Math.min(this.currentZoom + 0.1, 1.5);
            applyZoom();
        };

        if (zoomOutBtn) zoomOutBtn.onclick = () => {
            this.currentZoom = Math.max(this.currentZoom - 0.1, 0.2);
            applyZoom();
        };

        // Device Toggles
        const mobileBtn = document.getElementById('btn-device-mobile');
        const desktopBtn = document.getElementById('btn-device-desktop');

        if (mobileBtn) {
            mobileBtn.onclick = () => {
                mobileBtn.classList.add('active');
                if (desktopBtn) desktopBtn.classList.remove('active');

                // Phone Frame
                viewport.style.width = '375px';
                viewport.style.height = '780px';
                viewport.style.borderRadius = '54px';
                viewport.style.borderWidth = '12px';
                if (bezel) bezel.style.borderRadius = '53px';
                if (sensors) sensors.style.display = 'flex';

                this.currentZoom = 0.7;
                applyZoom();
            };
        }

        if (desktopBtn) {
            desktopBtn.onclick = () => {
                desktopBtn.classList.add('active');
                if (mobileBtn) mobileBtn.classList.remove('active');

                // Desktop Frame
                viewport.style.width = '90%';
                viewport.style.maxWidth = '1000px';
                viewport.style.height = '600px';
                viewport.style.borderRadius = '24px';
                viewport.style.borderWidth = '8px';
                if (bezel) bezel.style.borderRadius = '22px';
                if (sensors) sensors.style.display = 'none';

                this.currentZoom = 0.6;
                applyZoom();
            };
        }

        // Initial apply
        applyZoom();
    },

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

                tab.classList.add('active');
                document.getElementById(`pane-${target}`).classList.remove('hidden');
            });
        });
    },

    setupToolbars() {
        // Font Selection
        const fontSelector = document.getElementById('fontSelector');
        if (fontSelector) {
            fontSelector.addEventListener('change', (e) => {
                if (this.selectedElement) {
                    this.updateElementStyle('fontFamily', e.target.value);
                }
            });
        }
    },

    setupWindowEvents() {
        window.addEventListener('resize', () => {
            if (this.selectedElement) {
                this.updateSelectionOverlay(this.selectedElement);
            }
        });
    },

    // Injects the interaction engine into the preview iframe
    injectStudioEngine(frame) {
        const frameDoc = frame.contentDocument || frame.contentWindow.document;
        if (!frameDoc) return;

        // 1. Inject Styles
        const style = frameDoc.createElement('style');
        style.textContent = `
            [contenteditable="true"]:hover {
                outline: 2px dashed #f43f5e !important;
                outline-offset: 2px !important;
                cursor: text;
            }
            [contenteditable="true"]:focus {
                outline: 2px solid #f43f5e !important;
                background: rgba(244, 63, 94, 0.05);
            }
            img:hover {
                outline: 2px dashed #f43f5e !important;
                outline-offset: 2px !important;
                cursor: pointer;
            }
            .studio-selected {
                outline: 2px solid #f43f5e !important;
            }
        `;
        frameDoc.head.appendChild(style);

        // 2. Inject Click Handler
        frameDoc.addEventListener('click', (e) => {
            const target = e.target;

            // Check if editable
            const isText = target.hasAttribute('contenteditable');
            const isImg = target.tagName === 'IMG';

            if (isText || isImg) {
                e.preventDefault();
                e.stopPropagation();

                // Send to parent
                window.parent.postMessage({
                    type: 'ELEMENT_SELECTED',
                    elementType: isText ? 'text' : 'image',
                    id: target.id,
                    path: target.dataset.path, // We'll need to set these in the main app
                    rect: target.getBoundingClientRect()
                }, '*');
            }
        });
    },

    updateSelectionOverlay(rect) {
        const overlay = document.getElementById('selection-overlay');
        const frame = document.getElementById('preview-frame');
        if (!overlay || !frame) return;

        const frameRect = frame.getBoundingClientRect();

        overlay.classList.remove('hidden');
        overlay.style.width = `${rect.width + 8}px`;
        overlay.style.height = `${rect.height + 8}px`;
        overlay.style.top = `${rect.top - 4}px`;
        overlay.style.left = `${rect.left - 4}px`;
    },

    showToolbar(type) {
        document.getElementById('text-tools').classList.add('hidden');
        document.getElementById('image-tools').classList.add('hidden');

        if (type === 'text') {
            document.getElementById('text-tools').classList.remove('hidden');
        } else if (type === 'image') {
            document.getElementById('image-tools').classList.remove('hidden');
        }
    },

    showNotification(message, type = 'success') {
        const toast = document.getElementById('notification');
        const icon = document.getElementById('notificationIcon');
        const text = document.getElementById('notificationText');

        if (!toast || !text) return;

        text.textContent = message;
        icon.textContent = type === 'success' ? 'check_circle' : 'info';
        icon.className = `material-symbols-outlined ${type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`;

        toast.style.opacity = '1';
        toast.style.pointerEvents = 'auto';
        toast.classList.add('animate-slideUp');

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.pointerEvents = 'none';
            toast.classList.remove('animate-slideUp');
        }, 3000);
    },

    showWelcomeWizard() {
        const wizardHTML = `
            <div id="welcomeWizardOverlay">
                <div class="ww-backdrop"></div>
                <div class="ww-card">
                    <div class="ww-steps-indicator">
                        <div class="ww-step-dot active" data-step="1"></div>
                        <div class="ww-step-dot" data-step="2"></div>
                        <div class="ww-step-dot" data-step="3"></div>
                    </div>

                    <div class="ww-step active" data-step="1">
                        <div class="ww-icon">✨</div>
                        <h2>LDR Studio</h2>
                        <p>Welcome! We've rebuilt the studio to be more visual and intuitive. Ready to design your story?</p>
                        <button class="btn-primary w-full mt-4 ww-next" style="width: 100%; padding: 12px; border-radius: 12px; font-weight: 700;">Get Started</button>
                    </div>

                    <div class="ww-step" data-step="2">
                        <div class="ww-icon">🎨</div>
                        <h2>Visual Editing</h2>
                        <p>Click directly on <strong>text</strong> or <strong>photos</strong> in the preview to edit them instantly. Just like Canva!</p>
                        <div class="ww-features mt-4" style="background: #f8fafc; padding: 16px; border-radius: 14px; text-align: left; margin: 15px 0;">
                            <div class="ww-feature" style="display: flex; align-items: center; gap: 10px; font-size: 13px; margin-bottom: 8px;">
                                <span class="material-symbols-outlined" style="color: #f43f5e">edit</span>
                                <span>Direct text editing</span>
                            </div>
                            <div class="ww-feature" style="display: flex; align-items: center; gap: 10px; font-size: 13px;">
                                <span class="material-symbols-outlined" style="color: #f43f5e">image</span>
                                <span>One-click photo swapping</span>
                            </div>
                        </div>
                        <button class="btn-primary w-full mt-6 ww-next" style="width: 100%; padding: 12px; border-radius: 12px; font-weight: 700;">Awesome!</button>
                    </div>

                    <div class="ww-step" data-step="3">
                        <div class="ww-icon">🚀</div>
                        <h2>Ready to Launch?</h2>
                        <p>Changes are saved locally as you work. Use the <strong>Download</strong> button to get your updated data.js file.</p>
                        <button class="btn-primary w-full mt-6 ww-finish" style="width: 100%; padding: 12px; border-radius: 12px; font-weight: 700;">Start Designing</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', wizardHTML);

        let currentStep = 1;
        const overlay = document.getElementById('welcomeWizardOverlay');
        const nextBtns = overlay.querySelectorAll('.ww-next');
        const finishBtn = overlay.querySelector('.ww-finish');

        const goToStep = (step) => {
            overlay.querySelectorAll('.ww-step').forEach(s => s.classList.remove('active'));
            overlay.querySelectorAll('.ww-step-dot').forEach(d => d.classList.remove('active'));

            overlay.querySelector(`.ww-step[data-step="${step}"]`).classList.add('active');
            overlay.querySelector(`.ww-step-dot[data-step="${step}"]`).classList.add('active');
            currentStep = step;
        };

        nextBtns.forEach(btn => {
            btn.onclick = () => goToStep(currentStep + 1);
        });

        finishBtn.onclick = () => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                overlay.remove();
                localStorage.setItem('ldr_wizard_completed', 'true');
                this.showNotification('You\'re all set! Enjoy Designing. ✨');
            }, 300);
        };
    },

    // ============================================================
    // MEDIA UPLOAD UTILITIES (VALENTINE STYLE)
    // ============================================================

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
                        else reject(new Error('Failed to create blob from canvas'));
                    }, 'image/jpeg', quality);
                };
                img.onerror = () => reject(new Error('Failed to load image for compression'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file for compression'));
            reader.readAsDataURL(file);
        });
    },

    async handleMediaUpload(input, onComplete, options = {}) {
        const file = input.files[0];
        if (!file) return;

        try {
            this.showNotification('Mengunggah file...', 'info');
            let fileToUpload = file;

            // 1. Optimize Images
            if (file.type.startsWith('image/')) {
                try {
                    console.log('[UX] Compressing image...');
                    const compressedBlob = await this.compressImage(file);
                    fileToUpload = new File([compressedBlob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                } catch (err) {
                    console.warn('[UX] Compression failed, using original:', err);
                }
            }

            // 2. Prepare Form Data
            const formData = new FormData();
            formData.append('file', fileToUpload);

            // 3. Upload to Cloudflare Worker
            const WORKER_URL = 'https://valentine-upload.aldoramadhan16.workers.dev/upload';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min

            try {
                const response = await fetch(WORKER_URL, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`Upload failed (${response.status})`);

                const result = await response.json();
                if (!result.success) throw new Error(result.error || 'Upload failed');

                console.log('[UX] Upload successful:', result.url);
                this.showNotification('File berhasil diunggah! ✨');

                if (onComplete) onComplete(result.url);

            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') throw new Error('Upload timed out.');
                throw error;
            }

        } catch (error) {
            console.error('[UX] Upload failed:', error);
            this.showNotification('Gagal mengunggah: ' + error.message, 'error');
        }
    }
};

window.EditorUX = EditorUX;
window.showNotification = EditorUX.showNotification.bind(EditorUX);
EditorUX.init();
