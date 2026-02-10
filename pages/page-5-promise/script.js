// Windows 98 Style Promise Page Script - Windowed Version

const PromisePage = {
    config: null,
    envelopeOpened: false,
    countdownInterval: null,

    init() {
        this.loadConfig();
        this.initializeLetter();
        this.populatePromises();
        this.setupEndLDRCountdown();
        this.setupEventListeners();
    },

    loadConfig() {
        if (window.parent !== window && window.parent.CONFIG) {
            this.config = window.parent.CONFIG;
        } else {
            this.config = window.CONFIG || {};
        }
    },

    setupEventListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'NAVIGATE',
                direction: 'close'
            }, '*');
        });

        // Next button (initially disabled until envelope opens)
        const nextBtn = document.getElementById('nextButton');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                window.parent.postMessage({
                    type: 'APP_COMPLETE',
                    appId: 'promise',
                    nextApp: null
                }, '*');
            });
        }

        // Close button in finale
        const closeBtn = document.getElementById('closeButton');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.parent.postMessage({
                    type: 'APP_COMPLETE',
                    appId: 'promise',
                    nextApp: null
                }, '*');
            });
        }
    },

    initializeLetter() {
        const envelope = document.getElementById('envelope');
        const letterPage = document.getElementById('letterPage');
        const letterBody = document.getElementById('letterBody');
        const letterDate = document.getElementById('letterDate');
        const letterSignature = document.getElementById('letterSignature');
        const letterInitials = document.getElementById('letterInitials');
        const envelopeHint = document.getElementById('envelopeHint');

        // Set letter content
        const promise = this.config?.promise || {};
        if (letterBody && promise.letterContent) {
            letterBody.textContent = promise.letterContent;
        }
        if (letterDate) {
            letterDate.textContent = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        if (letterSignature && promise.signature) {
            letterSignature.textContent = promise.signature;
        }
        if (letterInitials && promise.initials) {
            letterInitials.textContent = promise.initials;
        }

        // Envelope click handler
        envelope.addEventListener('click', () => {
            if (!this.envelopeOpened) {
                this.envelopeOpened = true;
                envelope.classList.add('open');
                
                // Show letter page
                setTimeout(() => {
                    letterPage.classList.add('visible');
                }, 300);

                // Hide hint
                if (envelopeHint) {
                    envelopeHint.style.opacity = '0';
                }

                // Enable next button
                const nextBtn = document.getElementById('nextButton');
                if (nextBtn) {
                    nextBtn.disabled = false;
                }

                // Show other sections after delay
                setTimeout(() => {
                    this.showSections();
                }, 2000);
            }
        });
    },

    showSections() {
        const promisesPanel = document.getElementById('promisesPanel');
        const endLDRPanel = document.getElementById('endLDRPanel');
        const finalePanel = document.getElementById('finalePanel');
        const navButtons = document.getElementById('navButtons');

        // Show promises panel
        if (promisesPanel) {
            promisesPanel.style.display = 'block';
            setTimeout(() => promisesPanel.scrollIntoView({ behavior: 'smooth' }), 100);
        }

        // Show end LDR panel after delay
        setTimeout(() => {
            if (endLDRPanel) {
                endLDRPanel.style.display = 'block';
            }
        }, 500);

        // Show finale panel after delay
        setTimeout(() => {
            if (finalePanel) {
                finalePanel.style.display = 'block';
                finalePanel.scrollIntoView({ behavior: 'smooth' });
            }
            // Hide nav buttons since finale has close button
            if (navButtons) {
                navButtons.style.display = 'none';
            }
        }, 1000);
    },

    populatePromises() {
        const promises = this.config?.promise?.promises || [];
        const container = document.getElementById('promisesList');
        if (!container) return;

        container.innerHTML = promises.map((promise) => `
            <div class="promise-item">
                <div class="promise-check">✓</div>
                <div class="promise-text">${promise}</div>
            </div>
        `).join('');
    },

    setupEndLDRCountdown() {
        const endDate = this.config?.promise?.endLDRDate;
        if (!endDate) {
            const panel = document.getElementById('endLDRPanel');
            if (panel) panel.style.display = 'none';
            return;
        }

        const updateCountdown = () => {
            const now = new Date().getTime();
            const target = new Date(endDate).getTime();
            const distance = target - now;

            const daysEl = document.getElementById('endDays');
            const dateEl = document.getElementById('endDate');

            if (daysEl) {
                if (distance < 0) {
                    daysEl.textContent = '0';
                } else {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    daysEl.textContent = days;
                }
            }

            if (dateEl) {
                dateEl.textContent = new Date(endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        };

        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, 86400000); // Update daily
    },

    destroy() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    PromisePage.init();
});

// Listen for config updates
window.addEventListener('message', (e) => {
    if (e.data?.type === 'CONFIG_UPDATE') {
        window.CONFIG = e.data.config;
        PromisePage.config = e.data.config;
        PromisePage.initializeLetter();
        PromisePage.populatePromises();
        PromisePage.setupEndLDRCountdown();
    }
});

// Cleanup
window.addEventListener('beforeunload', () => {
    PromisePage.destroy();
});
