// Windows 98 Style Memories Gallery Script

const MemoriesPage = {
    config: null,
    memories: [],
    currentPhotoIndex: 0,

    init() {
        this.loadConfig();
        this.loadMemories();
        this.renderGallery();
        this.renderTimeline();
        this.updateStats();
        this.setupEventListeners();
    },

    loadConfig() {
        if (window.parent && window.parent !== window && window.parent.CONFIG) {
            console.log('Memories: Using parent CONFIG');
            this.config = window.parent.CONFIG;
        } else if (window.CONFIG) {
            console.log('Memories: Using window CONFIG');
            this.config = window.CONFIG;
        } else if (typeof CONFIG !== 'undefined') {
            console.log('Memories: Using global CONFIG');
            this.config = CONFIG;
        } else {
            console.log('Memories: Using default config');
            this.config = {
                memories: {
                    photos: [
                        { url: '', caption: 'First Memory', date: 'Jan 2023', note: '' }
                    ]
                },
                login: { relationshipStartDate: '2023-01-15' }
            };
        }
    },

    loadMemories() {
        // Load memories from config or use defaults
        // Prioritize new sharedWorld location, fallback to old memories location
        this.memories = this.config?.sharedWorld?.photos || this.config?.memories?.photos || [
            {
                url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
                caption: 'First Meeting',
                date: 'Aug 2023',
                note: 'The day our eyes first met.'
            },
            {
                url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
                caption: 'Beach Sunset',
                date: 'Dec 2023',
                note: 'Walking hand in hand by the shore.'
            },
            {
                url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=400',
                caption: 'Mountain Trip',
                date: 'Mar 2024',
                note: 'Top of the world together.'
            },
            {
                url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
                caption: 'Coffee Date',
                date: 'Jun 2024',
                note: 'Our favorite little cafe.'
            },
            {
                url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400',
                caption: 'Anniversary',
                date: 'Aug 2024',
                note: 'One year of love and counting.'
            }
        ];
    },

    renderGallery() {
        const grid = document.getElementById('polaroidGrid');
        if (!grid) return;

        grid.innerHTML = this.memories.map((memory, index) => `
            <div class="polaroid" data-index="${index}">
                <img src="${memory.url}" alt="${memory.caption}" class="polaroid-image" loading="lazy">
                <div class="polaroid-caption">${memory.caption}</div>
                <div class="polaroid-date">${memory.date}</div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.polaroid').forEach((polaroid) => {
            polaroid.addEventListener('click', () => {
                const index = parseInt(polaroid.dataset.index);
                this.openLightbox(index);
            });
        });
    },

    renderTimeline() {
        const timeline = document.getElementById('memoryTimeline');
        if (!timeline) return;

        // Sort memories by date
        const sortedMemories = [...this.memories].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        timeline.innerHTML = sortedMemories.map((memory, index) => `
            <div class="timeline-memory-item" data-index="${this.memories.indexOf(memory)}">
                <img src="${memory.url}" alt="${memory.caption}" class="timeline-thumb">
                <div class="timeline-info">
                    <div class="timeline-title">${memory.caption}</div>
                    <div class="timeline-date">📅 ${memory.date}</div>
                    <div class="timeline-note">${memory.note || ''}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        timeline.querySelectorAll('.timeline-memory-item').forEach((item) => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.openLightbox(index);
            });
        });
    },

    updateStats() {
        const photoCount = this.memories.length;
        document.getElementById('photoCount').textContent = photoCount;
        document.getElementById('memoryCount').textContent = photoCount;

        // Calculate days together
        const startDate = this.config?.login?.relationshipStartDate || '2023-01-15';
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('daysCount').textContent = diffDays;
    },

    openLightbox(index) {
        this.currentPhotoIndex = index;
        const lightbox = document.getElementById('lightbox');
        this.updateLightboxContent();
        lightbox.classList.add('active');
    },

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
    },

    updateLightboxContent() {
        const memory = this.memories[this.currentPhotoIndex];

        document.getElementById('lightboxImage').src = memory.url;
        document.getElementById('lightboxCaption').textContent = memory.caption;
        document.getElementById('lightboxDate').textContent = '📅 ' + memory.date;
        document.getElementById('lightboxNote').textContent = memory.note || '';
        document.getElementById('photoCounter').textContent =
            `${this.currentPhotoIndex + 1} / ${this.memories.length}`;
    },

    nextPhoto() {
        this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.memories.length;
        this.updateLightboxContent();
    },

    prevPhoto() {
        this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.memories.length) % this.memories.length;
        this.updateLightboxContent();
    },

    setupEventListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'NAVIGATE',
                direction: 'close'
            }, '*');
        });

        // Finish button - go to next in sequence
        document.getElementById('finishButton').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'APP_COMPLETE',
                appId: 'memories'
            }, '*');
        });

        // Lightbox close
        document.getElementById('lightboxClose').addEventListener('click', () => {
            this.closeLightbox();
        });

        // Lightbox navigation
        document.getElementById('nextPhoto').addEventListener('click', () => {
            this.nextPhoto();
        });

        document.getElementById('prevPhoto').addEventListener('click', () => {
            this.prevPhoto();
        });

        // Close lightbox on background click
        document.getElementById('lightbox').addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') {
                this.closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (!lightbox.classList.contains('active')) return;

            if (e.key === 'Escape') {
                this.closeLightbox();
            } else if (e.key === 'ArrowRight') {
                this.nextPhoto();
            } else if (e.key === 'ArrowLeft') {
                this.prevPhoto();
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    MemoriesPage.init();
});

// Listen for config updates
window.addEventListener('message', (e) => {
    if (e.data?.type === 'CONFIG_UPDATE') {
        window.CONFIG = e.data.config;
        MemoriesPage.config = e.data.config;
        MemoriesPage.loadMemories();
        MemoriesPage.renderGallery();
        MemoriesPage.renderTimeline();
        MemoriesPage.updateStats();
    }
});
