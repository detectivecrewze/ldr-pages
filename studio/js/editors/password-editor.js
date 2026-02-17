/**
 * LDR Studio - Password & Login Editor Module
 * Expanded to handle all fields from legacy admin Login Setup
 */
window.Editor = window.Editor || {};
window.Editor.PasswordEditor = {
    init() {
        console.log('[PasswordEditor] Initializing...');
        const btn = document.getElementById('password-add-btn');
        if (btn) btn.onclick = () => this.open();
    },

    open() {
        const modal = document.getElementById('passwordPickerModal');
        if (!modal) return;

        modal.classList.remove('hidden');

        // Load data from StudioState
        const login = window.StudioState.config.login || {};

        const fields = {
            'login-you-label': login.youLabel || '',
            'login-them-label': login.themLabel || '',
            'login-quote': login.quote || '',
            'login-start-date': login.relationshipStartDate || '',
            'login-password': login.password || '',
            'login-error-msg': login.errorMessage || ''
        };

        for (const [id, val] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }
    },

    close() {
        const modal = document.getElementById('passwordPickerModal');
        if (modal) modal.classList.add('hidden');
    },

    save() {
        if (!window.StudioState) return;

        const login = window.StudioState.config.login || {};

        login.youLabel = document.getElementById('login-you-label').value;
        login.themLabel = document.getElementById('login-them-label').value;
        login.quote = document.getElementById('login-quote').value;
        login.relationshipStartDate = document.getElementById('login-start-date').value;
        login.password = document.getElementById('login-password').value;
        login.errorMessage = document.getElementById('login-error-msg').value;

        window.StudioState.config.login = login;

        // SYNC TO DASHBOARD (Consistency fix)
        if (window.StudioState.config.dashboard) {
            if (window.StudioState.config.dashboard.yourLocation) {
                window.StudioState.config.dashboard.yourLocation.personName = login.youLabel;
            }
            if (window.StudioState.config.dashboard.theirLocation) {
                window.StudioState.config.dashboard.theirLocation.personName = login.themLabel;
            }
        }
        window.StudioState.save();
        window.StudioState.sync();

        if (typeof EditorUX !== 'undefined') {
            EditorUX.showNotification('Pengaturan login diperbarui! 🔒', 'success');
        }

        this.close();
    }
};
