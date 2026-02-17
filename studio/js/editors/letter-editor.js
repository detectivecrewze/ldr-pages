/**
 * LDR Studio - Love Letter Editor Module
 */
window.Editor = window.Editor || {};
window.Editor.LetterEditor = {
    _config: {},

    init() {
        console.log('[LetterEditor] Initializing...');
        const addBtn = document.getElementById('letter-edit-btn');
        const saveBtn = document.getElementById('letter-save-btn');

        if (addBtn) addBtn.onclick = () => this.open();
        if (saveBtn) saveBtn.onclick = () => this.save();

        this.refreshFromState();
    },

    refreshFromState() {
        if (window.StudioState?.config?.promise) {
            this._config = JSON.parse(JSON.stringify(window.StudioState.config.promise));
        }
    },

    open() {
        const modal = document.getElementById('letterPickerModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.refreshFromState();
            this.render();
        }
    },

    close() {
        const modal = document.getElementById('letterPickerModal');
        if (modal) modal.classList.add('hidden');
    },

    render() {
        const container = document.getElementById('letter-editor-container');
        if (!container) return;

        const config = this._config;

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-10 animate-fadeIn">
                <!-- Header Info -->
                <div class="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div class="absolute -right-20 -top-20 w-64 h-64 bg-rose-50 rounded-full blur-3xl"></div>
                    
                    <div class="grid grid-cols-2 gap-8 mb-8 relative z-10">
                        <div>
                            <label class="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 ml-1">Dari (Sender)</label>
                            <input type="text" id="edit-letter-from" value="${config.letterFrom || ''}" 
                                class="w-full px-5 py-4 bg-rose-50/30 border-2 border-rose-50 rounded-2xl text-lg font-bold outline-none focus:border-rose-200 focus:bg-white transition-all">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 ml-1">Untuk (Recipient)</label>
                            <input type="text" id="edit-letter-to" value="${config.letterTo || ''}" 
                                class="w-full px-5 py-4 bg-rose-50/30 border-2 border-rose-50 rounded-2xl text-lg font-bold outline-none focus:border-rose-200 focus:bg-white transition-all">
                        </div>
                    </div>

                    <div class="relative z-10">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Judul Surat</label>
                        <input type="text" id="edit-letter-title" value="${config.letterTitle || ''}" 
                            class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold outline-none focus:border-rose-200 transition-all">
                    </div>
                </div>

                <!-- Content Area -->
                <div class="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Isi Surat Cinta (Message)</label>
                    <textarea id="edit-letter-content" rows="12"
                        class="w-full px-8 py-8 bg-slate-50/50 border-2 border-slate-50 rounded-[2.5rem] text-lg font-medium leading-[2] outline-none focus:border-rose-200 focus:bg-white transition-all resize-none shadow-inner"
                        placeholder="Tuliskan semua perasaanmu di sini...">${config.letterContent || ''}</textarea>
                    <p class="text-[11px] text-gray-400 mt-6 px-4 italic leading-relaxed">Surat ini akan muncul dengan animasi tulisan tangan yang cantik di bagian akhir website.</p>
                </div>

            </div>
        `;
    },

    syncToState() {
        if (window.StudioState) {
            this._config.letterFrom = document.getElementById('edit-letter-from').value;
            this._config.letterTo = document.getElementById('edit-letter-to').value;
            this._config.letterTitle = document.getElementById('edit-letter-title').value;
            this._config.letterContent = document.getElementById('edit-letter-content').value;

            window.StudioState.config.promise = JSON.parse(JSON.stringify(this._config));
            window.StudioState.sync();
        }
    },

    save() {
        this.syncToState();
        if (window.StudioState) {
            window.StudioState.save();
            if (typeof EditorUX !== 'undefined') EditorUX.showNotification('Surat Cinta sudah LIVE! 💖');
            this.close();
        }
    }
};
