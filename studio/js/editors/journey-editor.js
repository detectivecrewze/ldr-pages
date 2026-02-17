/**
 * LDR Studio - Journey Map Editor Module
 * Handles editing milestones and map pins in a 3-pane premium layout.
 * Language: Bahasa Indonesia
 */
window.Editor = window.Editor || {};
window.Editor.JourneyEditor = {
    _activeMilestones: [],
    _activePins: [],
    _editingIndex: -1,
    _currentTab: 'pins', // 'pins' or 'milestones'

    init() {
        console.log('[JourneyEditor] Initializing...');
        const addBtn = document.getElementById('map-add-btn');
        const saveBtn = document.getElementById('map-save-btn');
        const confirmBtn = document.getElementById('map-update-confirm-btn');

        if (addBtn) addBtn.onclick = () => this.open();
        if (saveBtn) saveBtn.onclick = () => this.save();
        if (confirmBtn) confirmBtn.onclick = () => this.confirmEdit();

        this.refreshFromState();
    },

    refreshFromState() {
        if (window.StudioState?.config?.journeyMap) {
            const map = window.StudioState.config.journeyMap;
            this._activeMilestones = JSON.parse(JSON.stringify(map.milestones || []));
            this._activePins = JSON.parse(JSON.stringify(map.pins || []));
        }
    },

    open() {
        const modal = document.getElementById('journeyManagerModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.refreshFromState();
            this.switchTab('pins');
        }
    },

    close() {
        const modal = document.getElementById('journeyManagerModal');
        if (modal) modal.classList.add('hidden');
    },

    switchTab(tab) {
        this._currentTab = tab;
        this._editingIndex = -1;
        this.renderSidebar();
        this.renderList();
        this.closeEditorPanel();
    },

    renderSidebar() {
        const sidebar = document.getElementById('modal-map-sidebar');
        if (!sidebar) return;

        const menuItems = [
            { id: 'pins', icon: 'location_on', label: 'Titik Lokasi (Pins)' }
        ];

        sidebar.innerHTML = menuItems.map(item => `
            <div class="px-5 py-3.5 mb-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${this._currentTab === item.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600'}"
                 onclick="window.Editor.JourneyEditor.switchTab('${item.id}')">
                <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
                <span class="text-sm font-bold">${item.label}</span>
            </div>
        `).join('');
    },

    renderList() {
        const container = document.getElementById('modal-map-active-list');
        const header = document.getElementById('modal-map-list-header');
        if (!container || !header) return;

        let items = this._activePins;
        let title = "Daftar Lokasi Pin";

        header.innerHTML = `
            <div class="flex items-center justify-between w-full mb-6">
                <div>
                    <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">${title}</h4>
                    <p class="text-[11px] text-gray-400 italic">${items.length} lokasi aktif</p>
                </div>
                <button onclick="window.Editor.JourneyEditor.addNewItem()" 
                        class="bg-amber-500 text-white px-5 py-2 rounded-full text-[11px] font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center gap-2 active:scale-95">
                    <span class="material-symbols-outlined text-[16px]">add</span> Tambah Pin
                </button>
            </div>
        `;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <span class="material-symbols-outlined text-gray-200 text-5xl mb-4">map</span>
                    <p class="text-gray-400 text-sm">Belum ada pin lokasi.<br>Mulai tentukan titik ceritamu!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map((item, idx) => `
            <div class="bg-white border-2 ${this._editingIndex === idx ? 'border-amber-400 ring-4 ring-amber-50' : 'border-gray-50'} rounded-2xl p-4 transition-all shadow-sm group">
                <div class="flex items-center gap-3">
                    <!-- Reorder Controls -->
                    <div class="flex flex-col gap-1">
                        <button onclick="window.Editor.JourneyEditor.moveItem(${idx}, -1)" class="w-6 h-6 rounded-md hover:bg-amber-50 text-gray-300 hover:text-amber-500 flex items-center justify-center transition-all ${idx === 0 ? 'opacity-20 pointer-events-none' : ''}">
                            <span class="material-symbols-outlined text-lg">keyboard_arrow_up</span>
                        </button>
                        <button onclick="window.Editor.JourneyEditor.moveItem(${idx}, 1)" class="w-6 h-6 rounded-md hover:bg-amber-50 text-gray-300 hover:text-amber-500 flex items-center justify-center transition-all ${idx === items.length - 1 ? 'opacity-20 pointer-events-none' : ''}">
                            <span class="material-symbols-outlined text-lg">keyboard_arrow_down</span>
                        </button>
                    </div>

                    <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0 cursor-pointer" onclick="window.Editor.JourneyEditor.openEdit(${idx})">
                        <span class="material-symbols-outlined text-xl">location_on</span>
                    </div>
                    <div class="flex-1 min-w-0 cursor-pointer" onclick="window.Editor.JourneyEditor.openEdit(${idx})">
                        <div class="text-[13px] font-bold text-gray-900 truncate">${item.label || 'Tanpa Nama'}</div>
                        <div class="text-[10px] text-gray-400 truncate font-mono">${item.coords ? item.coords.join(', ') : 'Belum diatur'}</div>
                    </div>
                    <button onclick="window.Editor.JourneyEditor.removeItem(${idx})" 
                            class="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    openEdit(index) {
        this._editingIndex = index;
        const items = this._currentTab === 'pins' ? this._activePins : this._activeMilestones;
        const item = items[index];
        const container = document.getElementById('map-editor-form');
        const emptyState = document.getElementById('map-editor-empty');
        const editorPanel = document.getElementById('map-editor-panel');

        if (!container || !emptyState || !editorPanel) return;

        emptyState.classList.add('hidden');
        editorPanel.classList.remove('hidden');

        if (this._currentTab === 'pins') {
            container.innerHTML = `
                <div class="space-y-6">
                    <!-- Label -->
                    <div class="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <label class="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 ml-1">Label Lokasi</label>
                        <input type="text" id="edit-map-label" value="${item.label || ''}" 
                            oninput="window.Editor.JourneyEditor.updateField('label', this.value)"
                            class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-base font-bold outline-none focus:border-amber-200 focus:bg-white transition-all">
                    </div>

                    <!-- Coordinates -->
                    <div class="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div class="flex items-center justify-between mb-3 ml-1">
                            <label class="block text-[10px] font-black text-amber-500 uppercase tracking-widest">Koordinat Lokasi</label>
                            <button onclick="window.mapPicker.open('edit-map-coords')" class="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">map</span> Pilih dari Peta
                            </button>
                        </div>
                        <input type="text" id="edit-map-coords" value="${item.coords ? item.coords.join(', ') : ''}" 
                            oninput="window.Editor.JourneyEditor.updateField('coords', this.value)"
                            class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-base font-mono outline-none focus:border-amber-200 transition-all font-bold" placeholder="-6.2088, 106.8456">
                    </div>

                    <!-- Note -->
                    <div class="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <label class="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 ml-1">Catatan Lokasi</label>
                        <textarea id="edit-map-note" rows="3"
                            oninput="window.Editor.JourneyEditor.updateField('note', this.value)"
                            class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-medium outline-none focus:border-amber-200 transition-all resize-none italic">${item.note || ''}</textarea>
                    </div>

                    <!-- Photo -->
                    <div class="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <label class="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 ml-1">Foto Momen</label>
                        <div class="flex gap-4 items-center">
                            <div class="relative w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group flex-shrink-0">
                                <img id="prev-map-photo" src="${item.photo || ''}" class="w-full h-full object-cover ${item.photo ? '' : 'hidden'}">
                                <span class="material-symbols-outlined text-gray-300 ${item.photo ? 'hidden' : ''}">image</span>
                                <label class="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <span class="material-symbols-outlined text-sm">upload</span>
                                    <input type="file" class="hidden" accept="image/*" onchange="window.Editor.JourneyEditor.handlePhotoUpload(this)">
                                </label>
                            </div>
                            <div class="flex-1 min-w-0">
                                <input type="text" id="edit-map-photo" value="${item.photo || ''}" 
                                    oninput="window.Editor.JourneyEditor.updateField('photo', this.value)"
                                    class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-mono outline-none focus:border-amber-200 transition-all truncate" placeholder="Atau tempel URL di sini...">
                                <p class="text-[9px] text-gray-400 mt-2 ml-1 italic">Mendukung link foto atau upload langsung (Base64)</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <label class="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 ml-1">Nama Momen (Event)</label>
                        <input type="text" id="edit-map-event" value="${item.event || ''}" 
                            oninput="window.Editor.JourneyEditor.updateField('event', this.value)"
                            class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-base font-bold outline-none focus:border-amber-200 focus:bg-white transition-all">
                    </div>
                    <div class="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <label class="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 ml-1">Tanggal</label>
                        <input type="date" id="edit-map-date" value="${item.date || ''}" 
                            oninput="window.Editor.JourneyEditor.updateField('date', this.value)"
                            class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl font-bold outline-none focus:border-amber-200 transition-all">
                    </div>
                    <div class="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <label class="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 ml-1">Tempat (Location Text)</label>
                        <input type="text" id="edit-map-loc" value="${item.location || ''}" 
                            oninput="window.Editor.JourneyEditor.updateField('location', this.value)"
                            class="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-bold outline-none focus:border-amber-200 transition-all">
                    </div>
                </div>
            `;
        }
        this.renderList();
    },

    moveItem(index, direction) {
        const items = this._activePins;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= items.length) return;

        // Swap
        const [movedItem] = items.splice(index, 1);
        items.splice(newIndex, 0, movedItem);

        // Update editing index if needed
        if (this._editingIndex === index) this._editingIndex = newIndex;
        else if (this._editingIndex === newIndex) this._editingIndex = index;

        this.renderList();
        this.syncToState();
    },

    addNewItem() {
        this._activePins.unshift({
            label: "Lokasi Baru",
            coords: [-6.2088, 106.8456],
            date: new Date().toISOString().split('T')[0],
            note: "Momen spesial di sini...",
            photo: ""
        });
        this._editingIndex = 0;
        this.renderList();
        this.openEdit(0);
    },

    removeItem(index) {
        if (!confirm('Hapus pin lokasi ini?')) return;
        this._activePins.splice(index, 1);
        if (this._editingIndex === index) this.closeEditorPanel();
        else if (this._editingIndex > index) this._editingIndex--;
        this.renderList();
        this.syncToState();
    },

    updateField(key, val) {
        if (this._editingIndex === -1) return;
        const item = this._activePins[this._editingIndex];

        if (key === 'coords') {
            const parts = val.split(',').map(v => parseFloat(v.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                item.coords = parts;
            }
        } else {
            item[key] = val;
        }

        // Live update the list item
        this.renderList();
        this.syncToState();
    },

    handlePhotoUpload(input) {
        if (!input.files || !input.files[0] || this._editingIndex === -1) return;

        EditorUX.handleMediaUpload(input, (url) => {
            const item = this._activePins[this._editingIndex];
            item.photo = url;

            // Update UI immediately
            const prev = document.getElementById('prev-map-photo');
            const photoInput = document.getElementById('edit-map-photo');
            if (prev) {
                prev.src = url;
                prev.classList.remove('hidden');
                prev.parentElement.querySelector('.material-symbols-outlined')?.classList.add('hidden');
            }
            if (photoInput) {
                photoInput.value = url;
            }

            this.renderList();
            this.syncToState();
        });
    },

    confirmEdit() {
        // Now mostly redundant due to real-time updateField, 
        // but kept for final confirmation/visual feedback.
        if (typeof EditorUX !== 'undefined') EditorUX.showNotification('Data perjalanan diupdate! 🗺️');
        this.renderList();
        this.syncToState();
    },

    closeEditorPanel() {
        this._editingIndex = -1;
        const emptyState = document.getElementById('map-editor-empty');
        const editorPanel = document.getElementById('map-editor-panel');
        if (emptyState && editorPanel) {
            emptyState.classList.remove('hidden');
            editorPanel.classList.add('hidden');
        }
    },

    syncToState() {
        if (window.StudioState) {
            window.StudioState.config.journeyMap.pins = JSON.parse(JSON.stringify(this._activePins));
            // Keep milestones empty or as is if you want to keep data, 
            // but the user wants to remove the feature.
            window.StudioState.config.journeyMap.milestones = [];
            window.StudioState.sync();
        }
    },

    save() {
        this.syncToState();
        if (window.StudioState) {
            window.StudioState.save();
            if (typeof EditorUX !== 'undefined') EditorUX.showNotification('Peta Perjalanan sudah LIVE! 🚀');
            this.close();
        }
    }
};
