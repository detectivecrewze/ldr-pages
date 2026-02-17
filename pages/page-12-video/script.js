// Video Vault - Retro Media Player Script

const VideoPlayer = {
    state: {
        videos: [],
        currentIndex: 0,
        isPlaying: false,
        volume: 0.7,
        isMuted: false,
        duration: 0,
        currentTime: 0
    },

    elements: {},

    init() {
        console.log('[Video] Initializing player...');
        this.cacheElements();
        this.loadData();
        this.setupEventListeners();
        this.renderPlaylist();
        this.playVideo(0, false); // Load first video without autoplay
    },

    cacheElements() {
        const doc = document;
        this.elements = {
            video: doc.getElementById('videoPlayer'),
            videoPlaceholder: doc.getElementById('videoPlaceholder'),
            playBtn: doc.getElementById('playBtn'),
            pauseBtn: doc.getElementById('pauseBtn'),
            stopBtn: doc.getElementById('stopBtn'),
            prevBtn: doc.getElementById('prevBtn'),
            nextBtn: doc.getElementById('nextBtn'),
            muteBtn: doc.querySelector('.ctrl-btn-small[title="Mute"]'),
            volumeFill: doc.querySelector('.volume-fill'),
            seekbarFill: id('seekbarFill'),
            seekbarThumb: id('seekbarThumb'),
            seekbarTrack: id('seekbarTrack'),
            currentTime: id('currentTime'),
            totalTime: id('totalTime'),
            infoLine1: id('infoTitle'),
            infoLine2: id('infoDetails'),
            playlistContainer: id('playlistContainer'),
            playlistCount: id('playlistCount'),
            statusText: id('statusText'),
            backButton: id('backBtn'),
            continueButton: id('continueBtn')
        };
    },

    loadData() {
        const { state, elements } = this;
        // Default video data
        state.videos = [
            {
                id: 1,
                title: "Our First Date Vlog",
                duration: "3:45",
                description: "That magical day at the cafe",
                thumbnail: "🎬",
                url: ""
            },
            {
                id: 2,
                title: "Video Call Funny Moments",
                duration: "5:22",
                description: "Compilation of our best laughs",
                thumbnail: "📹",
                url: ""
            },
            {
                id: 3,
                title: "Birthday Surprise Message",
                duration: "2:15",
                description: "Your special day celebration",
                thumbnail: "🎂",
                url: ""
            }
        ];

        // Try to load from CONFIG
        if (typeof CONFIG !== 'undefined' && CONFIG.videos && CONFIG.videos.length > 0) {
            // Filter out invalid/empty entries
            const filtered = CONFIG.videos.filter(v => v.title || v.url);
            if (filtered.length > 0) state.videos = filtered;
        }

        elements.playlistCount.textContent = `(${state.videos.length})`;

        // Background duration detection
        this.autoDetectDurations();
    },

    /**
     * Automatically fetches metadata for all videos to get their real durations
     */
    async autoDetectDurations() {
        const { state } = this;
        console.log('[Video] Starting background duration detection...');

        for (let i = 0; i < state.videos.length; i++) {
            const video = state.videos[i];
            if (!video.url) continue;

            try {
                const tempVideo = document.createElement('video');
                tempVideo.preload = 'metadata';
                tempVideo.src = video.url;
                tempVideo.crossOrigin = 'anonymous';

                const duration = await new Promise((resolve) => {
                    tempVideo.onloadedmetadata = () => resolve(tempVideo.duration);
                    tempVideo.onerror = () => resolve(null);
                    setTimeout(() => resolve(null), 5000);
                });

                if (duration && !isNaN(duration) && duration !== Infinity) {
                    const mins = Math.floor(duration / 60);
                    const secs = Math.floor(duration % 60);
                    const actualDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

                    state.videos[i].duration = actualDuration;

                    // Update main UI if this is current video
                    if (i === state.currentIndex) {
                        this.elements.totalTime.textContent = actualDuration;
                    }

                    this.renderPlaylist();
                }
            } catch (err) {
                console.warn(`[Video] Failed to detect duration for ${video.title}:`, err);
            }
        }
    },

    setupEventListeners() {
        const { elements, state } = this;

        // Playback controls
        elements.playBtn.addEventListener('click', () => this.togglePlay(true));
        elements.pauseBtn.addEventListener('click', () => this.togglePlay(false));
        elements.stopBtn.addEventListener('click', () => this.stopVideo());
        elements.prevBtn.addEventListener('click', () => this.playPrevious());
        elements.nextBtn.addEventListener('click', () => this.playNext());

        // Volume
        elements.muteBtn.addEventListener('click', () => this.toggleMute());

        // Video Events
        elements.video.addEventListener('timeupdate', () => this.updateProgress());
        elements.video.addEventListener('ended', () => this.playNext());
        elements.video.addEventListener('loadedmetadata', () => {
            state.duration = elements.video.duration;
            const mins = Math.floor(state.duration / 60);
            const secs = Math.floor(state.duration % 60);
            elements.totalTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        });

        // Seek
        elements.seekbarTrack.addEventListener('click', (e) => {
            const rect = elements.seekbarTrack.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            elements.video.currentTime = pos * elements.video.duration;
        });

        // Navigation
        elements.backButton.addEventListener('click', () => {
            window.parent.postMessage({ type: 'NAVIGATE', direction: 'close' }, '*');
        });
        elements.continueButton.addEventListener('click', () => {
            window.parent.postMessage({ type: 'APP_COMPLETE', appId: 'video', nextApp: 'letter' }, '*');
        });
    },

    renderPlaylist() {
        const { state, elements } = this;
        if (!elements.playlistContainer) return;

        elements.playlistContainer.innerHTML = state.videos.map((video, index) => `
            <div class="playlist-item ${index === state.currentIndex ? 'active' : ''} ${index === state.currentIndex && state.isPlaying ? 'playing' : ''}" 
                 data-index="${index}">
                <span class="pl-indicator">${index === state.currentIndex && state.isPlaying ? '▶' : '📹'}</span>
                <div class="pl-info">
                    <div class="pl-title">${video.title || 'Untitled'}</div>
                    <div class="pl-duration">Click to play</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        elements.playlistContainer.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.playVideo(index);
            });
        });
    },

    playVideo(index, autoplay = true) {
        const { state, elements } = this;
        const video = state.videos[index];
        if (!video) return;

        state.currentIndex = index;

        // Update selection UI
        this.renderPlaylist();

        // Update Info Display
        elements.infoLine1.textContent = video.title || 'Now Playing';
        elements.infoDetails.textContent = `${video.description || 'Our Memory'} • ${video.duration || '--:--'}`;
        elements.statusText.textContent = 'Opening...';

        if (video.url) {
            elements.videoPlaceholder.style.display = 'none';
            elements.video.style.display = 'block';

            // Set source and load
            elements.video.src = video.url;
            elements.video.load();

            elements.video.onerror = (e) => {
                console.error('[Video] Error loading:', video.url, e);
                elements.statusText.textContent = 'Playback error';
            };

            if (autoplay) {
                elements.video.play().then(() => {
                    state.isPlaying = true;
                    this.updatePlayPauseUI();
                    elements.statusText.textContent = 'Playing';
                }).catch(e => {
                    console.log('Playback failed:', e);
                    state.isPlaying = false;
                    this.updatePlayPauseUI();
                    elements.statusText.textContent = 'Ready';
                });
            } else {
                state.isPlaying = false;
                this.updatePlayPauseUI();
                elements.statusText.textContent = 'Ready';
            }
        } else {
            elements.video.src = '';
            elements.video.style.display = 'none';
            elements.videoPlaceholder.style.display = 'flex';
            elements.statusText.textContent = 'No media found';
            state.isPlaying = false;
            this.updatePlayPauseUI();
        }
    },

    togglePlay(play) {
        const { state, elements } = this;
        if (!elements.video.src && play) return;

        if (play) {
            elements.video.play();
            state.isPlaying = true;
            elements.statusText.textContent = 'Playing';
        } else {
            elements.video.pause();
            state.isPlaying = false;
            elements.statusText.textContent = 'Paused';
        }
        this.updatePlayPauseUI();
        this.renderPlaylist();
    },

    stopVideo() {
        const { state, elements } = this;
        elements.video.pause();
        elements.video.currentTime = 0;
        state.isPlaying = false;
        elements.statusText.textContent = 'Stopped';
        this.updatePlayPauseUI();
        this.renderPlaylist();
    },

    updatePlayPauseUI() {
        const { state, elements } = this;
        elements.playBtn.style.display = state.isPlaying ? 'none' : 'flex';
        elements.pauseBtn.style.display = state.isPlaying ? 'flex' : 'none';

        // Add inactive state style to controls if no video src
        const hasSrc = elements.video.src && elements.video.src !== window.location.href;
        elements.playBtn.style.opacity = hasSrc ? '1' : '0.5';
    },

    playNext() {
        const nextIndex = (this.state.currentIndex + 1) % this.state.videos.length;
        this.playVideo(nextIndex);
    },

    playPrevious() {
        const prevIndex = (this.state.currentIndex - 1 + this.state.videos.length) % this.state.videos.length;
        this.playVideo(prevIndex);
    },

    toggleMute() {
        const { state, elements } = this;
        state.isMuted = !state.isMuted;
        elements.video.muted = state.isMuted;
        elements.muteBtn.textContent = state.isMuted ? '🔇' : '🔊';
    },

    updateProgress() {
        const { elements, state } = this;
        const curr = elements.video.currentTime;
        const dur = elements.video.duration;

        if (isNaN(dur)) return;

        const pos = (curr / dur) * 100;
        elements.seekbarFill.style.width = pos + '%';
        elements.seekbarThumb.style.left = pos + '%';

        // Update time display
        const cMins = Math.floor(curr / 60);
        const cSecs = Math.floor(curr % 60);
        elements.currentTime.textContent = `${cMins}:${cSecs.toString().padStart(2, '0')}`;
    }
};

// Global helper for ID selection
function id(str) { return document.getElementById(str); }

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    VideoPlayer.init();
});

// Update from Parent (Admin Console)
window.addEventListener('message', (e) => {
    if (e.data?.type === 'CONFIG_UPDATE') {
        window.CONFIG = e.data.config;
        VideoPlayer.loadData();
        VideoPlayer.renderPlaylist();
        // If current index is out of bounds after update
        if (VideoPlayer.state.currentIndex >= VideoPlayer.state.videos.length) {
            VideoPlayer.playVideo(0, false);
        }
    }
});
