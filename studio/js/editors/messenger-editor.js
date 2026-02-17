/**
 * LDR Studio - Messenger Editor Module
 */
window.Editor = window.Editor || {};
window.Editor.MessengerEditor = {
    _config: {},

    init() {
        console.log('[MessengerEditor] Initializing...');
        const addBtn = document.getElementById('messenger-edit-btn');
        const saveBtn = document.getElementById('messenger-save-btn');

        if (addBtn) addBtn.onclick = () => this.open();
        if (saveBtn) saveBtn.onclick = () => this.save();

        this.refreshFromState();
    },

    refreshFromState() {
        if (window.StudioState?.config?.messenger) {
            this._config = JSON.parse(JSON.stringify(window.StudioState.config.messenger));
        }
    },

    open() {
        const modal = document.getElementById('messengerPickerModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.refreshFromState();
            this.render();
        }
    },

    close() {
        const modal = document.getElementById('messengerPickerModal');
        if (modal) modal.classList.add('hidden');
    },

    render() {
        const container = document.getElementById('messenger-editor-container');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-5xl mx-auto space-y-8 animate-fadeIn">
                <!-- Profile Section -->
                <div class="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-start gap-8">
                    <div class="relative group">
                        <div class="w-24 h-24 rounded-3xl bg-sky-50 flex items-center justify-center text-sky-500 overflow-hidden border-2 border-white shadow-lg">
                            <span id="prev-partner-avatar" class="${this._config.userAvatar ? 'hidden' : ''} text-4xl">${this._config.userAvatar || '❤️'}</span>
                            <img id="img-partner-avatar" src="${this._config.userAvatar || ''}" class="${this._config.userAvatar?.startsWith('http') ? '' : 'hidden'} w-full h-full object-cover">
                        </div>
                        <label class="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center cursor-pointer hover:bg-sky-50 transition-all border border-sky-100">
                            <span class="material-symbols-outlined text-sky-500 text-xl font-bold">photo_camera</span>
                            <input type="file" class="hidden" accept="image/*" onchange="window.Editor.MessengerEditor.handleAvatarUpload(this)">
                        </label>
                    </div>
                    <div class="flex-1 grid grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="block text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] ml-1">Nama Kamu (Pengirim 'Me')</label>
                            <input type="text" id="messenger-your-name" value="${this._config.yourName || 'Kamu'}" 
                                class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-base font-bold outline-none focus:border-rose-200 focus:bg-white transition-all">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] ml-1">Nama Pasangan (Pengirim 'Them')</label>
                            <input type="text" id="messenger-partner-name" value="${this._config.userName || ''}" 
                                class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-base font-bold outline-none focus:border-sky-200 focus:bg-white transition-all">
                        </div>
                        <div class="space-y-2 col-span-2">
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Status (Bio Pasangan)</label>
                            <input type="text" id="messenger-partner-status" value="${this._config.userStatus || ''}" 
                                class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-base font-medium italic outline-none focus:border-gray-200 focus:bg-white transition-all">
                        </div>
                    </div>
                </div>

                <!-- Chat History Section -->
                <div class="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-sky-500">forum</span>
                            <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Riwayat Pesan</h4>
                        </div>
                        <button onclick="window.Editor.MessengerEditor.addMessage()" 
                            class="bg-sky-500 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 flex items-center gap-2 active:scale-95">
                            <span class="material-symbols-outlined text-sm">add</span> Tambah Pesan
                        </button>
                    </div>

                    <div id="messenger-chat-list" class="p-8 space-y-6 max-h-[500px] overflow-y-auto bg-slate-50/50">
                        ${this.renderMessageBubbles()}
                    </div>
                </div>
            </div>
        `;
    },

    renderMessageBubbles() {
        if (!this._config.chats || this._config.chats.length === 0) {
            return `<div class="text-center py-10 text-gray-400 italic text-sm">Belum ada pesan. Mulai ngobrol!</div>`;
        }

        // We assume one chat day for now for simplicity in editor, or use the first one
        const chatDay = this._config.chats[0];
        if (!chatDay) return '';

        return chatDay.messages.map((msg, idx) => `
            <div class="flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} group">
                <div class="relative max-w-[80%]">
                    <div class="${msg.sender === 'me' ? 'bg-rose-500 text-white rounded-t-2xl rounded-bl-2xl' : 'bg-white text-gray-800 rounded-t-2xl rounded-br-2xl shadow-sm'} p-4 pr-10">
                        <div class="text-[10px] font-black uppercase tracking-widest ${msg.sender === 'me' ? 'text-rose-200' : 'text-sky-500'} mb-1">
                            ${msg.sender === 'me' ? (this._config.yourName || 'Kamu') : (this._config.userName || 'Pasangan')}
                        </div>
                        <textarea 
                            oninput="window.Editor.MessengerEditor.updateMsgText(${idx}, this.value)"
                            class="bg-transparent border-none p-0 w-full resize-none text-sm font-medium outline-none focus:ring-0 leading-relaxed" 
                            rows="1">${msg.text}</textarea>
                        <div class="text-[9px] mt-2 opacity-60 font-mono">${msg.time}</div>
                    </div>
                    
                    <!-- Controls -->
                    <div class="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.Editor.MessengerEditor.toggleSender(${idx})" 
                            class="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-sky-500" title="Ganti Pengirim">
                            <span class="material-symbols-outlined text-xs">swap_horiz</span>
                        </button>
                        <button onclick="window.Editor.MessengerEditor.removeMessage(${idx})" 
                            class="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500" title="Hapus">
                            <span class="material-symbols-outlined text-xs">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    handleAvatarUpload(input) {
        if (!input.files || !input.files[0]) return;
        EditorUX.handleMediaUpload(input, (url) => {
            this._config.userAvatar = url;
            this.render();
            this.syncToState();
        });
    },

    updateMsgText(idx, val) {
        if (this._config.chats && this._config.chats[0]) {
            this._config.chats[0].messages[idx].text = val;
            this.syncToState();
        }
    },

    toggleSender(idx) {
        if (this._config.chats && this._config.chats[0]) {
            const msg = this._config.chats[0].messages[idx];
            msg.sender = msg.sender === 'me' ? 'them' : 'me';
            msg.name = msg.sender === 'me' ? 'You' : (this._config.userName || 'Partner');
            this.render();
            this.syncToState();
        }
    },

    addMessage() {
        if (!this._config.chats) this._config.chats = [{ date: new Date().toLocaleDateString(), messages: [] }];
        if (this._config.chats.length === 0) this._config.chats.push({ date: new Date().toLocaleDateString(), messages: [] });

        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        this._config.chats[0].messages.push({
            sender: 'them',
            name: this._config.userName || 'Partner',
            text: 'Halo halo! Apa kabar? 😊',
            time: timeStr
        });
        this.render();
        this.syncToState();
    },

    removeMessage(idx) {
        if (this._config.chats && this._config.chats[0]) {
            this._config.chats[0].messages.splice(idx, 1);
            this.render();
            this.syncToState();
        }
    },

    syncToState() {
        if (window.StudioState) {
            const yourName = document.getElementById('messenger-your-name').value;
            const partnerName = document.getElementById('messenger-partner-name').value;
            const partnerStatus = document.getElementById('messenger-partner-status').value;

            this._config.yourName = yourName;
            this._config.userName = partnerName;
            this._config.userStatus = partnerStatus;

            window.StudioState.config.messenger = JSON.parse(JSON.stringify(this._config));
            window.StudioState.sync();
        }
    },

    save() {
        this.syncToState();
        if (window.StudioState) {
            window.StudioState.save();
            if (typeof EditorUX !== 'undefined') EditorUX.showNotification('Messenger sudah LIVE! 🚀');
            this.close();
        }
    }
};
