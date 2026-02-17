/**
 * LDR Studio - Video Vault Editor Module
 * Simplified "List-Style" Premium Editor
 */
window.Editor = window.Editor || {};
window.Editor.VideoEditor = {
    _activeVideos: [],
    _editingIndex: -1,

    init() {
        console.log('[VideoEditor] Initializing...');
        const addBtn = document.getElementById('video-add-btn');
        const saveBtn = document.getElementById('video-save-btn');

        if (addBtn) addBtn.onclick = () => this.open();
        if (saveBtn) saveBtn.onclick = () => this.save();

        this.refreshFromState();
    },

    refreshFromState() {
        if (window.StudioState?.config?.videos) {
            this._activeVideos = JSON.parse(JSON.stringify(window.StudioState.config.videos || []));
        }
    },

    open() {
        const modal = document.getElementById('videoPickerModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.refreshFromState();
            this.render();
            this.closeEditorPanel();
        }
    },

    close() {
        const modal = document.getElementById('videoPickerModal');
        if (modal) modal.classList.add('hidden');
    },

    render() {
        const container = document.getElementById('video-editor-container');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-32">
                <!-- Header Area -->
                <div class="flex items-end justify-between border-b-2 border-slate-100 pb-8">
                    <div>
                        <h4 class="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Manajemen Vault</h4>
                        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Koleksi Video Kita</h2>
                        <p class="text-sm text-slate-400 font-medium mt-1">Daftar video yang tersimpan di brankas digital kalian.</p>
                    </div>
                    <button onclick="window.Editor.VideoEditor.addNewVideo()" 
                            class="group bg-indigo-600 text-white pl-6 pr-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95">
                        <span class="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add_circle</span> Tambah Video
                    </button>
                </div>

                <!-- Video List (Simplified & Premium) -->
                <div class="space-y-4" id="video-list-container">
                    ${this.renderVideoItems()}
                </div>

                <!-- Editor Panel (Floating Modal Style inside container) -->
                <div id="video-edit-panel" class="${this._editingIndex === -1 ? 'hidden' : ''} fixed inset-0 z-[5000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 transition-all">
                    <div class="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
                        <div class="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <span class="material-symbols-outlined">edit_square</span>
                                </div>
                                <div>
                                    <h3 class="font-black text-slate-800 text-xl tracking-tight">Edit Detail Video</h3>
                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Update informasi memori kalian</p>
                                </div>
                            </div>
                            <button onclick="window.Editor.VideoEditor.closeEditorPanel()" class="w-12 h-12 rounded-2xl hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                                <span class="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>

                        <div class="p-10 space-y-8 overflow-y-auto max-h-[60vh]">
                            <div id="video-editor-form">
                                ${this._editingIndex !== -1 ? this.renderEditForm() : ''}
                            </div>
                        </div>

                        <div class="p-10 bg-slate-50 border-t border-gray-100 flex justify-end gap-4">
                            <button onclick="window.Editor.VideoEditor.closeEditorPanel()" 
                                class="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                                Batal
                            </button>
                            <button onclick="window.Editor.VideoEditor.confirmEdit()" 
                                class="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95">
                                <span class="material-symbols-outlined text-lg">save</span> Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderVideoItems() {
        if (this._activeVideos.length === 0) {
            return `
                <div class="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
                    <div class="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-200 mx-auto mb-6">
                        <span class="material-symbols-outlined text-5xl">movie_filter</span>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800">Brankas Kosong</h3>
                    <p class="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Upload video memori kalian sekarang untuk mengisi vault ini.</p>
                </div>
            `;
        }

        return this._activeVideos.map((item, idx) => `
            <div class="group bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all flex items-center gap-6">
                <div class="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-slate-200">
                    <span class="material-symbols-outlined text-3xl">play_circle</span>
                </div>
                <div class="flex-1 min-w-0" onclick="window.Editor.VideoEditor.openEdit(${idx})">
                    <h5 class="font-black text-slate-800 text-lg truncate mb-1">${item.title || 'Tanpa Judul'}</h5>
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md truncate max-w-[200px]">${item.url || 'Belum ada link'}</span>
                        <span class="text-xs text-slate-400 truncate flex-1">• ${item.description || 'Tidak ada deskripsi'}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onclick="window.Editor.VideoEditor.openEdit(${idx})" class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                        <span class="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onclick="window.Editor.VideoEditor.removeVideo(${idx})" class="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderEditForm() {
        const item = this._activeVideos[this._editingIndex];
        return `
            <div class="space-y-8">
                <!-- Title -->
                <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Video</label>
                    <input type="text" id="edit-video-title" value="${item.title || ''}" 
                        placeholder="Contoh: Vlog Jalan-Jalan Kita..."
                        class="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl text-base font-bold outline-none focus:border-indigo-100 focus:bg-white transition-all">
                </div>
                
                <!-- URL -->
                <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Video / Source</label>
                    <div class="flex gap-4">
                        <input type="text" id="edit-video-url" value="${item.url || ''}" 
                            placeholder="https://video-link-kalian.mp4"
                            class="flex-1 px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl text-sm font-mono outline-none focus:border-indigo-100 focus:bg-white transition-all">
                        <label class="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex-shrink-0">
                            <span class="material-symbols-outlined">video_file</span>
                            <input type="file" class="hidden" accept="video/*,audio/*" onchange="window.Editor.VideoEditor.handleUpload(this)">
                        </label>
                    </div>
                    <p class="text-[10px] text-slate-400 ml-1 italic">*Mendukung URL langsung atau upload via Cloudflare.</p>
                </div>

                <!-- Description -->
                <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Ringkas</label>
                    <textarea id="edit-video-desc" rows="3"
                        placeholder="Ceritakan sedikit tentang video ini..."
                        class="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl text-sm font-medium outline-none focus:border-indigo-100 focus:bg-white transition-all resize-none shadow-sm">${item.description || ''}</textarea>
                </div>
            </div>
        `;
    },

    openEdit(index) {
        this._editingIndex = index;
        this.render();
    },

    addNewVideo() {
        this._activeVideos.unshift({
            id: Date.now(),
            title: "Memori Baru 🎬",
            url: "",
            description: "Momen indah kita di sini..."
        });
        this._editingIndex = 0;
        this.render();
    },

    handleUpload(input) {
        if (!input.files || !input.files[0] || this._editingIndex === -1) return;
        EditorUX.handleMediaUpload(input, (url) => {
            const item = this._activeVideos[this._editingIndex];
            item.url = url;

            const urlInp = document.getElementById('edit-video-url');
            if (urlInp) urlInp.value = url;

            EditorUX.showNotification('Video berhasil diunggah! ✨');
            this.syncToState();
        });
    },

    removeVideo(index) {
        if (!confirm('Hapus video ini dari vault?')) return;
        this._activeVideos.splice(index, 1);
        if (this._editingIndex === index) this.closeEditorPanel();
        else if (this._editingIndex > index) this._editingIndex--;
        this.render();
        this.syncToState();
    },

    confirmEdit() {
        if (this._editingIndex === -1) return;
        const item = this._activeVideos[this._editingIndex];
        item.title = document.getElementById('edit-video-title').value;
        item.url = document.getElementById('edit-video-url').value;
        item.description = document.getElementById('edit-video-desc').value;

        EditorUX.showNotification('Data video berhasil disimpan! ✅');
        this.closeEditorPanel();
        this.syncToState();
    },

    closeEditorPanel() {
        this._editingIndex = -1;
        this.render();
    },

    syncToState() {
        if (window.StudioState) {
            // Sanitize data (remove thumbnail/duration as requested)
            window.StudioState.config.videos = this._activeVideos.map(v => ({
                id: v.id || Date.now(),
                title: v.title || 'Tanpa Judul',
                url: v.url || '',
                description: v.description || ''
            }));
            window.StudioState.sync();
        }
    },

    save() {
        this.syncToState();
        if (window.StudioState) {
            window.StudioState.save();
            EditorUX.showNotification('Brankas Video sudah LIVE! 🚀');
            this.close();
        }
    }
};
