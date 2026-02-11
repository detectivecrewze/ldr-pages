/**
 * Windows Media Player Classic - Video Vault
 * Authentic WMP 6.4 style video player
 */

// State
let state = {
    videos: [],
    currentIndex: -1,
    isPlaying: false,
    isPaused: false
};

// DOM Elements
const elements = {
    videoPlayer: document.getElementById('videoPlayer'),
    videoPlaceholder: document.getElementById('videoPlaceholder'),
    videoOverlay: document.getElementById('videoOverlay'),
    nowPlayingText: document.getElementById('nowPlayingText'),

    // Controls
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stopBtn: document.getElementById('stopBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),

    // Progress
    seekbarFill: document.getElementById('seekbarFill'),
    seekbarThumb: document.getElementById('seekbarThumb'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),

    // Playlist
    playlistContainer: document.getElementById('playlistContainer'),
    playlistCount: document.getElementById('playlistCount'),

    // Info
    infoTitle: document.getElementById('infoTitle'),
    infoDetails: document.getElementById('infoDetails'),
    statusText: document.getElementById('statusText'),
    videoDimensions: document.getElementById('videoDimensions'),

    // Navigation
    backBtn: document.getElementById('backBtn'),
    nextBtnNav: document.getElementById('continueBtn')
};

// Initialize
function init() {
    loadData();
    renderPlaylist();
    setupEventListeners();
}

// Load data from CONFIG
function loadData() {
    // Default video data (placeholder - in real use would be actual video URLs)
    state.videos = [
        {
            id: 1,
            title: "Our First Date Vlog",
            duration: "3:45",
            description: "That magical day at the cafe",
            thumbnail: "🎬",
            url: "" // Add actual video URL
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
        },
        {
            id: 4,
            title: "Beach Trip Memories",
            duration: "4:30",
            description: "Sunset at Bali",
            thumbnail: "🏖️",
            url: ""
        },
        {
            id: 5,
            title: "Good Morning Calls",
            duration: "1:50",
            description: "Waking up together (virtually)",
            thumbnail: "☀️",
            url: ""
        }
    ];

    // Try to load from CONFIG
    if (typeof CONFIG !== 'undefined' && CONFIG.videos) {
        state.videos = CONFIG.videos;
    }

    elements.playlistCount.textContent = `(${state.videos.length})`;

    // Automatically detect real durations in the background
    autoDetectDurations();
}

/**
 * Automatically fetches metadata for all videos to get their real durations
 */
async function autoDetectDurations() {
    console.log('[Video] Starting background duration detection...');

    for (let i = 0; i < state.videos.length; i++) {
        const video = state.videos[i];
        if (!video.url) continue;

        try {
            const tempVideo = document.createElement('video');
            tempVideo.preload = 'metadata';
            tempVideo.src = video.url;
            tempVideo.crossOrigin = 'anonymous';

            // Create a promise that resolves when metadata is loaded
            const duration = await new Promise((resolve, reject) => {
                tempVideo.onloadedmetadata = () => resolve(tempVideo.duration);
                tempVideo.onerror = () => reject('Error loading metadata');
                // Timeout after 5 seconds to prevent hanging
                setTimeout(() => resolve(null), 5000);
            });

            if (duration && !isNaN(duration)) {
                const mins = Math.floor(duration / 60);
                const secs = Math.floor(duration % 60);
                const actualDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

                console.log(`[Video] Auto-detected duration for "${video.title}": ${actualDuration}`);
                state.videos[i].duration = actualDuration;
                renderPlaylist(); // Update the UI
            }
        } catch (err) {
            console.warn(`[Video] Failed to detect duration for ${video.title}:`, err);
        }
    }
}

// Render playlist
function renderPlaylist() {
    if (state.videos.length === 0) {
        elements.playlistContainer.innerHTML = '<div class="playlist-item">No videos</div>';
        return;
    }

    elements.playlistContainer.innerHTML = state.videos.map((video, index) => `
        <div class="playlist-item ${index === state.currentIndex ? 'active' : ''} ${index === state.currentIndex && state.isPlaying ? 'playing' : ''}" 
             data-index="${index}">
            <span class="pl-indicator">${index === state.currentIndex && state.isPlaying ? '▶' : video.thumbnail || '📹'}</span>
            <div class="pl-info">
                <div class="pl-title">${video.title}</div>
                <div class="pl-duration">${video.duration}</div>
            </div>
        </div>
    `).join('');

    // Add click handlers
    elements.playlistContainer.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            playVideo(index);
        });
    });
}

// Play video
function playVideo(index) {
    if (index < 0 || index >= state.videos.length) return;

    state.currentIndex = index;
    state.isPlaying = true;
    state.isPaused = false;

    const video = state.videos[index];

    // Update UI
    elements.videoPlaceholder.style.display = 'none';
    elements.videoPlayer.style.display = 'block';
    elements.videoOverlay.style.display = 'block';

    // Update info display
    elements.infoTitle.textContent = video.title;
    elements.infoDetails.textContent = `${video.description} • ${video.duration}`;
    elements.nowPlayingText.textContent = `Now Playing: ${video.title}`;
    elements.statusText.textContent = 'Playing';
    elements.totalTime.textContent = video.duration;

    // Real implementation: Set video source and play
    if (video.url) {
        elements.videoPlayer.src = video.url;
        elements.videoPlayer.load();
        elements.videoPlayer.play().catch(e => {
            console.warn('Playback error or blocked:', e);
            state.isPlaying = false;
            updatePlayPauseButtons();
        });
    }

    updatePlayPauseButtons();
    renderPlaylist();

    // Notify parent to mute background music
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'VIDEO_EVENT', action: 'playing' }, '*');
    }
}

