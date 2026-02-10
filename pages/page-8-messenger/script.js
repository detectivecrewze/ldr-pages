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
        if (avatarEl && userAvatar) avatarEl.textContent = userAvatar;
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
        // Default romantic chat history
        this.chatHistory = this.config?.messenger?.chats || [
            {
                date: "January 15, 2023",
                messages: [
                    { sender: "them", name: "Them", text: "Hey, I really enjoyed our coffee date today! ☕", time: "19:32" },
                    { sender: "me", name: "You", text: "Me too! Your smile made my whole day 😊", time: "19:35" },
                    { sender: "them", name: "Them", text: "Can we do this again soon?", time: "19:36" },
                    { sender: "me", name: "You", text: "Anytime! How about this weekend?", time: "19:38" }
                ]
            },
            {
                date: "June 20, 2023",
                messages: [
                    { sender: "them", name: "Them", text: "I'm at the airport now... 😢", time: "08:15" },
                    { sender: "me", name: "You", text: "I'm going to miss you so much", time: "08:16" },
                    { sender: "them", name: "Them", text: "Distance is just a test to see how far love can travel 💕", time: "08:18" },
                    { sender: "me", name: "You", text: "I'll be waiting for you. Always.", time: "08:20" },
                    { sender: "them", name: "Them", text: "I love you ❤️", time: "08:22" }
                ]
            },
            {
                date: "December 25, 2024",
                messages: [
                    { sender: "me", name: "You", text: "Merry Christmas! 🎄", time: "09:00" },
                    { sender: "them", name: "Them", text: "Merry Christmas my love! Finally spending it together!", time: "09:02" },
                    { sender: "me", name: "You", text: "Best Christmas gift ever - having you here 💝", time: "09:05" },
                    { sender: "them", name: "Them", text: "I brought something for you... check under the tree! 🎁", time: "09:10" }
                ]
            },
            {
                date: "February 9, 2026",
                messages: [
                    { sender: "them", name: "Them", text: "Counting down the days until we're together forever 💍", time: "23:45" },
                    { sender: "me", name: "You", text: "Only a few more months! We made it! 🎉", time: "23:47" },
                    { sender: "them", name: "Them", text: "Through every timezone, every video call, every goodnight text...", time: "23:50" },
                    { sender: "me", name: "You", text: "Worth every second. I love you! ❤️", time: "23:52" },
                    { sender: "them", name: "Them", text: "I love you more! Forever and always 💕", time: "23:55" }
                ]
            }
        ];
    },

    renderChat() {
        const container = document.getElementById('chatHistory');
        if (!container) return;

        const themAvatar = this.config?.messenger?.userAvatar || '❤️';
        const meAvatar = this.config?.messenger?.yourAvatar || '😊';

        let html = '';

        this.chatHistory.forEach((day, dayIndex) => {
            // Date separator
            html += `
                <div class="chat-date">
                    <span>${day.date}</span>
                </div>
            `;

            // Messages for this day
            day.messages.forEach((msg, msgIndex) => {
                const avatar = msg.sender === 'me' ? meAvatar : themAvatar;
                html += `
                    <div class="chat-message ${msg.sender}" style="animation-delay: ${(dayIndex * 4 + msgIndex) * 0.1}s">
                        <div class="message-avatar">${avatar}</div>
                        <div class="message-bubble">
                            <div class="message-sender">${msg.name}</div>
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
