// Admin Configuration - Long Distance Love

const PAGE_TYPES = {
    'login': {
        id: 'page-1',
        name: 'Login',
        icon: 'lock',
        required: true,
        description: 'Entry & Password'
    },
    'dashboard': {
        id: 'page-2',
        name: 'Distance Dashboard',
        icon: 'dashboard',
        required: false,
        description: 'Distance & Time zones'
    },
    'journey': {
        id: 'page-3',
        name: 'Journey Map',
        icon: 'timeline',
        required: false,
        description: 'Timeline & milestones'
    },
    'shared': {
        id: 'page-4',
        name: 'Shared World',
        icon: 'favorite',
        required: false,
        description: 'Music, dates & photos'
    },
    'video': {
        id: 'page-12',
        name: 'Video Vault',
        icon: 'videocam',
        required: false,
        description: 'Special video messages'
    },
    'messenger': {
        id: 'page-8',
        name: 'Love Messenger',
        icon: 'chat',
        required: false,
        description: 'Chat-style memories'
    },
    'sweeper': {
        id: 'page-9',
        name: 'Heart Sweeper',
        icon: 'grid_view',
        required: false,
        description: 'Interactive mini-game'
    },
    'bucketlist': {
        id: 'page-10',
        name: 'Our Bucket List',
        icon: 'checklist',
        required: false,
        description: 'Future plans together'
    },
    'quiz': {
        id: 'page-11',
        name: 'Love Quiz',
        icon: 'quiz',
        required: false,
        description: 'How well do you know us?'
    },
    'letter': {
        id: 'page-7',
        name: 'The Promise',
        icon: 'mail',
        required: true,
        description: 'Love letter & vows'
    },
    'memories': {
        id: 'page-6',
        name: 'Gallery',
        icon: 'photo_library',
        required: false,
        description: 'Photo gallery memories'
    },
};

const DEFAULT_PAGE_CONFIG = {
    pages: {
        'page-1': { id: 'page-1', name: 'Login', type: 'login', enabled: true, required: true, icon: 'lock', order: 1 },
        'page-2': { id: 'page-2', name: 'Distance Dashboard', type: 'dashboard', enabled: true, required: false, icon: 'dashboard', order: 2 },
        'page-3': { id: 'page-3', name: 'Journey Map', type: 'journey', enabled: true, required: false, icon: 'timeline', order: 3 },
        'page-4': { id: 'page-4', name: 'Shared World', type: 'shared', enabled: true, required: false, icon: 'favorite', order: 4 },
        'page-12': { id: 'page-12', name: 'Video Vault', type: 'video', enabled: false, required: false, icon: 'videocam', order: 5 },
        'page-6': { id: 'page-6', name: 'Gallery', type: 'memories', enabled: true, required: false, icon: 'photo_library', order: 6 },
        'page-8': { id: 'page-8', name: 'Love Messenger', type: 'messenger', enabled: false, required: false, icon: 'chat', order: 7 },
        'page-9': { id: 'page-9', name: 'Heart Sweeper', type: 'sweeper', enabled: false, required: false, icon: 'grid_view', order: 8 },
        'page-10': { id: 'page-10', name: 'Our Bucket List', type: 'bucketlist', enabled: false, required: false, icon: 'checklist', order: 9 },
        'page-11': { id: 'page-11', name: 'Love Quiz', type: 'quiz', enabled: true, required: false, icon: 'quiz', order: 10 },
        'page-7': { id: 'page-7', name: 'The Promise', type: 'letter', enabled: true, required: true, icon: 'mail', order: 12 }
    }
};

const PAGE_PRESETS = {
    'storyteller': {
        id: 'storyteller',
        name: 'Full Storyteller',
        icon: 'menu_book',
        pages: ['page-1', 'page-2', 'page-3', 'page-4', 'page-12', 'page-6', 'page-8', 'page-10', 'page-11', 'page-7'],
        description: 'Complete journey from first hello to future promises.'
    },
    'interactive': {
        id: 'interactive',
        name: 'Interactive Fun',
        icon: 'videogame_asset',
        pages: ['page-1', 'page-2', 'page-9', 'page-11', 'page-7'],
        description: 'Focus on games and interactivity.'
    },
    'minimal': {
        id: 'minimal',
        name: 'Sweet & Simple',
        icon: 'auto_awesome',
        pages: ['page-1', 'page-2', 'page-7'],
        description: 'Just the dashboard and your love letter.'
    }
};

