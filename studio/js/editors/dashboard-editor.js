/**
 * LDR Studio - Redesigned Dashboard Editor Module
 * Aligning with CONFIG.dashboard structure from legacy admin
 */
window.Editor = window.Editor || {};
window.Editor.DashboardEditor = {
    _config: {},
    _currentTab: 'profiles', // 'profiles', 'locations', 'stats'

    init() {
        console.log('[DashboardEditor] Initializing Redesign...');
        const addBtn = document.getElementById('dashboard-edit-btn');
        const saveBtn = document.getElementById('dashboard-save-btn');

        if (addBtn) addBtn.onclick = () => this.open();
        if (saveBtn) saveBtn.onclick = () => this.save();

        this.refreshFromState();
    },

    refreshFromState() {
        if (window.StudioState?.config?.dashboard) {
            this._config = JSON.parse(JSON.stringify(window.StudioState.config.dashboard));
        } else {
            // Default empty structure if missing
            this._config = {
                yourLocation: { name: '', coordinates: [0, 0], timezone: 'Asia/Jakarta', photo: '', personName: '' },
                theirLocation: { name: '', coordinates: [0, 0], timezone: 'Asia/Jakarta', photo: '', personName: '' },
                nextReunionDate: new Date().toISOString(),
                stats: { daysTogether: 0, videoCallHours: 0, messagesExchanged: '0' },
                moods: {
                    you: { emoji: '😊', text: '' },
                    them: { emoji: '😊', text: '' }
                },
                quotes: [
                    "Distance means so little when someone means so much",
                    "Together forever, never apart. Maybe in distance, but never in heart",
                    "The pain of parting is nothing to the joy of meeting again"
                ]
            };
        }
        if (!this._config.quotes) {
            this._config.quotes = [
                "Distance means so little when someone means so much",
                "Together forever, never apart. Maybe in distance, but never in heart",
                "The pain of parting is nothing to the joy of meeting again"
            ];
        }
    },

    open() {
        const modal = document.getElementById('dashboardPickerModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.refreshFromState();
            this.switchTab('profiles');
        }
    },

    close() {
        const modal = document.getElementById('dashboardPickerModal');
        if (modal) modal.classList.add('hidden');
    },

    switchTab(tab) {
        this._currentTab = tab;
        this.render();
    },

    render() {
        const container = document.getElementById('dashboard-editor-container');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-10">
                <!-- Tab Navigation -->
                <div class="flex flex-wrap items-center justify-center gap-2 bg-white/50 p-2 rounded-[2rem] border border-gray-100 w-fit mx-auto shadow-sm">
                    ${this.renderTabBtn('profiles', 'account_circle', 'Profil')}
                    ${this.renderTabBtn('locations', 'distance', 'Lokasi')}
                    ${this.renderTabBtn('stats', 'event_upcoming', 'Reunion & Stats')}
                    ${this.renderTabBtn('quotes', 'format_quote', 'Quotes')}
                </div>

                <div class="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[500px]">
                    ${this.renderCurrentTabContent()}
                </div>
            </div>
        `;
    },

    renderTabBtn(id, icon, label) {
        const active = this._currentTab === id;
        return `
            <button onclick="window.Editor.DashboardEditor.switchTab('${id}')"
                class="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-slate-600'}">
                <span class="material-symbols-outlined text-xl">${icon}</span>
                ${label}
            </button>
        `;
    },

    renderCurrentTabContent() {
        switch (this._currentTab) {
            case 'profiles': return this.renderProfilesTab();
            case 'locations': return this.renderLocationsTab();
            case 'stats': return this.renderStatsTab();
            case 'quotes': return this.renderQuotesTab();
            default: return '';
        }
    },

    renderProfilesTab() {
        return `
            <div class="space-y-10">
                <div class="text-center mb-10">
                    <h4 class="text-2xl font-black text-gray-800 tracking-tight">Profil Kalian</h4>
                    <p class="text-sm text-gray-400">Atur foto dan nama kesayangan yang muncul di dashboard.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <!-- Your Profile -->
                    <div class="space-y-6 p-8 bg-rose-50/50 rounded-[3rem] border border-rose-100/50 relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        <span class="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] block mb-2">Profil Kamu</span>
                        
                        <div class="flex flex-col items-center gap-6">
                            <div class="relative group">
                                <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center">
                                    <img id="prev-your-photo" src="${this._config.yourLocation.photo || ''}" 
                                        class="w-full h-full object-cover ${this._config.yourLocation.photo ? '' : 'hidden'}">
                                    <span class="material-symbols-outlined text-gray-200 text-6xl ${this._config.yourLocation.photo ? 'hidden' : ''}">person</span>
                                </div>
                                <label class="absolute bottom-0 right-0 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-rose-600 transition-all hover:scale-110">
                                    <span class="material-symbols-outlined text-lg">upload</span>
                                    <input type="file" class="hidden" accept="image/*" onchange="window.Editor.DashboardEditor.handlePhotoUpload(this, 'yourLocation')">
                                </label>
                            </div>
                            
                            <div class="w-full space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Kamu</label>
                                    <input type="text" oninput="window.Editor.DashboardEditor.updateNested('yourLocation', 'personName', this.value)"
                                        value="${this._config.yourLocation.personName || ''}" 
                                        class="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-gray-700 outline-none focus:border-rose-200 transition-all shadow-sm" placeholder="ex: Aldo">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">URL Foto (Optional)</label>
                                    <input type="text" oninput="window.Editor.DashboardEditor.updateNested('yourLocation', 'photo', this.value); document.getElementById('prev-your-photo').src=this.value; document.getElementById('prev-your-photo').classList.remove('hidden')"
                                        value="${this._config.yourLocation.photo || ''}" 
                                        class="w-full px-5 py-3 bg-white/50 border border-gray-100 rounded-xl text-[11px] font-mono outline-none focus:border-rose-200 transition-all">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Their Profile -->
                    <div class="space-y-6 p-8 bg-indigo-50/50 rounded-[3rem] border border-indigo-100/50 relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        <span class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-2">Profil Pasangan</span>
                        
                        <div class="flex flex-col items-center gap-6">
                            <div class="relative group">
                                <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center">
                                    <img id="prev-their-photo" src="${this._config.theirLocation.photo || ''}" 
                                        class="w-full h-full object-cover ${this._config.theirLocation.photo ? '' : 'hidden'}">
                                    <span class="material-symbols-outlined text-gray-200 text-6xl ${this._config.theirLocation.photo ? 'hidden' : ''}">person</span>
                                </div>
                                <label class="absolute bottom-0 right-0 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-indigo-600 transition-all hover:scale-110">
                                    <span class="material-symbols-outlined text-lg">upload</span>
                                    <input type="file" class="hidden" accept="image/*" onchange="window.Editor.DashboardEditor.handlePhotoUpload(this, 'theirLocation')">
                                </label>
                            </div>
                            
                            <div class="w-full space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Dia</label>
                                    <input type="text" oninput="window.Editor.DashboardEditor.updateNested('theirLocation', 'personName', this.value)"
                                        value="${this._config.theirLocation.personName || ''}" 
                                        class="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-gray-700 outline-none focus:border-indigo-200 transition-all shadow-sm" placeholder="ex: Liz">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">URL Foto (Optional)</label>
                                    <input type="text" oninput="window.Editor.DashboardEditor.updateNested('theirLocation', 'photo', this.value); document.getElementById('prev-their-photo').src=this.value; document.getElementById('prev-their-photo').classList.remove('hidden')"
                                        value="${this._config.theirLocation.photo || ''}" 
                                        class="w-full px-5 py-3 bg-white/50 border border-gray-100 rounded-xl text-[11px] font-mono outline-none focus:border-indigo-200 transition-all">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderLocationsTab() {
        return `
            <div class="space-y-8">
                <div class="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
                    <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                        <span class="material-symbols-outlined">map</span>
                    </div>
                    <div>
                        <h4 class="text-xl font-black text-gray-800">Detail Lokasi</h4>
                        <p class="text-xs text-gray-400 tracking-tight">Koordinat dan zona waktu untuk perhitungan real-time.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    ${['yourLocation', 'theirLocation'].map((key, idx) => `
                        <div class="space-y-6">
                            <div class="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 space-y-5">
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">${idx === 0 ? 'Lokasi Kamu' : 'Lokasi Pasangan'}</span>
                                
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 mb-2 ml-1">Nama Kota</label>
                                    <input type="text" oninput="window.Editor.DashboardEditor.updateNested('${key}', 'name', this.value)"
                                        value="${this._config[key].name || ''}" class="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:border-slate-300">
                                </div>

                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 mb-2 ml-1">Zona Waktu (Timezone)</label>
                                    <select onchange="window.Editor.DashboardEditor.updateNested('${key}', 'timezone', this.value)"
                                        class="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:border-slate-300">
                                        <option value="Asia/Jakarta" ${this._config[key].timezone === 'Asia/Jakarta' ? 'selected' : ''}>WIB (Jakarta)</option>
                                        <option value="Asia/Makassar" ${this._config[key].timezone === 'Asia/Makassar' ? 'selected' : ''}>WITA (Bali/Makassar)</option>
                                        <option value="Asia/Jayapura" ${this._config[key].timezone === 'Asia/Jayapura' ? 'selected' : ''}>WIT (Papua)</option>
                                        <option value="America/New_York" ${this._config[key].timezone === 'America/New_York' ? 'selected' : ''}>New York (EST/EDT)</option>
                                        <option value="Europe/London" ${this._config[key].timezone === 'Europe/London' ? 'selected' : ''}>London (GMT/BST)</option>
                                        <option value="Asia/Tokyo" ${this._config[key].timezone === 'Asia/Tokyo' ? 'selected' : ''}>Tokyo (JST)</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-[10px] font-bold text-gray-400 mb-2 ml-1">Koordinat (Latitude & Longitude)</label>
                                    <div class="flex gap-2">
                                        <div class="grid grid-cols-2 gap-2 flex-1">
                                            <input type="number" step="any" placeholder="Lat" id="${key}-lat"
                                                oninput="window.Editor.DashboardEditor.updateCoord('${key}', 0, this.value)"
                                                value="${this._config[key].coordinates[0]}" 
                                                class="w-full px-3 py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-mono outline-none focus:border-slate-300">
                                            <input type="number" step="any" placeholder="Lng" id="${key}-lng"
                                                oninput="window.Editor.DashboardEditor.updateCoord('${key}', 1, this.value)"
                                                value="${this._config[key].coordinates[1]}" 
                                                class="w-full px-3 py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-mono outline-none focus:border-slate-300">
                                        </div>
                                        <button onclick="window.mapPicker.open('${key}')"
                                            class="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-100 transition-all shadow-sm">
                                            <span class="material-symbols-outlined">map</span>
                                        </button>
                                    </div>
                                    <p class="text-[9px] text-gray-400 mt-2 px-1 italic leading-tight">Klik ikon peta untuk memilih lokasi secara visual.</p>

                                    <!-- Hidden input for mapPicker backward compatibility -->
                                    <input type="hidden" id="${key === 'yourLocation' ? 'yourCoords' : 'theirCoords'}" 
                                        oninput="window.Editor.DashboardEditor.handleMapSync('${key}', this.value)">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderStatsTab() {
        return `
            <div class="space-y-10">
                <div class="bg-gradient-to-br from-emerald-50 to-teal-50 p-10 rounded-[3.5rem] border border-emerald-100 relative overflow-hidden">
                    <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <span class="material-symbols-outlined">calendar_today</span>
                            </div>
                            <div>
                                <h4 class="text-xl font-black text-emerald-900">Hitung Mundur Pertemuan</h4>
                                <p class="text-xs text-emerald-600 font-medium">Tanggal kapan kalian akan bertemu lagi.</p>
                            </div>
                        </div>
                        
                        <div class="max-w-xs">
                            <label class="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 ml-1">Tanggal Reunion</label>
                            <input type="date" oninput="window.Editor.DashboardEditor.updateValue('nextReunionDate', this.value + 'T00:00:00')"
                                value="${this._config.nextReunionDate ? this._config.nextReunionDate.split('T')[0] : ''}"
                                class="w-full px-6 py-4 bg-white border-2 border-emerald-100 rounded-2xl font-bold text-emerald-900 outline-none focus:border-emerald-300 transition-all shadow-sm">
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${Object.keys(this._config.stats).filter(k => k !== 'daysTogether').map(key => `
                        <div class="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 space-y-4">
                            <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                ${key === 'videoCallHours' ? 'Jam Video Call' : 'Jumlah Pesan'}
                            </label>
                            <input type="${key === 'messagesExchanged' ? 'text' : 'number'}" 
                                oninput="window.Editor.DashboardEditor.updateNested('stats', '${key}', this.value)"
                                value="${this._config.stats[key]}"
                                class="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl font-black text-xl text-slate-800 outline-none focus:border-slate-300 shadow-sm">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },


    renderQuotesTab() {
        return `
            <div class="space-y-8">
                <div class="text-center mb-8">
                    <h4 class="text-2xl font-black text-gray-800">Kata-kata Romantis</h4>
                    <p class="text-sm text-gray-400">Quotes ini akan berputar secara otomatis di dashboard kalian.</p>
                </div>

                <div class="space-y-4">
                    ${this._config.quotes.map((quote, idx) => `
                        <div class="flex gap-4 items-start bg-gray-50 p-6 rounded-3xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                            <div class="flex-1">
                                <textarea oninput="window.Editor.DashboardEditor.updateQuote(${idx}, this.value)"
                                    class="w-full bg-transparent border-none font-bold text-gray-700 outline-none resize-none min-h-[60px]"
                                    placeholder="Tulis quote romantis...">${quote}</textarea>
                            </div>
                            <button onclick="window.Editor.DashboardEditor.removeQuote(${idx})"
                                class="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                                <span class="material-symbols-outlined text-xl">delete</span>
                            </button>
                        </div>
                    `).join('')}
                </div>

                <button onclick="window.Editor.DashboardEditor.addQuote()"
                    class="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">add_circle</span> Tambah Quote Baru
                </button>
            </div>
        `;
    },

    updateQuote(idx, val) {
        this._config.quotes[idx] = val;
        this.syncToState();
    },

    addQuote() {
        this._config.quotes.push("Lagu yang indah adalah lagu yang ku dengar bersamamu...");
        this.render();
        this.syncToState();
    },

    removeQuote(idx) {
        if (this._config.quotes.length <= 1) {
            EditorUX.showNotification('Minimal harus ada 1 quote!', 'info');
            return;
        }
        this._config.quotes.splice(idx, 1);
        this.render();
        this.syncToState();
    },

    updateCoord(key, idx, val) {
        this._config[key].coordinates[idx] = parseFloat(val) || 0;
        this.syncToState();
    },

    handleMapSync(key, val) {
        // Called when mapPicker updates the hidden input
        const coords = val.split(',').map(v => parseFloat(v.trim()));
        if (coords.length === 2 && !isNaN(coords[0])) {
            this._config[key].coordinates = coords;
            // Update the visible inputs too
            const latInp = document.getElementById(`${key}-lat`);
            const lngInp = document.getElementById(`${key}-lng`);
            if (latInp) latInp.value = coords[0].toFixed(6);
            if (lngInp) lngInp.value = coords[1].toFixed(6);
            this.syncToState();
        }
    },

    updateNested(parent, child, val) {
        if (typeof this._config[parent][child] === 'number') val = parseFloat(val) || 0;
        this._config[parent][child] = val;

        // SYNC NAMES TO LOGIN FIELDS (Consistency fix)
        if (window.StudioState?.config) {
            if (!window.StudioState.config.login) window.StudioState.config.login = {};
            if (parent === 'yourLocation' && child === 'personName') {
                window.StudioState.config.login.youLabel = val;
            } else if (parent === 'theirLocation' && child === 'personName') {
                window.StudioState.config.login.themLabel = val;
            }
        }

        this.syncToState();
    },

    updateValue(field, val) {
        this._config[field] = val;
        this.syncToState();
    },


    handlePhotoUpload(input, key) {
        if (!input.files || !input.files[0]) return;

        EditorUX.handleMediaUpload(input, (url) => {
            this._config[key].photo = url;
            const prevId = key === 'yourLocation' ? 'prev-your-photo' : 'prev-their-photo';
            const prev = document.getElementById(prevId);
            if (prev) {
                prev.src = url;
                prev.classList.remove('hidden');
                prev.parentElement.querySelector('.material-symbols-outlined').classList.add('hidden');
            }
            this.syncToState();
        });
    },

    syncToState() {
        if (window.StudioState) {
            window.StudioState.config.dashboard = JSON.parse(JSON.stringify(this._config));
            window.StudioState.sync();
        }
    },

    save() {
        this.syncToState();
        if (window.StudioState) {
            window.StudioState.save();
            if (typeof EditorUX !== 'undefined') EditorUX.showNotification('Dashboard sudah LIVE! 🚀');
            this.close();
        }
    }
};