// Pause video
function pauseVideo() {
    state.isPaused = true;
    state.isPlaying = false;
    elements.statusText.textContent = 'Paused';
    elements.videoPlayer.pause();
    updatePlayPauseButtons();
    renderPlaylist();

    // Notify parent to resume background music
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'VIDEO_EVENT', action: 'stopped' }, '*');
    }
}

// Resume video
function resumeVideo() {
    if (state.currentIndex === -1) {
        playVideo(0);
        return;
    }

    state.isPaused = false;
    state.isPlaying = true;
    elements.statusText.textContent = 'Playing';
    elements.videoPlayer.play();
    updatePlayPauseButtons();
    renderPlaylist();

    // Notify parent to mute background music
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'VIDEO_EVENT', action: 'playing' }, '*');
    }
}

// Stop video
function stopVideo() {
    state.isPlaying = false;
    state.isPaused = false;

    elements.videoPlayer.pause();
    elements.videoPlayer.currentTime = 0;

    elements.videoPlaceholder.style.display = 'flex';
    elements.videoPlayer.style.display = 'none';
    elements.videoOverlay.style.display = 'none';
    elements.infoTitle.textContent = 'No video selected';
    elements.infoDetails.textContent = '--';
    elements.statusText.textContent = 'Stopped';
    elements.currentTime.textContent = '0:00';
    elements.seekbarFill.style.width = '0%';
    elements.seekbarThumb.style.left = '0%';

    updatePlayPauseButtons();
    renderPlaylist();

    // Notify parent to resume background music
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'VIDEO_EVENT', action: 'stopped' }, '*');
    }
}

// Play previous
function playPrevious() {
    if (state.videos.length === 0) return;

    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
        prevIndex = state.videos.length - 1;
    }
    playVideo(prevIndex);
}

// Play next
function playNext() {
    if (state.videos.length === 0) return;

    let nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.videos.length) {
        // End of playlist - stop video so background music returns
        stopVideo();
        return;
    }
    playVideo(nextIndex);
}

// Update play/pause button visibility
function updatePlayPauseButtons() {
    if (state.isPlaying) {
        elements.playBtn.style.display = 'none';
        elements.pauseBtn.style.display = 'flex';
    } else {
        elements.playBtn.style.display = 'flex';
        elements.pauseBtn.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Play/Pause/Stop
    elements.playBtn.addEventListener('click', resumeVideo);
    elements.pauseBtn.addEventListener('click', pauseVideo);
    elements.stopBtn.addEventListener('click', stopVideo);
    elements.prevBtn.addEventListener('click', playPrevious);
    elements.nextBtn.addEventListener('click', playNext);

    // Navigation
    elements.backBtn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'NAVIGATE', direction: 'back' }, '*');
    });

    elements.nextBtnNav.addEventListener('click', () => {
        window.parent.postMessage({ type: 'APP_COMPLETE' }, '*');
    });

    elements.videoPlayer.addEventListener('loadedmetadata', () => {
        const duration = elements.videoPlayer.duration;
        if (!duration || isNaN(duration)) return;

        const mins = Math.floor(duration / 60);
        const secs = Math.floor(duration % 60);
        const actualDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

        console.log('[Video] Metadata loaded. Actual duration:', actualDuration);

        if (state.currentIndex !== -1) {
            // Update the duration in our state
            state.videos[state.currentIndex].duration = actualDuration;

            // Update the UI elements
            elements.totalTime.textContent = actualDuration;
            elements.infoDetails.textContent = `${state.videos[state.currentIndex].description} • ${actualDuration}`;

            // Re-render playlist to show correct duration in the list
            renderPlaylist();
        }
    });

    // Update video dimensions if needed
    if (elements.videoDimensions) {
        elements.videoDimensions.textContent = `${elements.videoPlayer.videoWidth}x${elements.videoPlayer.videoHeight}`;
    }

    elements.videoPlayer.addEventListener('timeupdate', () => {
        const percent = (elements.videoPlayer.currentTime / elements.videoPlayer.duration) * 100;
        elements.seekbarFill.style.width = `${percent}%`;
        elements.seekbarThumb.style.left = `${percent}%`;

        const mins = Math.floor(elements.videoPlayer.currentTime / 60);
        const secs = Math.floor(elements.videoPlayer.currentTime % 60);
        elements.currentTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    });

    elements.videoPlayer.addEventListener('ended', () => {
        playNext();
    });
}

// Listen for CONFIG_UPDATE
window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'CONFIG_UPDATE' && e.data.config) {
        if (e.data.config.videos) {
            state.videos = e.data.config.videos;
            elements.playlistCount.textContent = `(${state.videos.length})`;
            stopVideo();
            state.currentIndex = -1;
            renderPlaylist();
        }
    }
});

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