const WIZARD_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome',
        description: 'Get started',
        icon: 'waving_hand',
        render: () => `
            <div class="step-header">
                <h2>Welcome, Creator! 👋</h2>
                <p>Let's build a beautiful digital experience for your long distance love story.</p>
            </div>
            <div class="bg-gradient-to-br from-rose-50 to-white p-8 rounded-2xl border border-rose-100">
                <div class="flex items-start gap-4 mb-6">
                    <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-rose-600">favorite</span>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">What you'll create</h3>
                        <p class="text-sm text-gray-600">A multi-page interactive experience that celebrates your love across the miles.</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <span class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                        <span class="text-sm text-gray-700">Login Page</span>
                    </div>
                    <div class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <span class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                        <span class="text-sm text-gray-700">Distance Dashboard</span>
                    </div>
                    <div class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <span class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                        <span class="text-sm text-gray-700">Journey Map</span>
                    </div>
                    <div class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <span class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                        <span class="text-sm text-gray-700">Shared World</span>
                    </div>
                    <div class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 sm:col-span-2">
                        <span class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                        <span class="text-sm text-gray-700">The Promise - A beautiful finale with your love letter</span>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'general',
        title: 'General Settings',
        description: 'App name & theme',
        icon: 'settings',
        render: () => `
            <div class="step-header">
                <h2>General settings</h2>
                <p>Personalize the overall look and feel of your experience.</p>
            </div>
            <div class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Application Name</label>
                    <input type="text" class="form-input" id="appName" 
                        value="${state.config?.theme?.appName || 'Long Distance Love'}"
                        oninput="state.updateNestedField('theme', null, 'appName', this.value)">
                    <p class="form-hint">This appears in the title bars and loading screens.</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Primary Color</label>
                        <div class="flex gap-2">
                            <input type="color" class="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" 
                                value="${state.config?.theme?.primary || '#f43f5e'}"
                                oninput="state.updateNestedField('theme', null, 'primary', this.value); document.getElementById('primaryText').value = this.value;">
                            <input type="text" id="primaryText" class="form-input flex-1" 
                                value="${state.config?.theme?.primary || '#f43f5e'}"
                                oninput="state.updateNestedField('theme', null, 'primary', this.value)">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Secondary Color</label>
                        <div class="flex gap-2">
                            <input type="color" class="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" 
                                value="${state.config?.theme?.secondary || '#ec4899'}"
                                oninput="state.updateNestedField('theme', null, 'secondary', this.value); document.getElementById('secondaryText').value = this.value;">
                            <input type="text" id="secondaryText" class="form-input flex-1" 
                                value="${state.config?.theme?.secondary || '#ec4899'}"
                                oninput="state.updateNestedField('theme', null, 'secondary', this.value)">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Background Style</label>
                    <select class="form-input" 
                        onchange="state.updateNestedField('theme', null, 'background', this.value)">
                        <option value="romantic" ${state.config?.theme?.background === 'romantic' ? 'selected' : ''}>Romantic Gradient</option>
                        <option value="retro" ${state.config?.theme?.background === 'retro' ? 'selected' : ''}>Retro Desktop (Win98)</option>
                        <option value="minimal" ${state.config?.theme?.background === 'minimal' ? 'selected' : ''}>Clean & Minimal</option>
                    </select>
                </div>
            </div>
        `
    },
    {
        id: 'login',
        title: 'Login Setup',
        description: 'Password & cover',
        icon: 'lock',
        render: () => {
            const inputId = 'login_bg_src';
            const currentSrc = state.config?.login?.photoSrc || '';
            return `
                <div class="step-header">
                    <h2>Login Page</h2>
                    <p>Set up the first impression and relationship details.</p>
                </div>
                <div class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">"You" Label</label>
                            <input type="text" class="form-input" id="loginYouLabel" 
                                value="${state.config?.login?.youLabel || 'You'}"
                                placeholder="e.g. Me, My Love"
                                oninput="state.updateField('login', 'youLabel', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">"Them" Label</label>
                            <input type="text" class="form-input" id="loginThemLabel" 
                                value="${state.config?.login?.themLabel || 'Them'}"
                                placeholder="e.g. Liz, Partner"
                                oninput="state.updateField('login', 'themLabel', this.value)">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Welcome Quote</label>
                        <input type="text" class="form-input" id="loginQuote" 
                            value="${state.config?.login?.quote || 'Distance means so little when someone means so much'}"
                            oninput="state.updateField('login', 'quote', this.value)">
                        <p class="form-hint">This romantic quote appears above the login</p>
                    </div>
                    
                    <div class="form-group border-t pt-6">
                        <label class="form-label">Secret Password</label>
                        <input type="text" class="form-input" id="loginPassword" 
                            value="${state.config?.login?.password || 'forever'}"
                            oninput="state.updateField('login', 'password', this.value)">
                        <p class="form-hint">The password your loved one needs to enter</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Relationship Start Date</label>
                        <input type="date" class="form-input" id="relationshipStartDate" 
                            value="${state.config?.login?.relationshipStartDate || '2023-01-15'}"
                            oninput="state.updateField('login', 'relationshipStartDate', this.value)">
                        <p class="form-hint">Used to calculate "Connected for X days"</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Error Message</label>
                        <input type="text" class="form-input" id="loginErrorMessage" 
                            value="${state.config?.login?.errorMessage || "That's not our special word... try again!"}"
                            oninput="state.updateField('login', 'errorMessage', this.value)">
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'dashboard',
        title: 'Distance Dashboard',
        description: 'Set locations & stats',
        icon: 'location_on',
        render: () => `
            <div class="step-header">
                <h2>Your Locations</h2>
                <p>Set up both locations to calculate distance and time zones.</p>
            </div>
            <div class="space-y-6">
                <div class="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                    <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-rose-500">location_on</span>
                        Your Location
                    </h3>
                    <div class="space-y-4">
                        <div class="form-group">
                            <label class="form-label">Your Profile Photo</label>
                            <div class="flex gap-4 items-center mb-2">
                                <div id="placeholder_yourPhoto" class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 ${state.config?.dashboard?.yourLocation?.photo ? 'hidden' : ''}">
                                    <span class="material-symbols-outlined text-gray-400">person</span>
                                </div>
                                <img id="prev_yourPhoto" src="${state.config?.dashboard?.yourLocation?.photo || ''}" 
                                    class="w-16 h-16 rounded-full object-cover border-2 border-rose-200 ${state.config?.dashboard?.yourLocation?.photo ? '' : 'hidden'}">
                                <div class="flex-1 space-y-2">
                                    <input type="text" id="yourPhoto" class="form-input text-xs" placeholder="Photo URL"
                                        value="${state.config?.dashboard?.yourLocation?.photo || ''}"
                                        oninput="state.updateNestedField('dashboard', 'yourLocation', 'photo', this.value); app.updateImagePreview('yourPhoto', this.value)">
                                    <label class="flex items-center justify-center gap-2 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold cursor-pointer hover:bg-rose-100 transition-colors border border-rose-100">
                                        <span class="material-symbols-outlined text-lg">upload</span>
                                        Upload Photo
                                        <input type="file" class="hidden" accept="image/*" onchange="app.uploadNestedPhoto(this, 'dashboard', 'yourLocation', 'photo', 'yourPhoto')">
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Your Name</label>
                            <input type="text" class="form-input" id="yourPersonName" 
                                value="${state.config?.dashboard?.yourLocation?.personName || 'You'}"
                                oninput="state.updateNestedConfig('dashboard', 'yourLocation', { personName: this.value })">
                        </div>
                        <div class="form-group">
                            <label class="form-label">City Name</label>
                            <input type="text" class="form-input" id="yourLocationName" 
                                value="${state.config?.dashboard?.yourLocation?.name || 'Jakarta'}"
                                oninput="state.updateNestedConfig('dashboard', 'yourLocation', { name: this.value })">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Timezone</label>
                            <select class="form-input" 
                                onchange="state.updateNestedConfig('dashboard', 'yourLocation', { timezone: this.value })">
                                ${utils.getTimezoneOptions(state.config?.dashboard?.yourLocation?.timezone || 'Asia/Jakarta')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Coordinates (lat, lng)</label>
                            <div class="location-input-group">
                                <input type="text" class="form-input" id="yourCoords" readonly
                                    value="${(state.config?.dashboard?.yourLocation?.coordinates || [-6.2088, 106.8456]).join(', ')}"
                                    oninput="state.updateNestedConfig('dashboard', 'yourLocation', { coordinates: this.value.split(',').map(v => parseFloat(v.trim())) })">
                                <button class="map-btn" onclick="mapPicker.open('yourLocation')">
                                    <span class="material-symbols-outlined">map</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-indigo-500">favorite</span>
                        Their Location
                    </h3>
                    <div class="space-y-4">
                        <div class="form-group">
                            <label class="form-label">Their Profile Photo</label>
                            <div class="flex gap-4 items-center mb-2">
                                <div id="placeholder_theirPhoto" class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 ${state.config?.dashboard?.theirLocation?.photo ? 'hidden' : ''}">
                                    <span class="material-symbols-outlined text-gray-400">person</span>
                                </div>
                                <img id="prev_theirPhoto" src="${state.config?.dashboard?.theirLocation?.photo || ''}" 
                                    class="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 ${state.config?.dashboard?.theirLocation?.photo ? '' : 'hidden'}">
                                <div class="flex-1 space-y-2">
                                    <input type="text" id="theirPhoto" class="form-input text-xs" placeholder="Photo URL"
                                        value="${state.config?.dashboard?.theirLocation?.photo || ''}"
                                        oninput="state.updateNestedField('dashboard', 'theirLocation', 'photo', this.value); app.updateImagePreview('theirPhoto', this.value)">
                                    <label class="flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-100">
                                        <span class="material-symbols-outlined text-lg">upload</span>
                                        Upload Photo
                                        <input type="file" class="hidden" accept="image/*" onchange="app.uploadNestedPhoto(this, 'dashboard', 'theirLocation', 'photo', 'theirPhoto')">
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Their Name</label>
                            <input type="text" class="form-input" id="theirPersonName" 
                                value="${state.config?.dashboard?.theirLocation?.personName || 'Them'}"
                                oninput="state.updateNestedConfig('dashboard', 'theirLocation', { personName: this.value })">
                        </div>
                        <div class="form-group">
                            <label class="form-label">City Name</label>
                            <input type="text" class="form-input" id="theirLocationName" 
                                value="${state.config?.dashboard?.theirLocation?.name || 'New York'}"
                                oninput="state.updateNestedConfig('dashboard', 'theirLocation', { name: this.value })">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Timezone</label>
                            <select class="form-input" 
                                onchange="state.updateNestedConfig('dashboard', 'theirLocation', { timezone: this.value })">
                                ${utils.getTimezoneOptions(state.config?.dashboard?.theirLocation?.timezone || 'America/New_York')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Coordinates (lat, lng)</label>
                            <div class="location-input-group">
                                <input type="text" class="form-input" id="theirCoords" readonly
                                    value="${(state.config?.dashboard?.theirLocation?.coordinates || [40.7128, -74.0060]).join(', ')}"
                                    oninput="state.updateNestedConfig('dashboard', 'theirLocation', { coordinates: this.value.split(',').map(v => parseFloat(v.trim())) })">
                                <button class="map-btn" onclick="mapPicker.open('theirLocation')">
                                    <span class="material-symbols-outlined">map</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Next Reunion Date</label>
                    <input type="date" class="form-input" id="nextReunionDate" 
                        value="${state.config?.dashboard?.nextReunionDate?.split('T')[0] || '2026-03-15'}"
                        oninput="state.updateField('dashboard', 'nextReunionDate', this.value + 'T00:00:00')">
                    <p class="form-hint">The date you'll see each other again (for countdown)</p>
                </div>

                <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-gray-500">analytics</span>
                        Stats
                    </h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="form-group">
                            <label class="form-label text-xs">Days Together</label>
                            <input type="number" class="form-input" 
                                value="${state.config?.dashboard?.stats?.daysTogether || 0}"
                                oninput="state.updateNestedField('dashboard', 'stats', 'daysTogether', parseInt(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label text-xs">Video Call Hours</label>
                            <input type="number" class="form-input" 
                                value="${state.config?.dashboard?.stats?.videoCallHours || 0}"
                                oninput="state.updateNestedField('dashboard', 'stats', 'videoCallHours', parseInt(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label text-xs">Messages</label>
                            <input type="text" class="form-input" 
                                value="${state.config?.dashboard?.stats?.messagesExchanged || '0'}"
                                oninput="state.updateNestedField('dashboard', 'stats', 'messagesExchanged', this.value)">
                        </div>
                    </div>
                </div>

                </div>

            </div>
        `
    },
    {
        id: 'journey',
        title: 'Journey Map',
        description: 'Timeline & milestones',
        icon: 'timeline',
        render: () => `
            <div class="step-header">
                <h2>Journey & Timeline</h2>
                <p>Add milestones and memories from your relationship.</p>
            </div>
            
            <div class="space-y-8">


                <div class="form-group pb-8">
                    <label class="form-label flex items-center gap-2">
                        <span class="material-symbols-outlined text-rose-500">location_on</span>
                        Map Highlights (Pins)
                    </label>
                    <p class="form-hint mb-4">Special places that will appear as pins on your map with photos.</p>
                    <div id="pinsList" class="space-y-4" oninput="state.saveArrayItems('pins', 'journeyMap')">
                        ${renderers.renderPins()}
                    </div>
                    <button class="add-item-btn mt-4 w-full justify-center" onclick="renderers.addPin()">
                        <span class="material-symbols-outlined">add</span>
                        Add Map Highlight
                    </button>
                </div>
            </div>
        `,
        onNext: () => {
            state.saveArrayItems('milestones', 'journeyMap');
            state.saveArrayItems('pins', 'journeyMap');
        }
    },
    {
        id: 'shared',
        title: 'Music Player',
        description: 'Playlist & songs',
        icon: 'music_note',
        render: () => `
            <div class="step-header">
                <h2>Music Player</h2>
                <p>Curate a special playlist for your shared moments.</p>
            </div>
            <div class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Playlist Songs</label>
                    <div class="array-items" id="playlistList" oninput="state.saveArrayItems('playlist', 'sharedWorld')">
                        ${renderers.renderPlaylist()}
                    </div>
                    <button class="add-item-btn mt-4" onclick="renderers.addPlaylistItem()">
                        <span class="material-symbols-outlined">add</span>
                        Add New Song
                    </button>
                </div>
            </div>
        `,
        onNext: () => {
            state.saveArrayItems('playlist', 'sharedWorld');
        }
    },
    {
        id: 'memories',
        title: 'Photo Gallery',
        description: 'Manage photos',
        icon: 'photo_library',
        render: () => renderers.renderMemoriesStep(),
        onNext: () => {
            state.saveArrayItems('photos', 'sharedWorld');
        }
    },
    {
        id: 'video',
        title: 'Video Vault',
        description: 'Video memories',
        icon: 'videocam',
        render: () => `
            <div class="step-header">
                <h2>Video Vault</h2>
                <p>Add video memories and special moments.</p>
            </div>
            <div class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Video Memories</label>
                    <div class="array-items" id="videosList" oninput="state.saveArrayItems('videos', 'videos')">
                        ${renderers.renderVideos?.() || '<p class="text-gray-400 text-sm">No videos yet</p>'}
                    </div>
                    <button class="add-item-btn" onclick="renderers.addVideo?.()">
                        <span class="material-symbols-outlined">add</span>
                        Add Video
                    </button>
                </div>
            </div>
        `,
        onNext: () => {
            state.saveArrayItems('videos', 'videos');
        }
    },
    {
        id: 'messenger',
        title: 'Love Messenger',
        description: 'Chat settings',
        icon: 'chat',
        render: () => renderers.renderMessengerStep()
    },
    {
        id: 'sweeper',
        title: 'Heart Sweeper',
        description: 'Mini game',
        icon: 'grid_view',
        render: () => renderers.renderSweeperStep()
    },
    {
        id: 'bucketlist',
        title: 'Bucket List',
        description: 'Future plans',
        icon: 'checklist',
        render: () => renderers.renderBucketListStep()
    },
    {
        id: 'quiz',
        title: 'Love Quiz',
        description: 'Quiz questions',
        icon: 'quiz',
        render: () => renderers.renderQuizStep(),
        onNext: () => {
            state.saveArrayItems('questions', 'quiz');
        }
    },
    {
        id: 'letter',
        title: 'The Promise',
        description: 'Edit your love letter',
        icon: 'mail',
        render: () => {
            return `
                <div class="step-header">
                    <h2>The Promise</h2>
                    <p>Write your beautiful love letter here.</p>
                </div>
                <div class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">From</label>
                            <input type="text" class="form-input" 
                                value="${state.config?.promise?.letterFrom || 'My Heart'}"
                                oninput="state.updateField('promise', 'letterFrom', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">To</label>
                            <input type="text" class="form-input" 
                                value="${state.config?.promise?.letterTo || 'The One I Love'}"
                                oninput="state.updateField('promise', 'letterTo', this.value)">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Letter Date</label>
                        <input type="text" class="form-input" 
                            value="${state.config?.promise?.letterDate || ''}"
                            placeholder="e.g. Monday, February 10, 2026"
                            oninput="state.updateField('promise', 'letterDate', this.value)">
                        <p class="form-hint">Leave empty to use the current date automatically.</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Letter Title</label>
                        <input type="text" class="form-input" 
                            value="${state.config?.promise?.letterTitle || 'A Letter Across the Miles'}"
                            oninput="state.updateField('promise', 'letterTitle', this.value)">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Love Letter Content</label>
                        <textarea class="form-textarea" rows="12"
                            oninput="state.updateField('promise', 'letterContent', this.value)"
                        >${state.config?.promise?.letterContent || ''}</textarea>
                        <p class="form-hint">Write from the heart. This will appear in the animated letter.</p>
                    </div>
                </div>
            `;
        }
    }
];

