/**
 * LDR Studio - Theme Editor Module
 * Handles global branding, colors, and background aesthetics.
 */
const ThemeEditor = window.ThemeEditor = {
    render() {
        const theme = state.config?.theme || {};

        return `
            <div class="step-header">
                <h2 class="text-2xl font-black text-slate-800">Visual Settings</h2>
                <p class="text-slate-500">Personalize the overall look and feel of your experience.</p>
            </div>

            <div class="space-y-8 animate-fadeIn">
                <!-- App Branding -->
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-indigo-500">branding_watermark</span>
                        App Branding
                    </h3>
                    <div class="form-group">
                        <label class="form-label">Application Name</label>
                        <input type="text" class="form-input" id="appName" 
                            value="${theme.appName || 'Long Distance Love'}"
                            placeholder="e.g. My LDR Story"
                            oninput="state.updateNestedField('theme', null, 'appName', this.value)">
                        <p class="form-hint">This appears in the loading screens and tab title.</p>
                    </div>

                    <div class="form-group border-t border-slate-50 pt-6">
                        <label class="form-label flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">person</span>
                            Recipient Name
                        </label>
                        <input type="text" class="form-input" id="recipientName" 
                            value="${state.config?.metadata?.customerName || ''}"
                            placeholder="e.g. Septian"
                            oninput="state.updateField('metadata', 'customerName', this.value)">
                        <p class="form-hint">This name is used to personalize the experience.</p>
                    </div>
                </div>

                <!-- Color Palette -->
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-rose-500">palette</span>
                        Color Palette
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label class="form-label">Primary Color</label>
                            <div class="flex gap-3">
                                <div class="relative w-12 h-12 shrink-0">
                                    <input type="color" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                        value="${theme.primary || '#f43f5e'}"
                                        oninput="state.updateNestedField('theme', null, 'primary', this.value); document.getElementById('primaryText').value = this.value; this.nextElementSibling.style.backgroundColor = this.value">
                                    <div class="w-12 h-12 rounded-2xl shadow-inner border border-white" style="background-color: ${theme.primary || '#f43f5e'}"></div>
                                </div>
                                <input type="text" id="primaryText" class="form-input flex-1 font-mono text-sm uppercase" 
                                    value="${theme.primary || '#f43f5e'}"
                                    oninput="state.updateNestedField('theme', null, 'primary', this.value); this.previousElementSibling.previousElementSibling.value = this.value; this.previousElementSibling.style.backgroundColor = this.value">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Secondary Color</label>
                            <div class="flex gap-3">
                                <div class="relative w-12 h-12 shrink-0">
                                    <input type="color" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                        value="${theme.secondary || '#ec4899'}"
                                        oninput="state.updateNestedField('theme', null, 'secondary', this.value); document.getElementById('secondaryText').value = this.value; this.nextElementSibling.style.backgroundColor = this.value">
                                    <div class="w-12 h-12 rounded-2xl shadow-inner border border-white" style="background-color: ${theme.secondary || '#ec4899'}"></div>
                                </div>
                                <input type="text" id="secondaryText" class="form-input flex-1 font-mono text-sm uppercase" 
                                    value="${theme.secondary || '#ec4899'}"
                                    oninput="state.updateNestedField('theme', null, 'secondary', this.value); this.previousElementSibling.previousElementSibling.value = this.value; this.previousElementSibling.style.backgroundColor = this.value">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Aesthetics -->
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-amber-500">auto_awesome</span>
                        Aesthetics
                    </h3>
                    <div class="form-group">
                        <label class="form-label">Background Style</label>
                        <div class="grid grid-cols-3 gap-3">
                            ${['romantic', 'retro', 'minimal'].map(style => `
                                <button onclick="state.updateNestedField('theme', null, 'background', '${style}'); ThemeEditor.refresh()"
                                    class="p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${theme.background === style ? 'border-indigo-500 bg-indigo-50' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}">
                                    <span class="text-2xl">${style === 'romantic' ? '💖' : style === 'retro' ? '💾' : '✨'}</span>
                                    <span class="text-[10px] font-black uppercase tracking-widest">${style}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-group mt-6">
                        <label class="form-label">Particle Effect</label>
                        <select class="form-input" 
                            onchange="state.updateNestedField('theme', null, 'particles', this.value)">
                            <option value="none" ${theme.particles === 'none' ? 'selected' : ''}>None (Clean)</option>
                            <option value="hearts" ${theme.particles === 'hearts' ? 'selected' : ''}>Floating Hearts</option>
                            <option value="stars" ${theme.particles === 'stars' ? 'selected' : ''}>Twinkling Stars</option>
                            <option value="snow" ${theme.particles === 'snow' ? 'selected' : ''}>Gentle Snow</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },

    refresh() {
        if (typeof app !== 'undefined' && app.renderStep) {
            app.renderStep();
        }
    }
};
