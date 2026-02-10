// Command Prompt Romantic Letter Script

const LetterPage = {
    config: null,
    letterContent: '',
    typingSpeed: 45, // ms per character
    currentIndex: 0,
    isTyping: false,
    letterFinished: false,
    typingTimeout: null,

    init() {
        this.loadConfig();
        this.loadLetter();
        this.setupEventListeners();

        // Start typing after a brief delay if not already starting from message
        if (!this.typingTimeout) {
            this.typingTimeout = setTimeout(() => {
                this.startTyping();
            }, 800);
        }
    },

    loadConfig() {
        if (window.parent && window.parent !== window && window.parent.CONFIG) {
            this.config = window.parent.CONFIG;
        } else if (window.CONFIG) {
            this.config = window.CONFIG;
        } else {
            this.config = {
                promise: {
                    letterTitle: "A Letter Across the Miles",
                    letterContent: "My Dearest Love,\n\nEven though we're separated by thousands of kilometers, you're always in my heart. Every sunrise reminds me of your smile.\n\nI love you.\n\nForever yours,\n[Your Name]"
                }
            };
        }
    },

    loadLetter() {
        const promise = this.config?.promise || {};
        const title = promise.letterTitle || "A LETTER FOR YOU";
        const content = promise.letterContent || "My Dearest,\n\nDistance means so little when someone means so much.\n\nI love you.";
        const signature = promise.signature || "Forever yours";

        // Format the letter with ASCII art style
        const date = promise.letterDate || new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const from = promise.letterFrom || "My Heart";
        const to = promise.letterTo || "The One I Love";

        this.letterContent = `
================================================================================
                           ${title.toUpperCase()}
================================================================================

Date: ${date}
From: ${from}
To: ${to}

--------------------------------------------------------------------------------

${content}


${signature}


================================================================================
                             [END OF MESSAGE]
================================================================================
`;
    },

    startTyping() {
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        this.isTyping = true;
        this.currentIndex = 0;
        document.getElementById('letterText').textContent = '';
        this.typeNextChar();
    },

    typeNextChar() {
        if (!this.isTyping) return;

        const letterEl = document.getElementById('letterText');
        const cursorEl = document.getElementById('cursor');

        if (this.currentIndex < this.letterContent.length) {
            const char = this.letterContent[this.currentIndex];
            letterEl.textContent += char;

            this.currentIndex++;

            // Variable typing speed for realism
            let speed = this.typingSpeed;

            // Pause longer for newlines
            if (char === '\n') {
                speed = 150;
            }
            // Pause for punctuation
            else if ('.!?'.includes(char)) {
                speed = 200;
            }
            // Pause for commas
            else if (',;'.includes(char)) {
                speed = 100;
            }

            // Random variation
            speed += Math.random() * 20 - 10;

            // Auto-scroll to bottom
            const cmdContent = document.querySelector('.cmd-content');
            cmdContent.scrollTop = cmdContent.scrollHeight;

            this.typingTimeout = setTimeout(() => this.typeNextChar(), speed);
        } else {
            // Finished typing
            this.onLetterComplete();
        }
    },

    onLetterComplete() {
        this.isTyping = false;
        this.letterFinished = true;
        if (this.typingTimeout) clearTimeout(this.typingTimeout);

        // Hide cursor
        document.getElementById('cursor').style.display = 'none';

        // Show footer with prompt
        setTimeout(() => {
            const footer = document.getElementById('cmdFooter');
            if (footer) footer.style.display = 'block';

            // Auto-scroll to show the footer
            const cmdContent = document.querySelector('.cmd-content');
            if (cmdContent) cmdContent.scrollTop = cmdContent.scrollHeight;
        }, 500);

        // REMOVED auto-close setTimeout
    },

    sendCompleteMessage() {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'APP_COMPLETE',
                appId: 'letter',
                nextApp: null
            }, '*');
        }
    },

    setupEventListeners() {
        // Close button
        document.getElementById('closeBtn').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'NAVIGATE',
                direction: 'close'
            }, '*');
        });

        // Enter key to finish immediately
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (this.isTyping) {
                    // Skip to end
                    this.skipTyping();
                } else if (this.letterFinished) {
                    // Complete immediately
                    this.sendCompleteMessage();
                }
            }

            // Spacebar to toggle pause
            if (e.key === ' ' && this.isTyping) {
                e.preventDefault();
                // Could add pause functionality here
            }
        });

        // Click to skip
        document.querySelector('.cmd-content').addEventListener('click', () => {
            if (this.isTyping) {
                this.skipTyping();
            }
        });
    },

    skipTyping() {
        this.isTyping = false;
        document.getElementById('letterText').textContent = this.letterContent;
        this.onLetterComplete();

        // Scroll to bottom
        const cmdContent = document.querySelector('.cmd-content');
        cmdContent.scrollTop = cmdContent.scrollHeight;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    LetterPage.init();
});

// Listen for config updates
window.addEventListener('message', (e) => {
    if (e.data?.type === 'CONFIG_UPDATE') {
        const oldContent = LetterPage.letterContent;
        window.CONFIG = e.data.config;
        LetterPage.config = e.data.config;
        LetterPage.loadLetter();

        // Restart typing ONLY if content actually changed or if not finished
        if (oldContent !== LetterPage.letterContent || !LetterPage.letterFinished) {
            if (LetterPage.typingTimeout) clearTimeout(LetterPage.typingTimeout);

            const letterText = document.getElementById('letterText');
            if (letterText) letterText.textContent = '';

            const cursor = document.getElementById('cursor');
            if (cursor) cursor.style.display = 'inline-block';

            const footer = document.getElementById('cmdFooter');
            if (footer) footer.style.display = 'none';

            LetterPage.currentIndex = 0;
            LetterPage.isTyping = false;
            LetterPage.letterFinished = false;

            LetterPage.typingTimeout = setTimeout(() => {
                LetterPage.startTyping();
            }, 500);
        }
    }
});
