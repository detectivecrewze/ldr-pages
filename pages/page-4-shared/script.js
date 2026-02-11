/**
 * Windows 98 Media Player - Music Only
 */

// State
let state = {
    currentSongIndex: (window.parent && window.parent.audioState) ? window.parent.audioState.currentSongIndex : -1,
    isPlaying: (window.parent && window.parent.bgAudio) ? !window.parent.bgAudio.paused : false,
    currentTime: (window.parent && window.parent.bgAudio) ? window.parent.bgAudio.currentTime : 0,
    duration: (window.parent && window.parent.bgAudio) ? window.parent.bgAudio.duration : 0,
    playlist: (window.parent && window.parent.audioState) ? window.parent.audioState.playlist : [],
    progressInterval: null,
    audio: (window.parent && window.parent.bgAudio) ? window.parent.bgAudio : new Audio()
};

// DOM Elements
const elements = {
    // Buttons
    playBtn: document.getElementById('playBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    backBtn: document.getElementById('backBtn'),
    nextBtnNav: document.getElementById('nextBtnNav'),

    // Display
    songTitle: document.getElementById('songTitle'),
    songArtist: document.getElementById('songArtist'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    progressFill: document.getElementById('progressFill'),
    statusText: document.getElementById('statusText'),
    trackNum: document.getElementById('trackNum'),

    // Visuals
    cdCase: document.getElementById('cdCase'),
    cdDisc: document.getElementById('cdDisc'),
    cdLabel: document.getElementById('cdLabel'),
    cdCover: document.getElementById('cdCover'),
    cdFrontCover: document.getElementById('cdFrontCover'),
    visualizer: document.getElementById('visualizer'),

    // Volume
    volumeSlider: document.querySelector('.volume-slider'),
    volumeLevel: document.querySelector('.volume-level'),

    // Containers
    playlistContainer: document.getElementById('playlistContainer')
};

// Initialize
function init() {
    loadData();
    renderPlaylist();
    setupEventListeners();
    updateStatus();

    // Re-sync UI if something is already playing in parent
    if (state.currentSongIndex !== -1 && state.isPlaying) {
        const song = state.playlist[state.currentSongIndex];
        elements.songTitle.textContent = song.title;
        elements.songArtist.textContent = song.artist;
        elements.statusText.textContent = `Playing: ${song.title}`;
        elements.totalTime.textContent = formatTime(state.duration);
        updateProgressDisplay();
        startProgress();
        elements.cdDisc.classList.add('playing');
        elements.visualizer.classList.add('playing');
        updatePlayButton();
    } else if (state.playlist.length > 0) {
        // Auto-play first song if nothing is active and we have a playlist
        // We use a small timeout to ensure the browser registers the user interaction 
        // that opened this window (like the login button or desktop icon)
        setTimeout(() => {
            if (state.currentSongIndex === -1) {
                playSong(0);
            }
        }, 500);
    }

    setupVolumeControl();
}

// Load data from CONFIG
function loadData() {
    if (typeof CONFIG !== 'undefined' && CONFIG.sharedWorld && CONFIG.sharedWorld.playlist) {
        state.playlist = CONFIG.sharedWorld.playlist;
    } else {
        // Default playlist
        state.playlist = [
            { title: "Hey There Delilah", artist: "Plain White T's", duration: "3:52" },
            { title: "A Thousand Miles", artist: "Vanessa Carlton", duration: "3:57" },
            { title: "Distance", artist: "Yebba", duration: "4:21" },
            { title: "Oceans", artist: "Hillsong United", duration: "8:07" },
            { title: "Call You Mine", artist: "Jeff Bernat", duration: "3:58" }
        ];
    }

    if (window.parent && window.parent.audioState) {
        window.parent.audioState.playlist = state.playlist;
    }
}

// Render playlist
function renderPlaylist() {
    if (state.playlist.length === 0) return;

    elements.playlistContainer.innerHTML = state.playlist.map((song, index) => `
        <div class="playlist-item ${index === state.currentSongIndex ? 'active' : ''} ${index === state.currentSongIndex && state.isPlaying ? 'playing' : ''}" 
             data-index="${index}">
            <div class="song-title">${song.title}</div>
            <div class="song-artist-small">${song.artist}</div>
        </div>
    `).join('');

    // Add click handlers
    elements.playlistContainer.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            playSong(index);
        });
    });
}

// Play a specific song
function playSong(index) {
    if (index < 0 || index >= state.playlist.length) return;

    state.currentSongIndex = index;
    state.isPlaying = true;
    state.currentTime = 0;

    const song = state.playlist[index];

    // Update display
    elements.songTitle.textContent = song.title;
    elements.songArtist.textContent = song.artist;
    elements.totalTime.textContent = song.duration || '--:--';
    elements.statusText.textContent = `Playing: ${song.title}`;

    // Audio handling
    state.audio.src = song.url;
    state.audio.play().catch(e => console.log('Auto-play blocked or error:', e));

    // Sync with parent
    if (window.parent && window.parent.audioState) {
        window.parent.audioState.currentSongIndex = index;
        window.parent.audioState.playlist = state.playlist;
    }

    // Wait for metadata to get duration
    state.audio.onloadedmetadata = () => {
        state.duration = state.audio.duration;
        elements.totalTime.textContent = formatTime(state.duration);
        updateProgressDisplay();
    };

    // Update UI
    updatePlayButton();
    renderPlaylist();
    startProgress();
    updateStatus();

    // Update Cover (Jewel Case Style)
    if (song.cover) {
        elements.cdFrontCover.style.backgroundImage = `url(${song.cover})`;
        elements.cdFrontCover.classList.add('visible');
        elements.cdCase.classList.add('has-cover');
        elements.cdLabel.classList.add('hidden');
    } else {
        elements.cdFrontCover.style.backgroundImage = 'none';
        elements.cdFrontCover.classList.remove('visible');
        elements.cdCase.classList.remove('has-cover');
        elements.cdLabel.classList.remove('hidden');
    }

    // Start animations
    elements.cdDisc.classList.add('playing');
    elements.visualizer.classList.add('playing');
}