const TIMEZONES = [
    { value: 'Pacific/Midway', label: 'Midway Island (GMT-11)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (GMT-10)' },
    { value: 'America/Anchorage', label: 'Alaska (GMT-9)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (GMT-8)' },
    { value: 'America/Denver', label: 'Mountain Time (GMT-7)' },
    { value: 'America/Chicago', label: 'Central Time (GMT-6)' },
    { value: 'America/New_York', label: 'Eastern Time (GMT-5)' },
    { value: 'America/Caracas', label: 'Caracas (GMT-4)' },
    { value: 'America/Sao_Paulo', label: 'Sao Paulo (GMT-3)' },
    { value: 'Atlantic/Azores', label: 'Azores (GMT-1)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'Europe/Athens', label: 'Athens (GMT+2)' },
    { value: 'Europe/Moscow', label: 'Moscow (GMT+3)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
    { value: 'Asia/Karachi', label: 'Karachi (GMT+5)' },
    { value: 'Asia/Dhaka', label: 'Dhaka (GMT+6)' },
    { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
    { value: 'Asia/Jakarta', label: 'Jakarta (GMT+7)' },
    { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
    { value: 'Asia/Makassar', label: 'Makassar (GMT+8)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
    { value: 'Asia/Jayapura', label: 'Jayapura (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Sydney (GMT+10)' },
    { value: 'Pacific/Auckland', label: 'Auckland (GMT+12)' }
];

const ICONS = [
    'favorite', 'location_on', 'flight', 'celebration', 'event',
    'movie', 'restaurant', 'nightlight', 'sports_esports', 'stadia_controller',
    'music_note', 'photo_camera', 'chat', 'call', 'videocam',
    'send', 'mail', 'card_giftcard', 'cake', 'star'
];
