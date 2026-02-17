/**
 * LDR Studio State Management
 */

const deepMerge = (target, source) => {
    if (!source) return target;
    const output = Array.isArray(target) ? [...target] : { ...target };
    if (source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!(key in target) || !target[key] || typeof target[key] !== 'object') {
                    output[key] = source[key];
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                output[key] = source[key];
            }
        });
    }
    return output;
};

const StudioState = {
    config: null,
    LS_KEY: 'ldr_studio_config',
    projectId: null,
    _readyPromise: null,

    init() {
        if (this._readyPromise) return this._readyPromise;
        this._readyPromise = this._performInit();
        return this._readyPromise;
    },

    async _performInit() {
        console.log('[Studio] Initializing State...');
        const urlParams = new URLSearchParams(window.location.search);
        this.projectId = urlParams.get('id');

        // Use project-specific key to avoid cross-contamination
        if (this.projectId) {
            this.LS_KEY = `ldr_studio_config_${this.projectId}`;
            console.log('[Studio] Project Context:', this.projectId);
        }

        // 1. Load from data.js (factory)
        const factoryConfig = window.CONFIG || {};

        // 2. Load from localStorage (drafts)
        const saved = localStorage.getItem(this.LS_KEY);
        let draftConfig = {};
        if (saved) {
            try {
                draftConfig = JSON.parse(saved);
                console.log('[Studio] Local drafts loaded');
            } catch (e) {
                console.error('Corrupt save', e);
            }
        }

        // 3. Load from Cloud (if ID exists)
        let cloudConfig = {};
        let accessProfile = null;
        if (this.projectId) {
            try {
                const API_URL = 'https://valentine-upload.aldoramadhan16.workers.dev';

                // Fetch in parallel
                const [accessRes, cloudRes] = await Promise.all([
                    fetch(`${API_URL}/get-config?id=access-${this.projectId}`).catch(() => ({ ok: false })),
                    fetch(`${API_URL}/get-config?id=${this.projectId}`).catch(() => ({ ok: false }))
                ]);

                if (accessRes.ok) accessProfile = await accessRes.json();
                if (cloudRes.ok) cloudConfig = await cloudRes.json();

                console.log('[Studio] Cloud data synced');
            } catch (e) {
                console.error('[Studio] Cloud fetch error:', e);
            }
        }

        // 4. Merge (Factory < Cloud < Local)
        // We start with factory template data
        this.config = deepMerge({}, factoryConfig);

        // Merge cloud data over it (if any exists)
        if (cloudConfig && Object.keys(cloudConfig).length > 0) {
            this.config = deepMerge(this.config, cloudConfig);
        }

        // Merge local drafts over that
        if (draftConfig && Object.keys(draftConfig).length > 0) {
            this.config = deepMerge(this.config, draftConfig);
        }

        // MANDATORY: Security settings (login) and project identity (theme name) 
        // derived from the GENERATOR should ALWAYS win to keep project integrity.
        if (cloudConfig.login) {
            this.config.login = deepMerge(this.config.login || {}, cloudConfig.login);
            console.log('[Studio] Security verified from Cloud');
        }
        if (cloudConfig.theme?.appName) {
            this.config.theme.appName = cloudConfig.theme.appName;
        }
        // Ensure enabled pages from cloud/access profile are respected
        if (cloudConfig.pageConfig?.pages) {
            Object.keys(cloudConfig.pageConfig.pages).forEach(id => {
                if (this.config.pageConfig.pages[id]) {
                    this.config.pageConfig.pages[id].enabled = cloudConfig.pageConfig.pages[id].enabled;
                }
            });
        }

        // 5. Apply Access Profile Overrides
        if (accessProfile && accessProfile.allowedIds && this.config.pageConfig) {
            Object.keys(this.config.pageConfig.pages).forEach(pageId => {
                if (!accessProfile.allowedIds.includes(pageId)) {
                    this.config.pageConfig.pages[pageId].enabled = false;
                }
            });
        }

        console.log('[Studio] State Finalized');
        this.sync();

        // 6. Password Gate Check
        if (this.projectId && this.config.login && this.config.login.password) {
            const isUnlocked = sessionStorage.getItem('studio_unlocked_' + this.projectId);
            const gate = document.getElementById('password-gate');
            if (!isUnlocked && gate) {
                gate.classList.remove('hidden');
                console.log('[Studio] Password Gate Active');
            }
        }

        // Critical: Re-render UI
        if (window.Editor && typeof window.Editor.renderPageList === 'function') {
            window.Editor.renderPageList();
        }

        return this.config;
    },

    resetToFactory() {
        if (confirm('Hapus semua perubahan dan kembali ke setelan awal (data.js)?')) {
            localStorage.removeItem(this.LS_KEY);
            location.reload();
        }
    },

    updateValue(path, value) {
        const parts = path.split('.');
        let current = this.config;

        for (let i = 0; i < parts.length - 1; i++) {
            let key = parts[i];

            // Handle array notation e.g. music[0]
            const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
                const k = arrayMatch[1];
                const idx = parseInt(arrayMatch[2]);
                if (!current[k]) current[k] = [];
                if (!current[k][idx]) current[k][idx] = {};
                current = current[k][idx];
            } else {
                if (!current[key]) current[key] = {};
                current = current[key];
            }
        }

        const lastKey = parts[parts.length - 1];
        const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);

        if (arrayMatch) {
            const k = arrayMatch[1];
            const idx = parseInt(arrayMatch[2]);
            if (!current[k]) current[k] = [];
            current[k][idx] = value;
        } else {
            current[lastKey] = value;
        }

        this.save();
        this.sync();

        // Update UI displays if needed
        if (path === 'theme.appName') {
            const el = document.getElementById('projectNameDisplay');
            if (el) el.textContent = value;
        }
    },

    save() {
        localStorage.setItem(this.LS_KEY, JSON.stringify(this.config));
        console.log('[Studio] Saved to Disk');
    },

    sync() {
        const iframe = document.getElementById('preview-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'CONFIG_UPDATE', config: this.config }, '*');
        }
        if (window.Editor && typeof window.Editor.renderMediaAssets === 'function') {
            window.Editor.renderMediaAssets();
        }
    },

    downloadDataJS() {
        const dataJS = `const CONFIG = ${JSON.stringify(this.config, null, 4)};`;
        const blob = new Blob([dataJS], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        a.click();
        URL.revokeObjectURL(url);
    },

    // Compatibility Helpers for admin-ported modules
    getConfig() {
        return this.config;
    },

    updateNestedConfig(parent, child, updates) {
        if (!this.config[parent]) this.config[parent] = {};
        if (child) {
            if (!this.config[parent][child]) this.config[parent][child] = {};
            Object.assign(this.config[parent][child], updates);
        } else {
            Object.assign(this.config[parent], updates);
        }
        this.save();
        this.sync();
    },

    updateField(parent, field, value) {
        if (!this.config[parent]) this.config[parent] = {};
        this.config[parent][field] = value;
        this.save();
        this.sync();
    }
};

window.StudioState = StudioState;
StudioState.init();