// Toggle play/pause
function togglePlay() {
    if (state.playlist.length === 0) return;

    if (state.currentSongIndex === -1) {
        // Play first song
        playSong(0);
        return;
    }

    state.isPlaying = !state.isPlaying;
    updatePlayButton();

    if (state.isPlaying) {
        state.audio.play().catch(e => console.log('Play error:', e));
        elements.statusText.textContent = `Playing: ${state.playlist[state.currentSongIndex].title}`;
        elements.cdDisc.classList.add('playing');
        elements.visualizer.classList.add('playing');
        startProgress();
    } else {
        state.audio.pause();
        elements.statusText.textContent = 'Paused';
        elements.cdDisc.classList.remove('playing');
        elements.visualizer.classList.remove('playing');
        stopProgress();
    }

    renderPlaylist();
}

// Play next song
function playNext() {
    if (state.playlist.length === 0) return;

    let nextIndex = state.currentSongIndex + 1;
    if (nextIndex >= state.playlist.length) {
        nextIndex = 0; // Loop to first
    }
    playSong(nextIndex);
}

// Play previous song
function playPrev() {
    if (state.playlist.length === 0) return;

    let prevIndex = state.currentSongIndex - 1;
    if (prevIndex < 0) {
        prevIndex = state.playlist.length - 1; // Loop to last
    }
    playSong(prevIndex);
}

// Update play button icon
function updatePlayButton() {
    elements.playBtn.textContent = state.isPlaying ? '⏸' : '▶';
}

// Start progress simulation
function startProgress() {
    stopProgress();

    state.progressInterval = setInterval(() => {
        if (!state.audio.paused) {
            state.currentTime = Math.floor(state.audio.currentTime);
            updateProgressDisplay();
        }

        if (state.audio.ended) {
            playNext();
        }
    }, 500);
}

// Stop progress
function stopProgress() {
    if (state.progressInterval) {
        clearInterval(state.progressInterval);
        state.progressInterval = null;
    }
}

// Update progress bar and time
function updateProgressDisplay() {
    if (!state.duration) return;
    const percent = (state.currentTime / state.duration) * 100;
    elements.progressFill.style.width = `${percent}%`;

    elements.currentTime.textContent = formatTime(state.currentTime);
}

// Format time in seconds to M:SS
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update status bar
function updateStatus() {
    elements.trackNum.textContent = `Track ${state.currentSongIndex + 1} of ${state.playlist.length}`;
}

// Setup event listeners
function setupEventListeners() {
    // Player controls
    elements.playBtn.addEventListener('click', togglePlay);
    elements.nextBtn.addEventListener('click', playNext);
    elements.prevBtn.addEventListener('click', playPrev);

    // Navigation
    elements.backBtn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'NAVIGATE', direction: 'back' }, '*');
    });

    elements.nextBtnNav.addEventListener('click', () => {
        window.parent.postMessage({ type: 'APP_COMPLETE' }, '*');
    });

    // Progress bar click to seek
    document.querySelector('.progress-bar-container').addEventListener('click', (e) => {
        if (state.currentSongIndex === -1 || !state.duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        state.audio.currentTime = percent * state.duration;
        state.currentTime = Math.floor(state.audio.currentTime);
        updateProgressDisplay();
    });
}

// Listen for CONFIG_UPDATE from parent
window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'CONFIG_UPDATE' && e.data.config) {
        if (e.data.config.sharedWorld && e.data.config.sharedWorld.playlist) {
            state.audio.pause();
            state.audio.src = '';
            stopProgress();
            state.currentSongIndex = -1;
            state.isPlaying = false;
            state.currentTime = 0;

            state.playlist = e.data.config.sharedWorld.playlist;

            renderPlaylist();
            updateStatus();

            elements.songTitle.textContent = 'Select a song';
            elements.songArtist.textContent = '-';
            elements.currentTime.textContent = '0:00';
            elements.totalTime.textContent = '0:00';
            elements.progressFill.style.width = '0%';
            elements.statusText.textContent = 'Ready';
            updatePlayButton();

            // Reset CD visuals
            elements.cdDisc.classList.remove('playing');
            elements.visualizer.classList.remove('playing');
        }
    }
});

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function setupVolumeControl() {
    if (!elements.volumeSlider || !state.audio) return;

    // Initial value
    updateVolumeDisplay(state.audio.volume || 1);

    // Click handler
    elements.volumeSlider.addEventListener('mousedown', function (e) {
        setVolumeFromEvent(e);

        // Drag handler
        function onMouseMove(e) {
            setVolumeFromEvent(e);
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function setVolumeFromEvent(e) {
    const rect = elements.volumeSlider.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;

    // Clamp
    percent = Math.max(0, Math.min(1, percent));

    // Set volume
    state.audio.volume = percent;
    updateVolumeDisplay(percent);
}

function updateVolumeDisplay(percent) {
    if (elements.volumeLevel) {
        elements.volumeLevel.style.width = (percent * 100) + '%';
    }
}
