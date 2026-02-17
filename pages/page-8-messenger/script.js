// Love Messenger - Retro Chat Script

const MessengerPage = {
    config: null,
    chatHistory: [],

    init() {
        this.loadConfig();
        this.loadChatHistory();
        this.updateProfile();
        this.renderChat();
        this.setupEventListeners();
        this.scrollToBottom();
    },

    updateProfile() {
        if (!this.config?.messenger) return;

        const { userName, userAvatar, userStatus } = this.config.messenger;

        const nameEl = document.getElementById('partnerName');
        const avatarEl = document.getElementById('partnerAvatar');
        const statusEl = document.getElementById('partnerStatus');

        if (nameEl && userName) nameEl.textContent = userName;
        if (avatarEl) {
            if (userAvatar && (userAvatar.startsWith('http') || userAvatar.startsWith('data:'))) {
                avatarEl.innerHTML = `<img src="${userAvatar}" class="w-full h-full object-cover rounded-md">`;
            } else {
                avatarEl.textContent = userAvatar || '❤️';
            }
        }
        if (statusEl && userStatus) statusEl.textContent = userStatus;
    },

    loadConfig() {
        if (window.parent && window.parent !== window && window.parent.CONFIG) {
            this.config = window.parent.CONFIG;
        } else if (window.CONFIG) {
            this.config = window.CONFIG;
        } else {
            this.config = {};
        }
    },

    loadChatHistory() {
        // Use messenger key, fallback to default
        this.chatHistory = this.config?.messenger?.chats || [
            {
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                messages: [
                    { sender: "them", name: "Them", text: "Hey! I'm so glad we're doing this. ❤️", time: "10:00" },
                    { sender: "me", name: "You", text: "Me too! Missing you tons. 😊", time: "10:05" }
                ]
            }
        ];
    },

    renderChat() {
        const container = document.getElementById('chatHistory');
        if (!container) return;

        const msgConfig = this.config?.messenger || {};
        const themAvatar = msgConfig.userAvatar;
        const meAvatar = msgConfig.yourAvatar || '😊';

        let html = '';

        this.chatHistory.forEach((day, dayIndex) => {
            html += `
                <div class="chat-date">
                    <span>${day.date}</span>
                </div>
            `;

            day.messages.forEach((msg, msgIndex) => {
                const avatar = msg.sender === 'me' ? meAvatar : themAvatar;
                const isImg = avatar && (avatar.startsWith('http') || avatar.startsWith('data:'));
                const avatarHtml = isImg ? `<img src="${avatar}">` : avatar || '❤️';

                html += `
                    <div class="chat-message ${msg.sender}" style="animation-delay: ${(dayIndex * 4 + msgIndex) * 0.1}s">
                        <div class="message-avatar">${avatarHtml}</div>
                        <div class="message-bubble">
                            <div class="message-sender">${msg.sender === 'me' ? 'Kamu' : (msgConfig.userName || 'Pasangan')}</div>
                            <div class="message-text">${this.escapeHtml(msg.text)}</div>
                            <div class="message-time">${msg.time}</div>
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    scrollToBottom() {
        const container = document.getElementById('chatContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },

    setupEventListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.parent.postMessage({ type: 'NAVIGATE', direction: 'close' }, '*');
        });

        // Continue/Next button
        document.getElementById('continueButton').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'APP_COMPLETE',
                appId: 'messenger',
                nextApp: 'sweeper'
            }, '*');
        });

        // Send button (just for visual effect)
        document.getElementById('nextBtn').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'APP_COMPLETE',
                appId: 'messenger',
                nextApp: 'sweeper'
            }, '*');
        });

        // Keyboard shortcut - Enter to continue
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                window.parent.postMessage({
                    type: 'APP_COMPLETE',
                    appId: 'messenger',
                    nextApp: 'sweeper'
                }, '*');
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    MessengerPage.init();
});

// Listen for config updates
window.addEventListener('message', (e) => {
    if (e.data?.type === 'CONFIG_UPDATE') {
        window.CONFIG = e.data.config;
        MessengerPage.config = e.data.config;
        MessengerPage.loadChatHistory();
        MessengerPage.updateProfile();
        MessengerPage.renderChat();
        MessengerPage.scrollToBottom();
    }
});
