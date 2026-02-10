// Main Application Logic - Fixed Version

const app = {
    wizardSteps: [],

    init() {
        // Initialize state
        state.init();

        // Calculate dynamic steps
        this.recalcWizardSteps();

        // Render initial view
        this.renderStep();
        this.updateProgress();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial preview
        this.updatePreview();

        console.log('[Admin] Initialized');
    },

    recalcWizardSteps() {
        this.wizardSteps = [];

        // Always include Welcome
        const welcomeStep = WIZARD_STEPS.find(s => s.id === 'welcome');
        if (welcomeStep) this.wizardSteps.push(welcomeStep);

        // Always include Page Manager
        this.wizardSteps.push({
            id: 'page-manager',
            title: 'Story Chapters',
            description: 'Select & reorder pages',
            icon: 'dashboard_customize',
            render: () => renderers.renderPageManagerStep()
        });

        // Add steps for each enabled page
        const enabledPages = state.getPages(true);
        enabledPages.forEach(page => {
            // Find a step definition that matches the page ID or type
            const stepDef = WIZARD_STEPS.find(s => s.id === page.id || s.id === page.type);

            if (stepDef) {
                // Clone the step definition but keep the dynamic page info
                this.wizardSteps.push({
                    ...stepDef,
                    id: page.id,
                    title: page.name,
                    icon: page.icon,
                    type: page.type
                });
            } else {
                // Use a generic renderer if no specific step is defined
                this.wizardSteps.push({
                    id: page.id,
                    title: page.name,
                    description: 'Configure content',
                    icon: page.icon,
                    type: page.type,
                    render: () => renderers.renderPageStep(page)
                });
            }
        });

        // Always include Finish
        this.wizardSteps.push({
            id: 'finish',
            title: 'Finish & Share',
            description: 'Export & Share',
            icon: 'rocket_launch',
            render: () => renderers.renderFinishStep()
        });

        // Validate current step bounds
        if (state.currentStep >= this.wizardSteps.length) {
            state.currentStep = 0;
        }
    },

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && e.ctrlKey) this.nextStep();
            if (e.key === 'ArrowLeft' && e.ctrlKey) this.prevStep();
        });

        // Window resize for responsive
        window.addEventListener('resize', utils.debounce(() => {
            this.handleResize();
        }, 250));
    },

    renderStep() {
        const step = this.wizardSteps[state.currentStep];
        const content = document.getElementById('stepContent');

        if (content && step && step.render) {
            content.innerHTML = step.render();

            // If it's the page manager, attach drag listeners
            if (step.id === 'page-manager') {
                this.attachPageManagerListeners();
            }
        }

        // Update header
        const stepTitle = document.getElementById('stepTitle');
        if (stepTitle && step) {
            stepTitle.textContent = step.title;
        }

        // Update buttons
        const btnBack = document.getElementById('btnBack');
        if (btnBack) btnBack.disabled = state.currentStep === 0;

        const btnNext = document.getElementById('btnNext');
        const btnFinish = document.getElementById('btnFinish');

        if (btnNext && btnFinish) {
            if (state.currentStep === this.wizardSteps.length - 1) {
                btnNext.classList.add('hidden');
                btnFinish.classList.remove('hidden');
            } else {
                btnNext.classList.remove('hidden');
                btnFinish.classList.add('hidden');
            }
        }

        // Re-render sidebar to update active state
        this.renderSidebar();
        this.updateProgress();

        // Update preview with latest config
        this.updatePreview();
    },

    renderSidebar() {
        const nav = document.getElementById('sidebarNav');
        if (!nav) return;

        nav.innerHTML = this.wizardSteps.map((step, index) => {
            const isActive = index === state.currentStep;
            const isCompleted = index < state.currentStep;

            return `
                <div class="sidebar-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                     onclick="app.goToStep(${index})">
                    <div class="sidebar-icon">
                        <span class="material-symbols-outlined">${step.icon}</span>
                    </div>
                    <div class="sidebar-text">
                        <div class="sidebar-title">${step.title}</div>
                        <div class="sidebar-desc">${step.description}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateProgress() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressBar && progressText && this.wizardSteps.length > 0) {
            const progress = ((state.currentStep + 1) / this.wizardSteps.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Step ${state.currentStep + 1} of ${this.wizardSteps.length}`;
        }
    },

    nextStep() {
        if (state.currentStep < this.wizardSteps.length - 1) {
            // Run onNext handler if exists
            const currentStep = this.wizardSteps[state.currentStep];
            if (currentStep && currentStep.onNext) {
                currentStep.onNext();
            }

            state.currentStep++;
            this.renderStep();
            this.updatePreview();
        }
    },

    prevStep() {
        if (state.currentStep > 0) {
            state.currentStep--;
            this.renderStep();
            this.updatePreview();
        }
    },

    goToStep(index) {
        if (index >= 0 && index < this.wizardSteps.length) {
            // Save current step data
            const currentStep = this.wizardSteps[state.currentStep];
            if (currentStep && currentStep.onNext) {
                currentStep.onNext();
            }

            state.currentStep = index;
            this.renderStep();
            this.updatePreview();
        }
    },

    togglePage(pageId, enabled) {
        state.togglePage(pageId, enabled);
        this.recalcWizardSteps();
        this.renderStep();
        this.updateProgress();
    },

    attachPageManagerListeners() {
        const list = document.getElementById('pageList');
        if (!list) return;

        let dragEl = null;

        list.addEventListener('dragstart', (e) => {
            if (e.target.draggable) {
                dragEl = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const target = e.target.closest('.page-manager-item');
            if (target && target !== dragEl && target.getAttribute('draggable') === 'true') {
                const rect = target.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                list.insertBefore(dragEl, next ? target.nextSibling : target);
            }
        });

        list.addEventListener('dragend', (e) => {
            if (dragEl) {
                dragEl.classList.remove('dragging');
                dragEl = null;

                // Save new order
                const newOrder = Array.from(list.querySelectorAll('.page-manager-item'))
                    .map(item => item.dataset.id);
                state.reorderPages(newOrder);
                this.recalcWizardSteps();
                this.renderSidebar();
            }
        });
    },

    updatePreview() {
        const previewFrame = document.getElementById('previewIframe');
        if (previewFrame && previewFrame.contentWindow) {
            const config = state.getConfig();

            // Send updated CONFIG to preview iframe
            previewFrame.contentWindow.postMessage({
                type: 'CONFIG_UPDATE',
                config: config
            }, '*');

            // Send current page info to preview if possible
            const step = this.wizardSteps[state.currentStep];
            if (step && step.id) {
                // If it's a page step, use its ID or type
                let pageId = step.id;

                // If the ID isn't page-X, try to find the page ID from PAGE_TYPES
                if (!pageId.startsWith('page-')) {
                    // Search for a page that has this type
                    const pages = state.getPages(false);
                    const foundPage = pages.find(p => p.type === step.id || p.id === step.id);
                    if (foundPage) {
                        pageId = foundPage.id;
                    } else {
                        pageId = 'page-1'; // Default to login
                    }
                }

                setTimeout(() => {
                    if (previewFrame.contentWindow) {
                        previewFrame.contentWindow.postMessage({
                            type: 'NAVIGATE_TO_PAGE',
                            pageId: pageId
                        }, '*');
                    }
                }, 150);
            }
        }
    },

    saveProgress() {
        // Save current step data
        const currentStep = this.wizardSteps[state.currentStep];
        if (currentStep && currentStep.onNext) {
            currentStep.onNext();
        }

        state.saveToFile();
    },

    finishWizard() {
        // Save final step
        const currentStep = this.wizardSteps[state.currentStep];
        if (currentStep && currentStep.onNext) {
            currentStep.onNext();
        }

        state.saveToFile();

        // Show completion
        utils.showNotification('Your Long Distance Love experience is ready!');
    },

    // Preview controls
    showPreview() {
        // Mobile preview modal - show on all screen sizes when clicked
        const modal = document.getElementById('previewModal');
        const iframe = document.getElementById('previewModalIframe');

        // Set iframe src with current config
        iframe.src = '../index.html?t=' + Date.now();
        modal.classList.remove('hidden');

        // Send config after iframe loads
        iframe.onload = () => {
            const step = this.wizardSteps[state.currentStep];
            const pageId = step && step.id && step.id.startsWith('page-') ? step.id : 'page-1';

            setTimeout(() => {
                iframe.contentWindow.postMessage({
                    type: 'CONFIG_UPDATE',
                    config: state.getConfig()
                }, '*');

                // Also navigate to current page in modal
                iframe.contentWindow.postMessage({
                    type: 'NAVIGATE_TO_PAGE',
                    pageId: pageId
                }, '*');
            }, 800);
        };
    },

    closePreview() {
        const modal = document.getElementById('previewModal');
        if (modal) modal.classList.add('hidden');
        // Clear iframe src to stop audio/video
        const iframe = document.getElementById('previewModalIframe');
        if (iframe) iframe.src = '';
    },

    togglePreview() {
        const preview = document.querySelector('.wizard-preview');
        if (!preview) return;

        preview.classList.toggle('hidden');

        // Update content width
        const content = document.querySelector('.wizard-content');
        if (content) {
            if (preview.classList.contains('hidden')) {
                content.style.maxWidth = '900px';
            } else {
                content.style.maxWidth = '640px';
            }
        }
    },

    // Called when preview iframe loads
    onPreviewLoad() {
        console.log('[Admin] Preview iframe loaded');
        // Send current config to preview
        setTimeout(() => {
            this.updatePreview();
        }, 500); // Small delay to ensure iframe is ready
    },

    // Sidebar controls
    toggleSidebar() {
        const sidebar = document.getElementById('wizardSidebar');
        if (sidebar) sidebar.classList.toggle('collapsed');
    },

    openSidebarMobile() {
        const sidebar = document.getElementById('wizardSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.remove('hidden');
    },

    closeSidebarMobile() {
        const sidebar = document.getElementById('wizardSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.add('hidden');
    },

    handleResize() {
        if (window.innerWidth > 768) {
            this.closeSidebarMobile();
        }
    },

    // ============================================
    // DIRECT FIELD UPDATE METHODS (Like Birthday Admin)
    // ============================================

    // Update a field directly (like Birthday Admin)
    updateField(section, field, value) {
        state.updateField(section, field, value);
        utils.showNotification(`${field} updated`, 'success');
    },

    // Update a nested field
    updateNestedField(section, subsection, field, value) {
        state.updateNestedField(section, subsection, field, value);
    },

    // Update an array item at specific index
    updateArrayItem(section, arrayKey, index, field, value) {
        let items;
        if (section === 'root' || section === arrayKey) {
            if (!state.config[arrayKey]) state.config[arrayKey] = [];
            items = state.config[arrayKey];
        } else {
            if (!state.config[section]) state.config[section] = {};
            if (!state.config[section][arrayKey]) state.config[section][arrayKey] = [];
            items = state.config[section][arrayKey];
        }

        if (items && items[index]) {
            items[index][field] = value;
            state.hasChanges = true;
            state.saveToStorage();
            state.broadcastUpdate();
        }

        console.log(`[App] Updated ${section}.${arrayKey}[${index}].${field} = ${value}`);
    },

    // Add new item to array
    addArrayItem(section, arrayKey, defaultItem = {}) {
        if (section === 'root' || section === arrayKey) {
            if (!state.config[arrayKey]) state.config[arrayKey] = [];
            state.config[arrayKey].push(defaultItem);
        } else {
            if (!state.config[section]) state.config[section] = {};
            if (!state.config[section][arrayKey]) state.config[section][arrayKey] = [];
            state.config[section][arrayKey].push(defaultItem);
        }

        state.hasChanges = true;
        state.saveToStorage();
        state.broadcastUpdate();

        // Re-render current step to show new item
        this.renderStep();
        utils.showNotification('Item added!', 'success');
    },

    // Remove item from array
    removeArrayItem(section, arrayKey, index) {
        if (section === 'root' || section === arrayKey) {
            if (state.config[arrayKey]) {
                state.config[arrayKey].splice(index, 1);
            }
        } else if (state.config[section] && state.config[section][arrayKey]) {
            state.config[section][arrayKey].splice(index, 1);
        }

        state.hasChanges = true;
        state.saveToStorage();
        state.broadcastUpdate();

        this.renderStep();
        utils.showNotification('Item removed', 'success');
    },

    // Handle photo upload and update (for single values)
    async uploadPhoto(input, section, field, previewId) {
        const file = input.files[0];
        if (!file) return;

        try {
            utils.showNotification('Uploading photo...');
            const url = await utils.handleMediaUpload(input, previewId);

            if (url) {
                // Update the field with new URL
                state.updateField(section, field, url);
                this.updateImagePreview(previewId, url);
                utils.showNotification('Photo uploaded!', 'success');
            }
        } catch (error) {
            console.error('[Upload] Error:', error);
            utils.showNotification('Upload failed', 'error');
        }
    },

    // Handle nested photo upload
    async uploadNestedPhoto(input, section, subsection, field, previewId) {
        const file = input.files[0];
        if (!file) return;

        try {
            utils.showNotification('Uploading photo...');
            const url = await utils.handleMediaUpload(input, previewId);

            if (url) {
                // Update the field with new URL
                state.updateNestedField(section, subsection, field, url);
                this.updateImagePreview(previewId, url);
                utils.showNotification('Photo uploaded!', 'success');
            }
        } catch (error) {
            console.error('[Upload] Error:', error);
            utils.showNotification('Upload failed', 'error');
        }
    },

    // Update local preview image
    updateImagePreview(inputId, url) {
        const previewId = 'prev_' + inputId;
        const previewEl = document.getElementById(previewId);
        const placeholderEl = document.getElementById('placeholder_' + inputId);

        if (previewEl) {
            previewEl.src = url;
            if (url) {
                previewEl.classList.remove('hidden');
                if (placeholderEl) placeholderEl.classList.add('hidden');
            } else {
                previewEl.classList.add('hidden');
                previewEl.src = '';
                if (placeholderEl) placeholderEl.classList.remove('hidden');
            }
        }
    },

    // Handle photo upload for array items
    async handlePhotoUpload(input, section, arrayKey, index, field, previewId) {
        const file = input.files[0];
        if (!file) return;

        try {
            utils.showNotification('Uploading photo...');
            const url = await utils.handleMediaUpload(input, previewId);

            // Update the field in state with new URL
            this.updateArrayItem(section, arrayKey, index, field, url);

            // Update the image preview
            this.updateImagePreview(previewId, url);

            // Also ensure the text input shows the new URL
            const inputEl = document.getElementById(previewId);
            if (inputEl) {
                inputEl.value = url;
            }

            utils.showNotification('Photo uploaded!', 'success');
        } catch (error) {
            console.error('[Upload] Error:', error);
            utils.showNotification('Upload failed', 'error');
        }
    },



    // Handle audio upload for array items
    async handleAudioUpload(input, index) {
        const file = input.files[0];
        if (!file) return;

        const inputId = `song_src_${index}`;

        try {
            utils.showNotification('Uploading audio...');
            const url = await utils.handleMediaUpload(input, inputId);

            if (url) {
                // Update the URL field
                this.updateArrayItem('sharedWorld', 'playlist', index, 'url', url);
                utils.showNotification('Audio uploaded!', 'success');
            }
        } catch (error) {
            console.error('[Upload] Error:', error);
            utils.showNotification('Upload failed', 'error');
        }
    },

    // Handle video upload for array items
    async handleVideoUpload(input, index) {
        const file = input.files[0];
        if (!file) return;

        const inputId = `video_url_${index}`;

        try {
            // Check file size (e.g. 100MB limit for workers)
            if (file.size > 100 * 1024 * 1024) {
                utils.showNotification('File too large (max 100MB)', 'error');
                return;
            }

            utils.showNotification('Uploading video...');

            // Get duration from local file first (more reliable than remote URL)
            const durationStr = await utils.getVideoDuration(file);
            console.log('[Video] Detected duration:', durationStr);

            // Update duration in state immediately
            this.updateArrayItem('videos', 'videos', index, 'duration', durationStr);
            this.renderStep(); // Update UI to show duration immediately

            // Upload the file
            const url = await utils.handleMediaUpload(input, inputId);

            if (url) {
                // Update the URL field in root videos array
                this.updateArrayItem('videos', 'videos', index, 'url', url);
                utils.showNotification('Video uploaded!', 'success');
            }

            // Sync UI
            this.renderStep();
        } catch (error) {
            console.error('[Upload] Error:', error);
            utils.showNotification('Upload failed', 'error');
        }
    },

    async publishOnline() {
        const btn = document.querySelector('button[onclick="app.publishOnline()"]');
        let originalHTML = '';
        if (btn) {
            originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Syncing...';
        }

        try {
            const config = state.getConfig();
            // Use recipient name for ID if available
            const recipientName = (config.metadata?.customerName || '').trim();
            let id;
            if (recipientName) {
                // Convert name to URL-friendly format
                id = recipientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            } else {
                // Generate a unique ID based on timestamp + random string
                const timestamp = Date.now().toString(36);
                const randomStr = Math.random().toString(36).substring(2, 8);
                id = `${timestamp}-${randomStr}`;
            }

            // Adjust this URL to your GitHub Pages URL
            const siteUrl = `https://detectivecrewze.github.io/ldr-pages/?to=${encodeURIComponent(id)}`;

            const response = await fetch('https://valentine-upload.aldoramadhan16.workers.dev/save-config?id=' + encodeURIComponent(id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                utils.showNotification('✨ Site is now live!', 'success');

                // Show Result UI
                const resultDiv = document.getElementById('publishResult');
                const shareInput = document.getElementById('shareableLink');
                const viewBtn = document.getElementById('viewLiveBtn');
                const qrContainer = document.getElementById('qrcode');

                if (resultDiv) resultDiv.classList.remove('hidden');
                if (shareInput) shareInput.value = siteUrl;
                if (viewBtn) viewBtn.href = siteUrl;

                // Generate QR
                if (qrContainer && typeof QRCode !== 'undefined') {
                    qrContainer.innerHTML = '';
                    new QRCode(qrContainer, {
                        text: siteUrl,
                        width: 120,
                        height: 120,
                        colorDark: "#059669", // Emerald 600
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                }

                if (btn) {
                    btn.innerHTML = '<span class="material-symbols-outlined">verified</span> Ready to Share';
                    btn.classList.add('!bg-emerald-100', '!text-emerald-700', 'border-emerald-200');
                }
            } else {
                throw new Error('Upload failed');
            }
        } catch (e) {
            console.error(e);
            utils.showNotification('Failed to publish. Check your connection.', 'error');
            if (btn) {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }
        }
    },

    copyLink() {
        const input = document.getElementById('shareableLink');
        if (input) {
            input.select();
            input.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(input.value);
            utils.showNotification('Link copied to clipboard!', 'success');
        }
    },

    downloadQR() {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;
        const img = qrContainer.querySelector('img');
        if (img) {
            const a = document.createElement('a');
            a.href = img.src;
            a.download = 'ldr-qr.png';
            a.click();
        }
    },

    downloadDataJS() {
        try {
            const config = state.getConfig();
            const fileContent = `const CONFIG = ${JSON.stringify(config, null, 4)};`;
            const blob = new Blob([fileContent], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            utils.showNotification('data.js downloaded!', 'success');
        } catch (e) {
            console.error('Download failed:', e);
            utils.showNotification('Failed to download data.js', 'error');
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
