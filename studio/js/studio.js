/**
 * LDR Studio - Main Orchestrator
 */

const Editor = {
    async init() {
        console.log('[Studio] Initializing Editor...');

        try {
            // Wait for State to be ready (Cloud sync etc)
            if (window.StudioState) {
                await window.StudioState.init();
            }

            this.previewFrame = document.getElementById('preview-frame');

            this.setupEventListeners();

            // 1. Initialize editors FIRST (so they can bind button listeners)
            this.initializePremiumEditors();

            // 2. Render page list SECOND (this will show the FABs)
            this.renderPageList();

            // Listen for messages from preview
            window.addEventListener('message', (e) => this.handleMessage(e));

            console.log('[Studio] Editor Ready');
        } catch (e) {
            console.error('[Studio] Critical Init Error:', e);
            if (window.showNotification) showNotification('Gagal memuat editor: ' + e.message, 'error');
        }
    },

    setupEventListeners() {
        // Publish button
        const publishBtn = document.getElementById('publish-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', async () => {
                const btn = publishBtn;
                const originalContent = btn.innerHTML;

                btn.disabled = true;
                btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span><span>Syncing...</span>';

                try {
                    // 1. Sync to Cloud if Project ID exists
                    if (StudioState.projectId) {
                        const API_URL = 'https://valentine-upload.aldoramadhan16.workers.dev';
                        const res = await fetch(`${API_URL}/save-config?id=${StudioState.projectId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(StudioState.config)
                        });

                        if (!res.ok) throw new Error('Cloud sync failed');

                        const liveUrl = `https://ldr.for-you-always.my.id/?id=${StudioState.projectId}`;
                        EditorUX.showNotification(`Berhasil tersimpan! Membuka link: ${liveUrl}`);

                        // Automatically open the live site
                        setTimeout(() => window.open(liveUrl, '_blank'), 1000);

                        console.log('[Studio] Sync success. Opening:', liveUrl);
                    } else {
                        // If no project ID (localhost testing), just download for backup
                        StudioState.downloadDataJS();
                        EditorUX.showNotification('Snapshot lokal diunduh! (Gunakan ID Cloud untuk Sync)');
                    }
                } catch (e) {
                    console.error('[Studio] Sync Error:', e);
                    EditorUX.showNotification('Gagal sync ke cloud! Cek koneksi.', 'error');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = originalContent;
                }
            });
        }

        // Sidebar Upload Area
        const uploadArea = document.getElementById('sidebarUploadArea');
        if (uploadArea) {
            uploadArea.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,audio/*';
                input.onchange = (e) => {
                    EditorUX.handleMediaUpload(e.target, (url) => {
                        // Just showing it in the sidebar is enough for now 
                        // as the user can then copy the URL. 
                        // In a real app we might add it to a 'history' array in the config.
                        EditorUX.showNotification('Media diunggah! Copy URL dari list di bawah.');
                        this.renderMediaAssets();
                    });
                };
                input.click();
            };
        }

        // Preview frame load handling (with race condition protection)
        const onPreviewLoad = () => {
            console.log('[Studio] Preview frame loaded');
            if (typeof EditorUX !== 'undefined') {
                EditorUX.injectStudioEngine(this.previewFrame);
            }
            // Sync initial state
            if (window.StudioState) StudioState.sync();
        };

        if (this.previewFrame) {
            this.previewFrame.onload = onPreviewLoad;
            // Catch if already loaded
            try {
                if (this.previewFrame.contentDocument && this.previewFrame.contentDocument.readyState === 'complete') {
                    onPreviewLoad();
                }
            } catch (e) {
                // Cross-origin might throw, but studio uses same-origin usually
                console.warn('[Studio] Could not check iframe state:', e);
            }
        }
    },

    handleMessage(event) {
        const data = event.data;
        if (!data) return;

        switch (data.type) {
            case 'ELEMENT_SELECTED':
                console.log('[Studio] Element selected:', data);
                EditorUX.selectedElement = data;
                EditorUX.updateSelectionOverlay(data.rect);
                EditorUX.showToolbar(data.elementType);
                break;

            case 'DESELECT':
                document.getElementById('selection-overlay').classList.add('hidden');
                EditorUX.showToolbar(null);
                break;
        }
    },

    renderPageList() {
        const container = document.getElementById('story-pages');
        if (!container) return;

        const pages = StudioState.config.pageConfig.pages;
        // Filter: Only show enabled pages (defined by generator or factory defaults)
        const sortedPages = Object.values(pages)
            .filter(page => page.enabled !== false)
            .sort((a, b) => a.order - b.order);

        if (sortedPages.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-gray-400 italic text-center py-8">Belum ada halaman aktif</p>';
            return;
        }

        const html = sortedPages.map(page => `
            <div class="page-card" data-page-id="${page.id}" onclick="window.Editor.navigateToPage('${page.id}')">
                <div class="page-thumb">
                    <span class="material-symbols-outlined">${page.icon || 'description'}</span>
                </div>
                <div class="page-info">
                    <span class="page-title">${page.name}</span>
                    <span class="page-type">${page.type || 'Standard'}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

        // Sync highlight with what's actually open
        const activePageId = this.currentPageId || (sortedPages.length > 0 ? sortedPages[0].id : null);
        if (activePageId) {
            this.navigateToPage(activePageId);
        }
    },

    togglePage(pageId, isEnabled) {
        console.log('[Studio] Toggling page:', pageId, isEnabled);
        if (StudioState.config.pageConfig.pages[pageId]) {
            StudioState.config.pageConfig.pages[pageId].enabled = isEnabled;
            StudioState.sync();
            this.renderPageList();

            const status = isEnabled ? 'diaktifkan' : 'dinonaktifkan';
            EditorUX.showNotification(`Halaman ${StudioState.config.pageConfig.pages[pageId].name} ${status}!`);
        }
    },

    navigateToPage(pageId) {
        console.log('[Studio] Navigating to:', pageId);
        this.currentPageId = pageId;

        // Update active class in sidebar
        const cards = document.querySelectorAll('.page-card');
        cards.forEach(card => {
            if (card.dataset.pageId === pageId) {
                card.classList.add('current');
            } else {
                card.classList.remove('current');
            }
        });

        // Send to preview
        const frame = document.getElementById('preview-frame');
        if (frame && frame.contentWindow) {
            frame.contentWindow.postMessage({
                type: 'NAVIGATE_TO_PAGE',
                pageId: pageId
            }, '*');
        }

        // Toggle FAB Buttons visibility
        this.updateFABs(pageId);
    },

    updateFABs(pageId) {
        // Mapping of page IDs to their respective FABs
        const fabMap = {
            'page-1': 'password-add-btn',
            'page-2': 'dashboard-edit-btn',
            'page-3': 'map-add-btn',
            'page-4': 'music-add-btn',
            'page-6': 'gallery-add-btn',
            'page-12': 'video-add-btn',
            'page-8': 'messenger-edit-btn',
            'page-10': 'bucket-add-btn',
            'page-11': 'quiz-add-btn',
            'page-7': 'letter-edit-btn'
        };

        const targetFabId = fabMap[pageId];

        // Hide all first
        document.querySelectorAll('.fab-btn').forEach(btn => btn.classList.add('hidden'));

        // Show the one for this page
        if (targetFabId) {
            const btn = document.getElementById(targetFabId);
            if (btn) btn.classList.remove('hidden');
        }
    },

    initializePremiumEditors() {
        console.log('[Studio] Initializing premium editors...');
        const editors = [
            window.Editor.MusicEditor,
            window.Editor.GalleryEditor,
            window.Editor.QuizEditor,
            window.Editor.PasswordEditor,
            window.Editor.JourneyEditor,
            window.Editor.BucketEditor,
            window.Editor.VideoEditor,
            window.Editor.MessengerEditor,
            window.Editor.LetterEditor,
            window.Editor.DashboardEditor
        ];

        editors.forEach(editor => {
            if (editor && typeof editor.init === 'function') {
                try {
                    editor.init();
                } catch (e) {
                    console.error('[Studio] Failed to initialize editor:', e);
                }
            }
        });

        // Initial media render
        this.renderMediaAssets();
    },

    extractMediaUrls() {
        const urls = { images: new Set(), audio: new Set() };
        const scan = (obj) => {
            if (!obj) return;
            if (typeof obj === 'string') {
                const lower = obj.toLowerCase();
                if (lower.match(/\.(jpg|jpeg|png|webp|gif)/)) urls.images.add(obj);
                if (lower.match(/\.(mp3|wav|ogg|m4a)/)) urls.audio.add(obj);
            } else if (Array.isArray(obj)) {
                obj.forEach(scan);
            } else if (typeof obj === 'object') {
                Object.values(obj).forEach(scan);
            }
        };
        scan(StudioState.config);
        return {
            images: Array.from(urls.images),
            audio: Array.from(urls.audio)
        };
    },

    renderMediaAssets() {
        const { images, audio } = this.extractMediaUrls();

        // Render Images
        const imageGrid = document.getElementById('sidebarMediaGrid');
        if (imageGrid) {
            if (images.length === 0) {
                imageGrid.innerHTML = '<p class="text-[10px] text-gray-400 italic col-span-2 text-center py-4">Belum ada foto yang diunggah</p>';
            } else {
                imageGrid.innerHTML = images.map(url => `
                    <div class="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100 cursor-pointer" onclick="Editor.copyToClipboard('${url}')">
                        <img src="${url}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span class="material-symbols-outlined text-white text-sm">content_copy</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Audio
        const musicList = document.getElementById('sidebarMusicList');
        if (musicList) {
            if (audio.length === 0) {
                musicList.innerHTML = '<p class="text-[10px] text-gray-400 italic text-center py-4">Belum ada musik yang diunggah</p>';
            } else {
                const playlist = StudioState.config.sharedWorld?.playlist || [];
                const resolver = window.Editor?.MusicEditor?.resolveMediaPath || (p => p);

                musicList.innerHTML = audio.map(url => {
                    // Try to find matching song in playlist for richer sidebar
                    const song = playlist.find(s => s.url === url);
                    const title = song ? (song.title || song.songTitle) : (url.split('/').pop() || 'Untitled');
                    const artist = song ? song.artist : 'Unknown Artist';
                    const cover = song ? resolver(song.cover || song.coverSrc) : null;

                    return `
                    <div class="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-3 group cursor-pointer hover:border-rose-200 transition-all shadow-sm" onclick="Editor.copyToClipboard('${url}')">
                        <div class="w-10 h-10 rounded-lg bg-rose-50 overflow-hidden flex items-center justify-center text-rose-500 flex-shrink-0">
                            ${cover ? `<img src="${cover}" class="w-full h-full object-cover">` : `<span class="material-symbols-outlined text-sm">music_note</span>`}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[11px] font-bold text-gray-800 truncate mb-0.5">${title}</p>
                            <p class="text-[9px] font-medium text-gray-400 truncate uppercase tracking-tight">${artist}</p>
                        </div>
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="material-symbols-outlined text-gray-300 text-sm">content_copy</span>
                        </div>
                    </div>
                `}).join('');
            }
        }
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            EditorUX.showNotification('Link disalin ke clipboard! 📋');
        });
    }
};

// Initialize global Editor safely without overwriting detached modules
window.Editor = Object.assign(window.Editor || {}, Editor);

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.Editor.init());
} else {
    window.Editor.init();
}
