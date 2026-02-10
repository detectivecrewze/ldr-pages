// State Management - Fixed Version

const state = {
    currentStep: 0,
    config: null,
    originalConfig: null,
    hasChanges: false,
    dataJsHash: null,

    init() {
        // Check URL params for force reload
        const urlParams = new URLSearchParams(window.location.search);
        const forceReload = urlParams.get('reload') === '1';

        // Source of truth baseline
        const baselineConfig = typeof window.CONFIG !== 'undefined' ? window.CONFIG :
            (typeof CONFIG !== 'undefined' ? CONFIG :
                (typeof DEFAULT_CONFIG !== 'undefined' ? DEFAULT_CONFIG : this.createDefaultConfig()));

        const currentHash = this.hashConfig(baselineConfig);
        const savedHash = localStorage.getItem('ldr_config_hash');
        const savedConfigJson = localStorage.getItem('ldr_config');

        if (forceReload || !savedConfigJson) {
            console.log('[State] Initializing fresh from baseline');
            this.config = utils.deepClone(baselineConfig);
            this.dataJsHash = currentHash;
            localStorage.setItem('ldr_config_hash', currentHash);
            this.saveToStorage();
        } else {
            try {
                const savedConfig = JSON.parse(savedConfigJson);
                // Merge baseline with saved user edits
                // This ensures new fields from updates are added, but user data is kept
                this.config = utils.deepMerge(utils.deepClone(baselineConfig), savedConfig);
                this.dataJsHash = currentHash;

                if (currentHash !== savedHash) {
                    console.log('[State] Baseline updated, merged with local changes');
                    localStorage.setItem('ldr_config_hash', currentHash);
                    this.saveToStorage();
                } else {
                    console.log('[State] Loaded successfully from localStorage');
                }
            } catch (e) {
                console.error('[State] Error parsing saved config, falling back to baseline:', e);
                this.config = utils.deepClone(baselineConfig);
            }
        }

        this.originalConfig = utils.deepClone(this.config);
        this.ensureDefaults();
        this.broadcastUpdate();
    },

    // Create simple hash of config to detect changes
    hashConfig(config) {
        if (!config) return '0';
        const str = JSON.stringify(config);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },

    createDefaultConfig() {
        return {
            theme: {
                appName: 'Long Distance Love',
                primary: '#f43f5e',
                secondary: '#ec4899',
                background: 'retro'
            },
            login: {
                password: 'forever',
                quote: 'Distance means so little when someone means so much',
                relationshipStartDate: '2023-01-15',
                errorMessage: "That's not our special word... try again!",
                photoSrc: ''
            },
            dashboard: {
                yourLocation: {
                    name: 'Jakarta',
                    coordinates: [-6.2088, 106.8456],
                    timezone: 'Asia/Jakarta'
                },
                theirLocation: {
                    name: 'New York',
                    coordinates: [40.7128, -74.0060],
                    timezone: 'America/New_York'
                },
                nextReunionDate: '2026-03-15T00:00:00',
                stats: {
                    daysTogether: 420,
                    videoCallHours: 847,
                    messagesExchanged: '12.5K'
                },
                moods: {
                    you: { emoji: '😊', text: 'Happy' },
                    them: { emoji: '💻', text: 'Working' }
                }
            },
            journeyMap: {
                milestones: [
                    { date: '2023-01-15', event: 'First Met', location: 'Bali', icon: 'favorite', image: '' },
                    { date: '2023-06-20', event: 'First Trip', location: 'Japan', icon: 'flight', image: '' },
                    { date: '2023-12-25', event: 'Christmas Together', location: 'New York', icon: 'star', image: '' }
                ],
                pins: [
                    {
                        coords: [-6.174998, 106.826935],
                        label: 'The First Date',
                        photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
                        note: 'Where our story began.',
                        date: '2023-01-20'
                    },
                    {
                        coords: [-6.405206, 106.813331],
                        label: 'On the Lake',
                        photo: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
                        note: 'Lost in the blue with you.',
                        date: '2023-12-25'
                    },
                    {
                        coords: [35.6762, 139.6503],
                        label: 'Tokyo Dream',
                        photo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400',
                        note: 'Our future home?',
                        date: '2024-05-15'
                    }
                ],
                dreamDestinations: []
            },
            sharedWorld: {
                playlist: [
                    { title: 'Hey There Delilah', artist: "Plain White T's", url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                    { title: 'Perfect', artist: 'Ed Sheeran', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
                    { title: 'Just the Way You Are', artist: 'Bruno Mars', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
                    { title: 'All of Me', artist: 'John Legend', url: '' }
                ],
                dateIdeas: [
                    { icon: 'movie', title: 'Movie Night', description: 'Watch "Up" together on Discord' },
                    { icon: 'restaurant', title: 'Virtual Dinner', description: 'Order the same food and eat while calling' },
                    { icon: 'sports_esports', title: 'Game Session', description: 'Play Stardew Valley together' }
                ],
                photos: [
                    { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500', caption: 'Our first sunset' },
                    { url: 'https://images.unsplash.com/photo-1529619768328-e37af76c6fe5?w=500', caption: 'Silly faces in the park' },
                    { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500', caption: 'Missing you everyday' }
                ]
            },
            videos: [
                { title: 'Surprise Visit', duration: '2:15', url: '', description: 'When I showed up at your door!' },
                { title: 'Anniversary Vlog', duration: '10:30', url: '', description: 'Recap of our year together' }
            ],
            promise: {
                letterTitle: 'A Letter Across the Miles',
                letterContent: 'My Dearest,\n\nEven though we are separated by thousands of kilometers...',
                signature: 'With all my love',
                initials: 'A + B',
                promises: ['Daily calls no matter how busy'],
                endLDRDate: '',
                polaroidSrc: ''
            },
            quiz: {
                title: 'Relationship Test',
                description: 'How well do you know us?',
                questions: [
                    {
                        question: 'Where did we first meet?',
                        answers: ['Coffee Shop', 'Library', 'Online', 'Through Friends'],
                        correct: 0
                    },
                    {
                        question: 'What is my favorite food?',
                        answers: ['Pizza', 'Sushi', 'Burgers', 'Pasta'],
                        correct: 1
                    }
                ]
            },
            bucketList: {
                food: [
                    { text: "Eat at that famous Ramen place in Shibuya", done: false, priority: true },
                    { text: "Try the best pizza in New York City", done: false, priority: false },
                    { text: "Cook our first meal together in our new kitchen", done: false, priority: true }
                ],
                adventure: [
                    { text: "Go to the beach and watch the sunrise together", done: false, priority: true },
                    { text: "Hike to a waterfall and take a photo together", done: false, priority: false },
                    { text: "Take a spontaneous road trip", done: false, priority: true }
                ],
                daily: [
                    { text: "Grocery shopping together on weekends", done: false, priority: false },
                    { text: "Build a blanket fort and watch movies", done: false, priority: true },
                    { text: "Plant a small garden or keep houseplants", done: false, priority: false }
                ],
                special: [
                    { text: "Write love letters to each other and hide them", done: false, priority: true },
                    { text: "Create a photo album of our LDR journey", done: false, priority: false }
                ]
            },
            pageConfig: utils.deepClone(DEFAULT_PAGE_CONFIG)
        };
    },

    saveToStorage() {
        localStorage.setItem('ldr_config', JSON.stringify(this.config));
    },

    clearStorage() {
        localStorage.removeItem('ldr_config');
        window.location.reload();
    },

    ensureDefaults() {
        // Make sure all main sections exist
        const sections = ['theme', 'login', 'dashboard', 'journeyMap', 'sharedWorld', 'promise', 'videos', 'quiz', 'bucketList'];
        sections.forEach(section => {
            if (!this.config[section]) {
                this.config[section] = {};
            }
        });

        // Ensure bucketList has data
        if (!this.config.bucketList || !this.config.bucketList.food) {
            this.config.bucketList = {
                food: [
                    { text: "Eat at that famous Ramen place in Shibuya", done: false, priority: true },
                    { text: "Try the best pizza in New York City", done: false, priority: false },
                    { text: "Cook our first meal together in our new kitchen", done: false, priority: true }
                ],
                adventure: [
                    { text: "Go to the beach and watch the sunrise together", done: false, priority: true },
                    { text: "Hike to a waterfall and take a photo together", done: false, priority: false },
                    { text: "Take a spontaneous road trip", done: false, priority: true }
                ],
                daily: [
                    { text: "Grocery shopping together on weekends", done: false, priority: false },
                    { text: "Build a blanket fort and watch movies", done: false, priority: true },
                    { text: "Plant a small garden or keep houseplants", done: false, priority: false }
                ],
                special: [
                    { text: "Write love letters to each other and hide them", done: false, priority: true },
                    { text: "Create a photo album of our LDR journey", done: false, priority: false }
                ]
            };
        }

        // Ensure pageConfig exists
        if (!this.config.pageConfig) {
            this.config.pageConfig = utils.deepClone(DEFAULT_PAGE_CONFIG);
        }
    },

    // Update a top-level config section
    updateConfig(section, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {
            this.config[section] = { ...this.config[section], ...data };
        } else {
            this.config[section] = data;
        }
        this.hasChanges = true;
        this.saveToStorage();
        this.broadcastUpdate();
        console.log(`[State] Updated ${section}:`, data);
    },

    // Update a nested config property
    updateNestedConfig(section, subsection, data) {
        if (!this.config[section]) this.config[section] = {};

        if (typeof data === 'object' && !Array.isArray(data)) {
            this.config[section][subsection] = {
                ...(this.config[section][subsection] || {}),
                ...data
            };
        } else {
            this.config[section][subsection] = data;
        }

        this.hasChanges = true;
        this.saveToStorage();
        this.broadcastUpdate();
    },

    // Direct field update - for simple inputs
    updateField(section, field, value) {
        if (!this.config[section]) this.config[section] = {};
        this.config[section][field] = value;
        this.hasChanges = true;
        this.saveToStorage();
        this.broadcastUpdate();
    },

    // Direct nested field update
    updateNestedField(section, subsection, field, value) {
        if (!this.config[section]) this.config[section] = {};
        if (!this.config[section][subsection]) this.config[section][subsection] = {};
        this.config[section][subsection][field] = value;
        this.hasChanges = true;
        this.saveToStorage();
        this.broadcastUpdate();
    },

    getPages(enabledOnly = true) {
        let pagesObj = (this.config.pageConfig && this.config.pageConfig.pages) ? this.config.pageConfig.pages : this.config.pages;
        if (!pagesObj) return [];

        const pages = Object.values(pagesObj)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        return enabledOnly ? pages.filter(p => p.enabled) : pages;
    },

    togglePage(pageId, enabled) {
        let pagesObj = (this.config.pageConfig && this.config.pageConfig.pages) ? this.config.pageConfig.pages : this.config.pages;
        if (pagesObj && pagesObj[pageId]) {
            pagesObj[pageId].enabled = enabled;
            this.hasChanges = true;
            this.saveToStorage();
            this.broadcastUpdate();
        }
    },

    reorderPages(pageOrder) {
        let pagesObj = (this.config.pageConfig && this.config.pageConfig.pages) ? this.config.pageConfig.pages : this.config.pages;
        if (pagesObj) {
            pageOrder.forEach((id, index) => {
                if (pagesObj[id]) {
                    pagesObj[id].order = index + 1;
                }
            });
            this.hasChanges = true;
            this.saveToStorage();
            this.broadcastUpdate();
        }
    },

    applyPagePreset(presetId) {
        const preset = PAGE_PRESETS[presetId];
        if (!preset || !this.config.pageConfig) return;

        // Reset all to disabled except required
        Object.keys(this.config.pageConfig.pages).forEach(id => {
            const page = this.config.pageConfig.pages[id];
            page.enabled = page.required || preset.pages.includes(id);
        });

        // Set order based on preset
        preset.pages.forEach((id, index) => {
            if (this.config.pageConfig.pages[id]) {
                this.config.pageConfig.pages[id].order = index + 1;
            }
        });

        this.hasChanges = true;
        this.saveToStorage();
        this.broadcastUpdate();

        // Trigger UI refresh
        if (window.app) {
            window.app.recalcWizardSteps();
            window.app.renderStep();
        }
    },

    // Save array items from DOM to state
    saveArrayItems(itemType, section) {
        const items = [];
        const container = document.getElementById(itemType + 'List');
        if (!container) return;

        const itemElements = container.querySelectorAll('.array-item, .dynamic-item');

        itemElements.forEach(el => {
            const inputs = el.querySelectorAll('input, select, textarea');
            const item = {};

            inputs.forEach(input => {
                const key = input.dataset.field;
                if (key) {
                    if (key.startsWith('answer') && !isNaN(key.substring(6))) {
                        if (!item.answers) item.answers = [];
                        const ansIndex = parseInt(key.substring(6));
                        item.answers[ansIndex] = input.value;
                    } else if (input.dataset.type === 'coords') {
                        item[key] = input.value.split(',').map(v => parseFloat(v.trim()));
                    } else if (input.type === 'checkbox') {
                        item[key] = input.checked;
                    } else if (input.type === 'number') {
                        item[key] = parseInt(input.value) || 0;
                    } else {
                        item[key] = input.value;
                    }
                }
            });

            if (Object.keys(item).length > 0) {
                items.push(item);
            }
        });

        // Map item type to config key
        const keyMap = {
            'milestones': 'milestones',
            'pins': 'pins',
            'virtualTrips': 'virtualTrips',
            'dreamDestinations': 'dreamDestinations',
            'playlist': 'playlist',
            'dateIdeas': 'dateIdeas',
            'photos': 'photos',
            'promises': 'promises',
            'videos': 'videos',
            'questions': 'questions',
            'food': 'food',
            'adventure': 'adventure',
            'daily': 'daily',
            'special': 'special'
        };

        const configKey = keyMap[itemType];
        if (configKey) {
            let finalItems = items;

            // Handle array of strings (e.g., promises)
            if (configKey === 'promises') {
                finalItems = items.map(i => i.text).filter(v => v);
            }

            // Handle special case for quiz questions or root-level keys
            if (section === 'quiz') {
                if (!this.config[section]) this.config[section] = {};
                this.config[section][configKey] = finalItems;
            } else if (section === 'root' || section === configKey) {
                this.config[configKey] = finalItems;
            } else if (this.config[section]) {
                this.config[section][configKey] = finalItems;
            } else {
                console.warn(`[State] Section ${section} not found`);
                return;
            }
            this.hasChanges = true;
            this.saveToStorage();
            this.broadcastUpdate();
            console.log(`[State] Saved ${itemType}:`, finalItems.length, 'items');
        }
    },

    // Special handler for nested messenger chats
    saveMessengerChats() {
        const chats = [];
        const container = document.getElementById('chatsList');
        if (!container) return;

        const dayElements = container.querySelectorAll('.dynamic-item');
        dayElements.forEach(dayEl => {
            const dateInput = dayEl.querySelector('[data-field="date"]');
            const day = {
                date: dateInput ? dateInput.value : '',
                messages: []
            };

            const msgElements = dayEl.querySelectorAll('.message-item');
            msgElements.forEach(msgEl => {
                const item = {};
                const inputs = msgEl.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    const key = input.dataset.field;
                    if (key) item[key] = input.value;
                });
                if (Object.keys(item).length > 0) {
                    day.messages.push(item);
                }
            });

            chats.push(day);
        });

        if (!this.config.messenger) this.config.messenger = {};
        this.config.messenger.chats = chats;

        this.hasChanges = true;
        this.saveToStorage();
        this.broadcastUpdate();
        console.log('[State] Saved messenger chats:', chats.length, 'days');
    },

    broadcastUpdate() {
        console.log('[State] Broadcasting update:', this.config);

        // Update Admin UI
        if (this.config.theme?.appName) {
            const brandEl = document.getElementById('adminBrandName');
            if (brandEl) brandEl.textContent = this.config.theme.appName + ' Admin';
        }

        // Update preview iframe (Desktop)
        const previewFrame = document.getElementById('previewIframe');
        if (previewFrame && previewFrame.contentWindow) {
            previewFrame.contentWindow.postMessage({
                type: 'CONFIG_UPDATE',
                config: this.config
            }, '*');
        }

        // Update preview iframe (Mobile Modal)
        const mobilePreviewFrame = document.getElementById('previewModalIframe');
        if (mobilePreviewFrame && mobilePreviewFrame.contentWindow) {
            // Only send if the iframe has a source (is loaded)
            if (mobilePreviewFrame.getAttribute('src') && mobilePreviewFrame.getAttribute('src') !== '') {
                console.log('[State] Sending update to mobile preview...');
                mobilePreviewFrame.contentWindow.postMessage({
                    type: 'CONFIG_UPDATE',
                    config: this.config
                }, '*');
            }
        }

        // Also update main window CONFIG
        window.CONFIG = this.config;

        // If in Admin, trigger app refresh
        if (window.app && typeof window.app.recalcWizardSteps === 'function') {
            window.app.recalcWizardSteps();
            window.app.renderSidebar();
        }
    },

    saveToFile() {
        const configStr = `const CONFIG = ${JSON.stringify(this.config, null, 4)};`;

        // Create blob and download
        const blob = new Blob([configStr], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Update original config
        this.originalConfig = utils.deepClone(this.config);
        this.hasChanges = false;

        utils.showNotification('Configuration saved! Download starting...');
    },

    getConfig() {
        return this.config;
    },

    reset() {
        this.config = utils.deepClone(this.originalConfig);
        this.hasChanges = false;
        this.saveToStorage();
        this.broadcastUpdate();
        window.location.reload();
    },

    // Reload config from data.js (discards local changes)
    reloadFromDataJs() {
        if (typeof window.CONFIG === 'undefined') {
            utils.showNotification('No data.js found!', 'error');
            return;
        }

        if (this.hasChanges) {
            if (!confirm('You have unsaved changes. Reloading from data.js will discard them. Continue?')) {
                return;
            }
        }

        // Clear localStorage and reload from data.js
        localStorage.removeItem('ldr_config');
        localStorage.removeItem('ldr_config_hash');

        this.config = utils.deepClone(window.CONFIG);
        this.originalConfig = utils.deepClone(window.CONFIG);
        this.hasChanges = false;
        this.dataJsHash = this.hashConfig(window.CONFIG);

        localStorage.setItem('ldr_config_hash', this.dataJsHash);
        this.saveToStorage();

        utils.showNotification('Reloaded from data.js!');
        window.location.reload();
    },

    // Clear all cache and reload fresh
    clearCacheAndReload() {
        if (this.hasChanges) {
            if (!confirm('You have unsaved changes. Clear cache will discard them. Continue?')) {
                return;
            }
        }

        // Clear all localStorage related to this app
        localStorage.removeItem('ldr_config');
        localStorage.removeItem('ldr_config_hash');
        localStorage.removeItem('migration_music_order_v1');

        utils.showNotification('Cache cleared! Reloading...');

        // Force reload from data.js by adding reload param
        window.location.href = window.location.pathname + '?reload=1';
    }
};
