/**
 * LDR Studio - Bucket List Editor Module
 */
window.Editor = window.Editor || {};
window.Editor.BucketEditor = {
    _activeItems: [],
    _editingIndex: -1,
    _currentCategory: 'food', // 'food', 'adventure', 'daily'

    init() {
        console.log('[BucketEditor] Initializing...');
        const addBtn = document.getElementById('bucket-add-btn');
        const saveBtn = document.getElementById('bucket-save-btn');
        const confirmBtn = document.getElementById('bucket-update-confirm-btn');

        if (addBtn) addBtn.onclick = () => this.open();
        if (saveBtn) saveBtn.onclick = () => this.save();
        if (confirmBtn) confirmBtn.onclick = () => this.confirmEdit();

        this.refreshFromState();
    },

    refreshFromState() {
        if (window.StudioState?.config?.bucketList) {
            const list = window.StudioState.config.bucketList;
            this._activeItems = JSON.parse(JSON.stringify(list[this._currentCategory] || []));
        }
    },

    open() {
        const modal = document.getElementById('bucketPickerModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.refreshFromState();
            this.switchCategory('food');
        }
    },

    close() {
        const modal = document.getElementById('bucketPickerModal');
        if (modal) modal.classList.add('hidden');
    },

    switchCategory(cat) {
        this._currentCategory = cat;
        this._editingIndex = -1;
        this.refreshFromState();
        this.renderSidebar();
        this.renderList();
        this.closeEditorPanel();
    },

    renderSidebar() {
        const sidebar = document.getElementById('modal-bucket-sidebar');
        if (!sidebar) return;

        const menuItems = [
            { id: 'food', icon: 'restaurant', label: 'Kulineran' },
            { id: 'adventure', icon: 'hiking', label: 'Petualangan' },
            { id: 'daily', icon: 'calendar_month', label: 'Harian' }
        ];

        sidebar.innerHTML = `
            <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Kategori</h4>
            ${menuItems.map(item => `
                <div class="px-5 py-3.5 mb-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${this._currentCategory === item.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}"
                     onclick="window.Editor.BucketEditor.switchCategory('${item.id}')">
                    <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
                    <span class="text-sm font-bold">${item.label}</span>
                </div>
            `).join('')}
        `;
    },

    renderList() {
        const container = document.getElementById('modal-bucket-active-list');
        const header = document.getElementById('modal-bucket-list-header');
        if (!container || !header) return;

        const items = this._activeItems;
        const labels = { food: 'Kulineran Bareng', adventure: 'Petualangan Seru', daily: 'Aktivitas Harian' };

        header.innerHTML = `
            <div class="flex items-center justify-between w-full mb-6">
                <div>
                    <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">${labels[this._currentCategory]}</h4>
                    <p class="text-[11px] text-gray-400 italic">${items.length} rencana</p>
                </div>
                <button onclick="window.Editor.BucketEditor.addNewItem()" 
                        class="bg-indigo-500 text-white px-5 py-2 rounded-full text-[11px] font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95">
                    <span class="material-symbols-outlined text-[16px]">add</span> Tambah Item
                </button>
            </div>
        `;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <span class="material-symbols-outlined text-gray-200 text-5xl mb-4">checklist</span>
                    <p class="text-gray-400 text-sm">Belum ada rencana di sini.<br>Yuk tulis keinginan kalian!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map((item, idx) => `
            <div class="bg-white border-2 ${this._editingIndex === idx ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-gray-50'} rounded-2xl p-4 cursor-pointer hover:border-indigo-200 transition-all shadow-sm group">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full ${item.done ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-300'} flex items-center justify-center flex-shrink-0" 
                         onclick="window.Editor.BucketEditor.toggleDone(${idx}); event.stopPropagation();">
                        <span class="material-symbols-outlined">${item.done ? 'check_circle' : 'circle'}</span>
                    </div>
                    <div class="flex-1 min-w-0" onclick="window.Editor.BucketEditor.openEdit(${idx})">
                        <div class="text-[14px] font-bold ${item.done ? 'text-gray-400 line-through' : 'text-gray-900'} truncate">${item.text || 'Tanpa Judul'}</div>
                        ${item.priority ? `<span class="text-[9px] font-black bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full uppercase tracking-tighter mt-1 inline-block">Prioritas</span>` : ''}
                    </div>
                    <button onclick="window.Editor.BucketEditor.removeItem(${idx})" 
                            class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    openEdit(index) {
        this._editingIndex = index;
        const item = this._activeItems[index];
        const container = document.getElementById('bucket-editor-form');
        const emptyState = document.getElementById('bucket-editor-empty');
        const editorPanel = document.getElementById('bucket-editor-panel');

        if (!container || !emptyState || !editorPanel) return;

        emptyState.classList.add('hidden');
        editorPanel.classList.remove('hidden');

        container.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <label class="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 ml-1">Nama Keinginan (Bucket Item)</label>
                    <textarea id="edit-bucket-text" rows="3"
                        class="w-full px-6 py-5 bg-gray-50 border-2 border-gray-50 rounded-2xl text-lg font-bold outline-none focus:border-indigo-200 focus:bg-white transition-all resize-none shadow-inner"
                        placeholder="Apa yang mau kalian lakuin bareng?">${item.text || ''}</textarea>
                </div>

                <div class="flex gap-4">
                    <div class="flex-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <span class="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Status</span>
                            <span class="text-sm font-bold text-gray-700">${item.done ? 'Sudah Tercapai ✨' : 'Belum Tercapai'}</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="edit-bucket-done" ${item.done ? 'checked' : ''} class="sr-only peer">
                            <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                    
                    <div class="flex-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <span class="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Prioritas</span>
                            <span class="text-sm font-bold text-gray-700">Wajib Dicoba!</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="edit-bucket-priority" ${item.priority ? 'checked' : ''} class="sr-only peer">
                            <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                        </label>
                    </div>
                </div>
            </div>
        `;
        this.renderList();
    },

    addNewItem() {
        this._activeItems.unshift({
            text: "Rencana Baru Kita",
            done: false,
            priority: false
        });
        this._editingIndex = 0;
        this.renderList();
        this.openEdit(0);
    },

    removeItem(index) {
        if (!confirm('Hapus item ini dari daftar?')) return;
        this._activeItems.splice(index, 1);
        if (this._editingIndex === index) this.closeEditorPanel();
        else if (this._editingIndex > index) this._editingIndex--;
        this.renderList();
    },

    toggleDone(index) {
        this._activeItems[index].done = !this._activeItems[index].done;
        this.renderList();
        this.syncToState();
    },

    confirmEdit() {
        if (this._editingIndex === -1) return;
        const item = this._activeItems[this._editingIndex];
        item.text = document.getElementById('edit-bucket-text').value;
        item.done = document.getElementById('edit-bucket-done').checked;
        item.priority = document.getElementById('edit-bucket-priority').checked;

        if (typeof EditorUX !== 'undefined') EditorUX.showNotification('Bucket item disimpan! ✨');
        this.renderList();
        this.syncToState();
    },

    closeEditorPanel() {
        this._editingIndex = -1;
        const emptyState = document.getElementById('bucket-editor-empty');
        const editorPanel = document.getElementById('bucket-editor-panel');
        if (emptyState && editorPanel) {
            emptyState.classList.remove('hidden');
            editorPanel.classList.add('hidden');
        }
    },

    syncToState() {
        if (window.StudioState) {
            window.StudioState.config.bucketList[this._currentCategory] = JSON.parse(JSON.stringify(this._activeItems));
            window.StudioState.sync();
        }
    },

    save() {
        this.syncToState();
        if (window.StudioState) {
            window.StudioState.save();
            if (typeof EditorUX !== 'undefined') EditorUX.showNotification('Bucket List sudah LIVE! 🚀');
            this.close();
        }
    }
};
