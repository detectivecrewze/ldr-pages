// Renderers for dynamic content

const renderers = {
    // Render sidebar navigation
    renderSidebar() {
        const nav = document.getElementById('sidebarNav');
        if (!nav) return;

        nav.innerHTML = WIZARD_STEPS.map((step, index) => {
            const isActive = index === state.currentStep;
            const isCompleted = index < state.currentStep;

            return `
                <div class="sidebar-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                     onclick="app.goToStep(${index})">
                    <div class="sidebar-icon">
                        <span class="material-symbols-outlined">${step.icon}</span>
                    </div>
                    <div class="sidebar-text">
                        <div class="sidebar-title">${step.title}</div>
                        <div class="sidebar-desc">${step.description}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Generic collapsible renderer
    renderCollapsible(index, title, description, bodyContent, onRemove = null, isOpen = false) {
        return `
            <div class="dynamic-item ${!isOpen ? 'is-collapsed' : ''}" data-index="${index}">
                <div class="item-header" onclick="renderers.toggleCollapsible(this)">
                    <div class="item-badge">${index + 1}</div>
                    <div class="item-summary">
                        <div class="item-summary-title">${title || 'Untitled'}</div>
                        <div class="item-summary-desc">${description || 'No date set'}</div>
                    </div>
                    <div class="item-actions">
                        ${onRemove ? `
                            <button type="button" class="remove-btn" onclick="event.stopPropagation(); ${onRemove}">
                                <span class="material-symbols-outlined text-sm">delete</span>
                            </button>
                        ` : ''}
                        <span class="material-symbols-outlined expand-icon">expand_more</span>
                    </div>
                </div>
                <div class="item-body">
                    ${bodyContent}
                </div>
            </div>
        `;
    },

    toggleCollapsible(header) {
        const item = header.closest('.dynamic-item');
        item.classList.toggle('is-collapsed');
    },

    // Render milestones
    renderMilestones() {
        const milestones = state.config.journeyMap?.milestones || [];

        return milestones.map((milestone, index) => {
            const inputId = `milestone_photo_${index}`;
            const bodyContent = `
                <div class="space-y-4 pt-2">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label text-xs">Date</label>
                            <input type="date" class="form-input array-item-input" data-field="date" 
                                value="${milestone.date}" oninput="this.closest('.dynamic-item').querySelector('.item-summary-desc').textContent = this.value">
                        </div>
                        <div class="form-group">
                            <label class="form-label text-xs">Icon</label>
                            <select class="form-input array-item-input" data-field="icon">
                                ${ICONS.map(icon => `
                                    <option value="${icon}" ${milestone.icon === icon ? 'selected' : ''}>${icon}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label text-xs">Photo (Optional)</label>
                        <div class="flex gap-2">
                            <img id="prev_${inputId}" src="${milestone.image || ''}" class="w-10 h-10 object-cover rounded shadow-sm ${milestone.image ? '' : 'hidden'}">
                            <input type="text" id="${inputId}" class="form-input array-item-input flex-1 !text-[10px]" data-field="image" 
                                value="${milestone.image || ''}" placeholder="Image URL">
                            <label class="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded-lg flex items-center justify-center transition-colors">
                                <span class="material-symbols-outlined text-sm">upload</span>
                                <input type="file" class="hidden" accept="image/*" onchange="utils.handleMediaUpload(this, '${inputId}')">
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label text-xs">Event Name</label>
                        <input type="text" class="form-input array-item-input" data-field="event" 
                            value="${milestone.event}" placeholder="e.g. First Met"
                            oninput="this.closest('.dynamic-item').querySelector('.item-summary-title').textContent = this.value || 'Untitled'">
                    </div>
                    <div class="form-group">
                        <label class="form-label text-xs">Location</label>
                        <input type="text" id="milestone_location_${index}" class="form-input array-item-input" data-field="location" 
                            value="${milestone.location}" placeholder="City, Country">
                    </div>
                </div>
            `;
            return this.renderCollapsible(index, milestone.event, milestone.date, bodyContent, `renderers.removeArrayItem(this); state.saveArrayItems('milestones', 'journeyMap')`);
        }).join('');
    },

    addMilestone() {
        const container = document.getElementById('milestonesList');
        const index = container.querySelectorAll('.dynamic-item').length;
        const inputId = `milestone_photo_new_${index}`;
        const bodyContent = `
            <div class="space-y-4 pt-2">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label text-xs">Date</label>
                        <input type="date" class="form-input array-item-input" data-field="date" 
                            value="${new Date().toISOString().split('T')[0]}" oninput="this.closest('.dynamic-item').querySelector('.item-summary-desc').textContent = this.value">
                    </div>
                    <div class="form-group">
                        <label class="form-label text-xs">Icon</label>
                        <select class="form-input array-item-input" data-field="icon">
                            ${ICONS.map(icon => `<option value="${icon}">${icon}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label text-xs">Photo (Optional)</label>
                    <div class="flex gap-2">
                        <img id="prev_${inputId}" src="" class="w-10 h-10 object-cover rounded shadow-sm hidden">
                        <input type="text" id="${inputId}" class="form-input array-item-input flex-1 !text-[10px]" data-field="image" 
                            value="" placeholder="https://...">
                        <label class="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded-lg flex items-center justify-center transition-colors">
                            <span class="material-symbols-outlined text-sm">upload</span>
                            <input type="file" class="hidden" accept="image/*" onchange="utils.handleMediaUpload(this, '${inputId}')">
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label text-xs">Event Name</label>
                    <input type="text" class="form-input array-item-input" data-field="event" 
                        placeholder="e.g. First Met"
                        oninput="this.closest('.dynamic-item').querySelector('.item-summary-title').textContent = this.value || 'Untitled'">
                </div>
                <div class="form-group">
                    <label class="form-label text-xs">Location</label>
                    <input type="text" id="milestone_location_new_${index}" class="form-input array-item-input" data-field="location" 
                        placeholder="City, Country">
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.renderCollapsible(index, 'New Milestone', new Date().toISOString().split('T')[0], bodyContent, `renderers.removeArrayItem(this); state.saveArrayItems('milestones', 'journeyMap')`, true);
        container.appendChild(tempDiv.firstElementChild);
        state.saveArrayItems('milestones', 'journeyMap');
    },

    // Removed redundant Journey Map renderers (Virtual Trips & Dream Destinations)


    // Render playlist
    renderPlaylist() {
        const playlist = state.config?.sharedWorld?.playlist || [];

        return playlist.map((song, index) => {
            const audioId = `song_src_${index}`;
            const coverId = `song_cover_${index}`;
            return `
                <div class="array-item" data-index="${index}">
                    <div class="flex-shrink-0">
                        <div class="relative group">
                            <img id="prev_${coverId}" src="${song.cover || ''}" 
                                class="w-12 h-12 object-cover rounded border border-gray-200 ${song.cover ? '' : 'hidden'}">
                            <div id="placeholder_${coverId}" class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 ${song.cover ? 'hidden' : ''}">
                                <span class="material-symbols-outlined text-gray-400 text-sm">image</span>
                            </div>
                            <label class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer rounded transition-opacity">
                                <span class="material-symbols-outlined text-white text-xs">upload</span>
                                <input type="file" class="hidden" accept="image/*" 
                                    onchange="app.handlePhotoUpload(this, 'sharedWorld', 'playlist', ${index}, 'cover', '${coverId}')">
                            </label>
                        </div>
                    </div>
                    <div class="flex-1 space-y-2">
                        <div class="flex gap-2">
                            <input type="text" class="array-item-input flex-1" data-field="title"
                                value="${song.title || ''}" placeholder="Song title">
                            <input type="text" class="array-item-input" data-field="artist"
                                value="${song.artist || ''}" placeholder="Artist" style="width: 120px;">
                        </div>
                        <div class="flex gap-2 items-center">
                            <input type="text" id="${audioId}" class="array-item-input flex-1 !text-[10px]" data-field="url"
                                value="${song.url || ''}" placeholder="Audio URL">
                            <label class="cursor-pointer bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg flex items-center justify-center transition-colors border border-indigo-100">
                                <span class="material-symbols-outlined text-sm text-indigo-600">upload</span>
                                <input type="file" class="hidden" accept="audio/*" onchange="app.handleAudioUpload(this, ${index})">
                            </label>
                        </div>
                    </div>
                    <button class="array-item-remove" onclick="app.removeArrayItem('sharedWorld', 'playlist', ${index})">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                    <input type="hidden" id="${coverId}" class="array-item-input" data-field="cover" value="${song.cover || ''}">
                </div>
            `;
        }).join('');
    },

    addPlaylistItem() {
        app.addArrayItem('sharedWorld', 'playlist', { title: '', artist: '', url: '', cover: '' });
    },

    // Render date ideas
    renderDateIdeas() {
        const ideas = state.config.sharedWorld?.dateIdeas || [];

        return ideas.map((idea, index) => `
            <div class="array-item" data-index="${index}">
                <select class="array-item-input" data-field="icon" style="width: 100px;">
                    <option value="movie" ${idea.icon === 'movie' ? 'selected' : ''}>Movie</option>
                    <option value="restaurant" ${idea.icon === 'restaurant' ? 'selected' : ''}>Cook</option>
                    <option value="nightlight" ${idea.icon === 'nightlight' ? 'selected' : ''}>Stars</option>
                    <option value="sports_esports" ${idea.icon === 'sports_esports' ? 'selected' : ''}>Game</option>
                </select>
                <input type="text" class="array-item-input" data-field="title" 
                    value="${idea.title}" placeholder="Date idea" style="width: 140px;">
                <input type="text" class="array-item-input" data-field="description" 
                    value="${idea.description}" placeholder="Description" style="flex: 1;">
                <button class="array-item-remove" onclick="renderers.removeArrayItem(this)">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `).join('');
    },

    addDateIdea() {
        const container = document.getElementById('dateIdeasList');
        const newItem = document.createElement('div');
        newItem.className = 'array-item';
        newItem.innerHTML = `
            <select class="array-item-input" data-field="icon" style="width: 100px;">
                <option value="movie">Movie</option>
                <option value="restaurant">Cook</option>
                <option value="nightlight">Stars</option>
                <option value="sports_esports">Game</option>
            </select>
            <input type="text" class="array-item-input" data-field="title" 
                placeholder="Date idea" style="width: 140px;">
            <input type="text" class="array-item-input" data-field="description" 
                placeholder="Description" style="flex: 1;">
            <button class="array-item-remove" onclick="renderers.removeArrayItem(this)">
                <span class="material-symbols-outlined">delete</span>
            </button>
        `;
        container.appendChild(newItem);
    },

    // Photos rendering is handled in renderMemories Step below

    // Render promises
    renderPromises() {
        const promises = state.config.promise?.promises || [];

        return promises.map((promise, index) => `
            <div class="array-item" data-index="${index}">
                <input type="text" class="array-item-input" data-field="text" 
                    value="${promise}" placeholder="Your promise..." style="flex: 1;">
                <button class="array-item-remove" onclick="renderers.removeArrayItem(this)">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `).join('');
    },

    addPromise() {
        const container = document.getElementById('promisesList');
        const newItem = document.createElement('div');
        newItem.className = 'array-item';
        newItem.innerHTML = `
            <input type="text" class="array-item-input" data-field="text" 
                placeholder="I promise to..." style="flex: 1;">
            <button class="array-item-remove" onclick="renderers.removeArrayItem(this)">
                <span class="material-symbols-outlined">delete</span>
            </button>
        `;
        container.appendChild(newItem);
    },

    // Remove array item
    removeArrayItem(el) {
        const item = el.closest('.array-item, .dynamic-item');
        if (!item) return;

        const container = item.parentElement;
        item.remove();

        // Trigger input event on container to trigger autosave if it has oninput
        if (container) {
            container.dispatchEvent(new Event('input', { bubbles: true }));
        }
    },

    // Render the dynamic page step content
    renderPageStep(step) {
        // Find the original step definition in WIZARD_STEPS by ID or type
        const originalStep = WIZARD_STEPS.find(s => s.id === step.id || s.id === step.type);
        if (originalStep && originalStep.render) {
            return originalStep.render();
        }

        // Fallback: render based on page type
        switch (step.type) {
            case 'memories':
                return this.renderMemoriesStep();
            case 'messenger':
                return this.renderMessengerStep();
            case 'sweeper':
                return this.renderSweeperStep();
            case 'bucketlist':
                return this.renderBucketListStep();
            case 'quiz':
                return this.renderQuizStep();
            case 'video':
                return this.renderVideoStep();
            default:
                return this.renderGenericStep(step);
        }
    },

    // Duplicate step logic removed to favor active version at the bottom of the file

    // Render Messenger Step
    renderMessengerStep() {
        const messenger = state.config?.messenger || { chats: [] };
        const chats = messenger.chats || [];

        return `
            <div class="step-header">
                <h2>Love Messenger</h2>
                <p>Customize the chat history and partner profile.</p>
            </div>
            <div class="space-y-8">
                <!-- Profile Settings -->
                <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                    <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                        <span class="material-symbols-outlined text-blue-500">person_search</span>
                        Messenger Profile
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        <div class="form-group border-b border-blue-100/50 pb-4 sm:col-span-2">
                             <div class="text-[10px] font-bold text-blue-400 mb-2 uppercase">Your Profile (Me)</div>
                             <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="form-label !text-[9px] !uppercase !font-bold !text-gray-400">Your Name</label>
                                    <input type="text" class="form-input !bg-white/80 border-blue-100 !text-xs" 
                                        value="${messenger.yourName || 'You'}"
                                        placeholder="e.g. You"
                                        oninput="state.updateField('messenger', 'yourName', this.value)">
                                </div>
                                <div>
                                    <label class="form-label !text-[9px] !uppercase !font-bold !text-gray-400">Your Avatar</label>
                                    <input type="text" class="form-input !bg-white/80 border-blue-100 !text-xs" 
                                        value="${messenger.yourAvatar || '😊'}"
                                        placeholder="e.g. 😊"
                                        oninput="state.updateField('messenger', 'yourAvatar', this.value)">
                                </div>
                             </div>
                        </div>

                        <div class="form-group border-b border-blue-100/50 pb-4 sm:col-span-2">
                             <div class="text-[10px] font-bold text-rose-400 mb-2 uppercase">Partner Profile (Them)</div>
                             <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="form-label !text-[9px] !uppercase !font-bold !text-gray-400">Their Name</label>
                                    <input type="text" class="form-input !bg-white/80 border-blue-100 !text-xs" 
                                        value="${messenger.userName || 'My Love'}"
                                        placeholder="e.g. My Love"
                                        oninput="state.updateField('messenger', 'userName', this.value)">
                                </div>
                                <div>
                                    <label class="form-label !text-[9px] !uppercase !font-bold !text-gray-400">Their Avatar</label>
                                    <input type="text" class="form-input !bg-white/80 border-blue-100 !text-xs" 
                                        value="${messenger.userAvatar || '❤️'}"
                                        placeholder="e.g. ❤️"
                                        oninput="state.updateField('messenger', 'userAvatar', this.value)">
                                </div>
                             </div>
                        </div>
                        
                        <div class="form-group sm:col-span-2">
                            <label class="form-label !text-[9px] !uppercase !font-bold !text-gray-400">Their Status</label>
                            <input type="text" class="form-input !bg-white/80 border-blue-100 !text-xs" 
                                value="${messenger.userStatus || 'Distance means so little...'}"
                                placeholder="e.g. Online"
                                oninput="state.updateField('messenger', 'userStatus', this.value)">
                        </div>
                    </div>
                </div>

                <!-- Chat History -->
                <div class="form-group">
                    <label class="form-label flex items-center gap-2 !text-gray-900 !font-bold">
                        <span class="material-symbols-outlined text-rose-500">forum</span>
                        Chat History Sessions
                    </label>
                    <p class="form-hint mb-6">Create multiple chat sessions (e.g., "Intro", "Long Distance", "Our Future"). Each session can have many messages. Click "Add Message" inside a session to add more texts.</p>
                    
                    <div id="chatsList" class="space-y-4" oninput="state.saveMessengerChats()">
                        ${this.renderMessengerChats(chats)}
                    </div>

                    <button class="add-item-btn mt-8 w-full justify-center !py-3 !bg-emerald-500 !text-white !border-0 hover:!bg-emerald-600 transition-all shadow-md group" 
                        onclick="renderers.addMessengerChat()">
                        <span class="material-symbols-outlined group-hover:rotate-90 transition-transform">add_box</span>
                        Add New Chat Session (Group of Messages)
                    </button>
                </div>
            </div>
        `;
    },

    renderMessengerChats(chats) {
        if (!chats || chats.length === 0) {
            return `
                <div class="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <div class="text-4xl mb-3 opacity-30">💭</div>
                    <p class="text-gray-400 text-sm italic">No chat history yet. Start by adding a session!</p>
                </div>
            `;
        }

        return chats.map((chat, dayIndex) => {
            const bodyContent = `
                <div class="space-y-4 pt-2" data-day-index="${dayIndex}">
                    <div class="form-group">
                        <label class="form-label !text-[10px] !uppercase !font-bold !text-gray-400">Session Date/Label</label>
                        <input type="text" class="form-input array-item-input !bg-white" data-field="date" 
                            value="${chat.date || ''}" placeholder="e.g. January 15, 2023"
                            oninput="this.closest('.dynamic-item').querySelector('.item-summary-desc').textContent = this.value">
                    </div>

                    <div class="form-group border-t border-gray-100 pt-4">
                        <div class="flex items-center justify-between mb-3">
                            <label class="form-label !m-0 !text-[10px] !uppercase !font-bold !text-gray-400">Messages</label>
                            <button class="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-bold hover:bg-rose-100 transition-all border border-rose-100"
                                onclick="renderers.addMessengerMessage(${dayIndex})">
                                <span class="material-symbols-outlined text-xs">add</span>
                                Add Message
                            </button>
                        </div>
                        <div class="messages-list space-y-3" id="messagesList_${dayIndex}">
                            ${this.renderMessengerMessages(chat.messages || [], dayIndex)}
                        </div>
                    </div>
                </div>
            `;
            return this.renderCollapsible(dayIndex, `Session #${dayIndex + 1}`, chat.date || 'Empty Date', bodyContent, `renderers.removeMessengerChat(${dayIndex})`, dayIndex === chats.length - 1);
        }).join('');
    },

    renderMessengerMessages(messages, dayIndex) {
        if (!messages || messages.length === 0) {
            return '<div class="text-gray-400 text-[10px] italic p-4 bg-white/50 rounded-lg border border-dashed border-gray-200 text-center">No messages in this session yet.</div>';
        }

        return messages.map((msg, msgIndex) => `
            <div class="message-item bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group hover:border-blue-200 transition-all" data-msg-index="${msgIndex}">
                <div class="grid grid-cols-12 gap-3 items-start">
                    <div class="col-span-12 sm:col-span-3">
                        <label class="text-[8px] text-gray-400 uppercase font-black block mb-1 tracking-tighter">Sender</label>
                        <select class="form-input !text-[11px] !p-1 !h-8 !bg-gray-50 border-gray-100" data-field="sender">
                            <option value="them" ${msg.sender === 'them' ? 'selected' : ''}>Partner (Them)</option>
                            <option value="me" ${msg.sender === 'me' ? 'selected' : ''}>You (Me)</option>
                        </select>
                    </div>
                    <div class="col-span-12 sm:col-span-9">
                        <label class="text-[8px] text-gray-400 uppercase font-black block mb-1 tracking-tighter">Message Content</label>
                        <textarea class="form-input !text-[11px] !p-2 min-h-[50px] !bg-gray-50 border-gray-100" data-field="text" 
                             placeholder="Type message content...">${msg.text || ''}</textarea>
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label class="text-[8px] text-gray-400 uppercase font-black block mb-1 tracking-tighter">Display Name</label>
                        <input type="text" class="form-input !text-[10px] !p-1 !h-8 !bg-gray-50 border-gray-100" data-field="name" 
                            value="${msg.name || ''}" placeholder="e.g. My Love">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label class="text-[8px] text-gray-400 uppercase font-black block mb-1 tracking-tighter">Time</label>
                        <input type="text" class="form-input !text-[10px] !p-1 !h-8 !bg-gray-50 border-gray-100" data-field="time" 
                            value="${msg.time || ''}" placeholder="19:30">
                    </div>
                </div>
                <button class="absolute -top-2 -right-2 w-7 h-7 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center border border-gray-100 shadow-md hover:bg-red-50"
                    onclick="renderers.removeMessengerMessage(${dayIndex}, ${msgIndex})">
                    <span class="material-symbols-outlined text-sm font-bold">close</span>
                </button>
            </div>
        `).join('');
    },

    addMessengerChat() {
        // Sync current UI state first
        state.saveMessengerChats();

        const chats = state.config?.messenger?.chats || [];
        chats.push({
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            messages: [
                { sender: 'them', name: 'Partner', text: 'Hello! This is a new session.', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }
            ]
        });

        if (!state.config.messenger) state.config.messenger = {};
        state.config.messenger.chats = chats;
        state.hasChanges = true;
        state.saveToStorage();
        state.broadcastUpdate();
        app.renderStep();
        utils.showNotification('New session added!', 'success');
    },

    removeMessengerChat(index) {
        if (!confirm('Delete this entire chat session and all its messages?')) return;

        // Sync current UI state first
        state.saveMessengerChats();

        const chats = state.config?.messenger?.chats || [];
        chats.splice(index, 1);

        state.saveToStorage();
        state.broadcastUpdate();
        app.renderStep();
        utils.showNotification('Session removed');
    },

    addMessengerMessage(dayIndex) {
        // IMPORTANT: Sync current UI state to state.config first!
        state.saveMessengerChats();

        const chats = state.config?.messenger?.chats || [];
        if (!chats[dayIndex]) return;

        if (!chats[dayIndex].messages) chats[dayIndex].messages = [];

        chats[dayIndex].messages.push({
            sender: 'me',
            name: 'You',
            text: '',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        });

        state.saveToStorage();
        state.broadcastUpdate();
        app.renderStep();

        // Small delay to scroll to the bottom or focus the new message if possible
        setTimeout(() => {
            const msgs = document.querySelectorAll(`#messagesList_${dayIndex} .message-item`);
            if (msgs.length > 0) {
                msgs[msgs.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                msgs[msgs.length - 1].querySelector('textarea')?.focus();
            }
        }, 100);
    },

    removeMessengerMessage(dayIndex, msgIndex) {
        // Sync current UI state first
        state.saveMessengerChats();

        const chats = state.config?.messenger?.chats || [];
        if (!chats[dayIndex] || !chats[dayIndex].messages) return;

        chats[dayIndex].messages.splice(msgIndex, 1);

        state.saveToStorage();
        state.broadcastUpdate();
        app.renderStep();
    },

    // Render Sweeper (Game) Step
    renderSweeperStep() {
        return `
            <div class="step-header">
                <h2>Heart Sweeper Game</h2>
                <p>This is a fun minesweeper-style game. No configuration needed!</p>
            </div>
            <div class="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-2xl border border-rose-100 text-center">
                <div class="text-6xl mb-4">💣</div>
                <h3 class="font-bold text-gray-900 mb-2">Interactive Mini-Game</h3>
                <p class="text-gray-600">A minesweeper clone with hearts instead of mines. Your partner will love finding all the hidden hearts!</p>
            </div>
        `;
    },

    // Render Bucket List Step
    renderBucketListStep() {
        const bucketList = state.config?.bucketList || {};
        const categories = [
            { id: 'daily', name: 'Daily Life' },
            { id: 'adventure', name: 'Adventures' },
            { id: 'food', name: 'Food & Dining' }
        ];

        return `
            <div class="step-header">
                <h2>Our Bucket List</h2>
                <p>Curate your future memories and shared goals together.</p>
            </div>
            
            <div class="space-y-10">
                ${categories.map(cat => `
                    <div class="form-group border-b border-gray-100 pb-8 last:border-0">
                        <label class="form-label flex items-center gap-2 !text-gray-900 !font-black !uppercase !tracking-widest">
                            <span class="material-symbols-outlined text-rose-500">${this.getBucketCategoryIcon(cat.id)}</span>
                            ${cat.name}
                        </label>
                        <div class="array-items mt-4 space-y-3" id="${cat.id}List" oninput="state.saveArrayItems('${cat.id}', 'bucketList')">
                            ${this.renderBucketCategoryItems(bucketList[cat.id] || [], cat.id)}
                        </div>
                        <button class="add-item-btn mt-6 !border-dashed !border-gray-200 hover:!border-rose-400 hover:!text-rose-600 !py-3" 
                            onclick="renderers.addBucketItem('${cat.id}')">
                            <span class="material-symbols-outlined">add</span>
                            Add ${cat.name} Goal
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getBucketCategoryIcon(cat) {
        const icons = {
            daily: 'calendar_today',
            adventure: 'explore',
            food: 'restaurant'
        };
        return icons[cat] || 'list';
    },

    renderBucketCategoryItems(items, cat) {
        if (!items || items.length === 0) {
            return `
                <div class="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p class="text-gray-400 text-xs italic">No ${cat} goals yet.</p>
                </div>
            `;
        }

        return items.map((item, index) => `
            <div class="array-item flex-col !items-start gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-rose-300 transition-all" data-index="${index}">
                <div class="flex items-start gap-4 w-full">
                    <div class="pt-1">
                        <input type="checkbox" class="w-5 h-5 rounded text-rose-500 border-gray-300 focus:ring-rose-500 cursor-pointer" 
                            data-field="done" ${item.done ? 'checked' : ''}>
                    </div>
                    <div class="flex-1">
                        <textarea class="array-item-input !bg-transparent !border-0 !p-0 !text-sm font-semibold text-gray-800 placeholder:text-gray-300 w-full resize-none h-auto min-h-[20px]" 
                            data-field="text" placeholder="What do you want to do?" rows="1"
                            oninput="this.style.height = 'px'; this.style.height = this.scrollHeight + 'px'">${item.text || ''}</textarea>
                    </div>
                    
                    <button class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        onclick="renderers.removeBucketItem('${cat}', ${index})">
                        <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                
                <div class="flex items-center gap-4 w-full pt-2 border-t border-gray-50">
                    <label class="flex items-center gap-2 cursor-pointer group/label">
                        <input type="checkbox" class="w-4 h-4 rounded-full text-amber-500 border-gray-300 focus:ring-amber-500" 
                            data-field="priority" ${item.priority ? 'checked' : ''}>
                        <span class="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover/label:text-amber-600 transition-colors">High Priority</span>
                    </label>
                </div>
            </div>
        `).join('');
    },

    addBucketItem(cat) {
        if (!state.config.bucketList) state.config.bucketList = {};
        if (!state.config.bucketList[cat]) state.config.bucketList[cat] = [];

        state.config.bucketList[cat].push({ text: '', done: false, priority: false });
        state.hasChanges = true;
        state.saveToStorage();
        state.broadcastUpdate();
        app.renderStep();

        // Focus the new item
        setTimeout(() => {
            const list = document.getElementById(`${cat}List`);
            if (list) {
                const textareas = list.querySelectorAll('textarea');
                if (textareas.length > 0) {
                    textareas[textareas.length - 1].focus();
                }
            }
        }, 100);
    },

    removeBucketItem(cat, index) {
        if (state.config.bucketList && state.config.bucketList[cat]) {
            state.config.bucketList[cat].splice(index, 1);
            state.hasChanges = true;
            state.saveToStorage();
            state.broadcastUpdate();
            app.renderStep();
        }
    },

    // Render Quiz Step
    renderQuizStep() {
        const questions = state.config?.quiz?.questions || [];
        return `
            <div class="step-header">
                <h2>Love Quiz</h2>
                <p>Test how well you know each other.</p>
            </div>
            <div class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Quiz Questions</label>
                    <div class="array-items" id="questionsList" oninput="state.saveArrayItems('questions', 'quiz')">
                        ${this.renderQuizQuestions()}
                    </div>
                    <button class="add-item-btn" onclick="renderers.addQuizQuestion()">
                        <span class="material-symbols-outlined">add</span>
                        Add Question
                    </button>
                </div>
            </div>
        `;
    },

    renderQuizQuestions() {
        const questions = state.config?.quiz?.questions || [];
        if (questions.length === 0) {
            return '<p class="text-gray-400 text-sm italic">No questions yet. Add some!</p>';
        }
        return questions.map((q, index) => `
            <div class="array-item" data-index="${index}">
                <div class="flex-1 space-y-2">
                    <input type="text" class="array-item-input w-full" data-field="question" 
                        value="${q.question || ''}" placeholder="Question">
                    <div class="grid grid-cols-2 gap-2">
                        ${(q.answers || []).map((ans, i) => `
                            <input type="text" class="array-item-input" data-field="answer${i}" 
                                value="${ans}" placeholder="Answer ${i + 1}">
                        `).join('')}
                    </div>
                    <input type="number" class="array-item-input" data-field="correct" 
                        value="${q.correct || 0}" placeholder="Correct answer index (0-3)" style="width: 200px;">
                </div>
                <button class="array-item-remove" onclick="renderers.removeArrayItem(this)">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `).join('');
    },

    addQuizQuestion() {
        const container = document.getElementById('questionsList');
        if (!container) return;
        const newItem = document.createElement('div');
        newItem.className = 'array-item';
        newItem.innerHTML = `
            <div class="flex-1 space-y-2">
                <input type="text" class="array-item-input w-full" data-field="question" 
                    placeholder="Question">
                <div class="grid grid-cols-2 gap-2">
                    <input type="text" class="array-item-input" data-field="answer0" placeholder="Answer 1">
                    <input type="text" class="array-item-input" data-field="answer1" placeholder="Answer 2">
                    <input type="text" class="array-item-input" data-field="answer2" placeholder="Answer 3">
                    <input type="text" class="array-item-input" data-field="answer3" placeholder="Answer 4">
                </div>
                <input type="number" class="array-item-input" data-field="correct" 
                    value="0" placeholder="Correct answer index (0-3)" style="width: 200px;">
            </div>
            <button class="array-item-remove" onclick="renderers.removeArrayItem(this)">
                <span class="material-symbols-outlined">delete</span>
            </button>
        `;
        container.appendChild(newItem);
    },

    // Render Video Step
    renderVideoStep() {
        return `
            <div class="step-header">
                <h2>Video Vault</h2>
                <p>Add video memories and special moments.</p>
            </div>
            <div class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Video Memories</label>
                    <div class="array-items" id="videosList">
                        ${renderers.renderVideos?.() || '<p class="text-gray-400 text-sm">No videos yet</p>'}
                    </div>
                    <button class="add-item-btn" onclick="renderers.addVideo?.()">
                        <span class="material-symbols-outlined">add</span>
                        Add Video
                    </button>
                </div>
            </div>
        `;
    },

    // Generic step for unconfigured pages
    renderGenericStep(step) {
        return `
            <div class="step-header">
                <h2>${step.name}</h2>
                <p>This page is ready to use! No additional configuration needed.</p>
            </div>
            <div class="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-100 text-center">
                <div class="text-6xl mb-4">✨</div>
                <h3 class="font-bold text-gray-900 mb-2">Page Ready</h3>
                <p class="text-gray-600">This page is functional and will display properly. Edit data.js directly for advanced customization.</p>
            </div>
        `;
    },

    // Render Page Manager Step
    renderPageManagerStep() {
        const pages = state.getPages(false); // Get all pages including disabled

        let pagesHtml = pages.map(page => {
            const isDisabled = page.required ? 'disabled' : '';
            const requiredBadge = page.required ? `<span class="page-required">Required</span>` : '';

            return `
                <div class="page-manager-item" data-id="${page.id}" draggable="${!page.required}">
                    <div class="page-manager-drag">
                        <span class="material-symbols-outlined">drag_indicator</span>
                    </div>
                    <div class="page-manager-icon">
                        <span class="material-symbols-outlined">${page.icon}</span>
                    </div>
                    <div class="page-manager-info">
                        <div class="page-manager-name">${page.name} ${requiredBadge}</div>
                        <div class="page-manager-desc">${PAGE_TYPES[page.type]?.description || ''}</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" onchange="app.togglePage('${page.id}', this.checked)" 
                            ${page.enabled ? 'checked' : ''} ${isDisabled}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            `;
        }).join('');

        return `
            <div class="step-header">
                <h2>Manage Your Story Chapters</h2>
                <p>Enable, disable, and drag to reorder the pages of your experience.</p>
            </div>

            <div class="presets-container mb-8">
                <label class="form-label mb-3">Quick Presets</label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${Object.entries(PAGE_PRESETS).map(([id, preset]) => `
                        <button class="preset-card" onclick="state.applyPagePreset('${id}')">
                            <div class="preset-icon">
                                <span class="material-symbols-outlined">${preset.icon}</span>
                            </div>
                            <div class="preset-name">${preset.name}</div>
                            <div class="preset-desc">${preset.description}</div>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="page-manager-container">
                <label class="form-label mb-3">Page Order & Visibility</label>
                <div id="pageList" class="page-manager-list">
                    ${pagesHtml}
                </div>
                <p class="form-hint mt-4">
                    <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle;">info</span>
                    Login and The Promise (Letter) are required for the story structure.
                </p>
            </div>
        `;
    },

    // Render Map Pins
    renderPins() {
        const pins = state.config.journeyMap?.pins || [];

        return pins.map((pin, index) => {
            const inputId = `pin_photo_${index}`;
            const coordsId = `pin_coords_${index}`;
            const bodyContent = `
                <div class="space-y-4 pt-2">
                    <div class="form-group">
                        <label class="form-label text-xs">Highlights Photo</label>
                        <div class="flex gap-2">
                            <img id="prev_${inputId}" src="${pin.photo || ''}" class="w-16 h-16 object-cover rounded shadow-sm ${pin.photo ? '' : 'hidden'}">
                            <div class="flex-1 space-y-2">
                                <input type="text" id="${inputId}" class="form-input array-item-input !text-[10px]" data-field="photo" 
                                    value="${pin.photo}" placeholder="Photo URL">
                                <label class="flex items-center justify-center gap-2 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-rose-100 transition-colors border border-rose-100">
                                    <span class="material-symbols-outlined text-sm">upload</span>
                                    Upload Photo
                                    <input type="file" class="hidden" accept="image/*" onchange="utils.handleMediaUpload(this, '${inputId}')">
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label text-xs">Label</label>
                            <input type="text" id="pin_label_${index}" class="form-input array-item-input" data-field="label" 
                                value="${pin.label}" placeholder="Place name"
                                oninput="this.closest('.dynamic-item').querySelector('.item-summary-title').textContent = this.value || 'Untitled'">
                        </div>
                        <div class="form-group">
                            <label class="form-label text-xs">Date</label>
                            <input type="date" id="pin_date_${index}" class="form-input array-item-input" data-field="date" 
                                value="${pin.date}" oninput="this.closest('.dynamic-item').querySelector('.item-summary-desc').textContent = this.value">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label text-xs">Location Coordinates</label>
                        <div class="flex gap-2">
                            <input type="text" id="${coordsId}" class="form-input array-item-input flex-1 !text-xs bg-gray-50" 
                                data-field="coords" data-type="coords" 
                                value="${(pin.coords || [0, 0]).join(', ')}" readonly>
                            <button type="button" class="bg-indigo-50 text-indigo-600 p-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                onclick="mapPicker.openForPin('${coordsId}')">
                                <span class="material-symbols-outlined">map</span>
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label text-xs">Notes</label>
                        <textarea class="form-textarea array-item-input min-h-[60px] !text-xs" data-field="note" 
                            placeholder="Tell the story of this place...">${pin.note || ''}</textarea>
                    </div>
                </div>
            `;
            return this.renderCollapsible(index, pin.label, pin.date, bodyContent, `renderers.removeArrayItem(this); state.saveArrayItems('pins', 'journeyMap')`);
        }).join('');
    },

    addPin() {
        const container = document.getElementById('pinsList');
        const index = container.querySelectorAll('.dynamic-item').length;
        const inputId = `pin_photo_new_${index}`;
        const coordsId = `pin_coords_new_${index}`;
        const bodyContent = `
            <div class="space-y-4 pt-2">
                <div class="form-group">
                    <label class="form-label text-xs">Highlights Photo</label>
                    <div class="flex gap-2">
                        <img id="prev_${inputId}" src="" class="w-16 h-16 object-cover rounded shadow-sm hidden">
                        <div class="flex-1 space-y-2">
                            <input type="text" id="${inputId}" class="form-input array-item-input !text-[10px]" data-field="photo" 
                                placeholder="https://...">
                            <label class="flex items-center justify-center gap-2 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-rose-100 transition-colors border border-rose-100">
                                <span class="material-symbols-outlined text-sm">upload</span>
                                Upload Photo
                                <input type="file" class="hidden" accept="image/*" onchange="utils.handleMediaUpload(this, '${inputId}')">
                            </label>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label text-xs">Label</label>
                        <input type="text" id="pin_label_new_${index}" class="form-input array-item-input" data-field="label" 
                            placeholder="Place name"
                            oninput="this.closest('.dynamic-item').querySelector('.item-summary-title').textContent = this.value || 'Untitled'">
                    </div>
                    <div class="form-group">
                        <label class="form-label text-xs">Date</label>
                        <input type="date" id="pin_date_new_${index}" class="form-input array-item-input" data-field="date" 
                            value="${new Date().toISOString().split('T')[0]}" 
                            oninput="this.closest('.dynamic-item').querySelector('.item-summary-desc').textContent = this.value">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label text-xs">Location Coordinates</label>
                    <div class="flex gap-2">
                        <input type="text" id="${coordsId}" class="form-input array-item-input flex-1 !text-xs bg-gray-50" 
                            data-field="coords" data-type="coords" 
                            value="0, 0" readonly>
                        <button type="button" class="bg-indigo-50 text-indigo-600 p-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            onclick="mapPicker.openForPin('${coordsId}')">
                            <span class="material-symbols-outlined">map</span>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label text-xs">Notes</label>
                    <textarea class="form-textarea array-item-input min-h-[60px] !text-xs" data-field="note" 
                        placeholder="Tell the story of this place..."></textarea>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.renderCollapsible(index, 'New Highlight', new Date().toISOString().split('T')[0], bodyContent, `renderers.removeArrayItem(this); state.saveArrayItems('pins', 'journeyMap')`, true);
        container.appendChild(tempDiv.firstElementChild);
        state.saveArrayItems('pins', 'journeyMap');
    },

    // Render videos
    renderVideos() {
        const videos = state.config.videos || [];
        if (videos.length === 0) {
            return '<p class="text-gray-400 text-sm italic">No videos added yet. Click "Add Video" to start.</p>';
        }

        return videos.map((video, index) => {
            const videoId = `video_url_${index}`;
            return `
                <div class="array-item relative p-4 mb-4 bg-white/60 border border-dashed border-gray-300 rounded-xl group hover:border-blue-400 transition-all shadow-sm">
                    <!-- Moderate tactile decoration -->
                    <div class="absolute -top-1.5 left-1/4 w-10 h-3 bg-white/40 backdrop-blur-sm -rotate-3 rounded-sm pointer-events-none"></div>
                    <div class="absolute -top-1.5 right-1/4 w-10 h-3 bg-white/40 backdrop-blur-sm rotate-3 rounded-sm pointer-events-none"></div>

                    <div class="flex-1 space-y-4">
                            <div class="form-group">
                                <label class="item-label text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Memory Title</label>
                                <input type="text" class="array-item-input w-full !bg-white/50" data-field="title" 
                                    value="${video.title || ''}" placeholder="e.g. Our First Date">
                            </div>
                            <div class="form-group">
                                <label class="item-label text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Duration</label>
                                <input type="text" class="array-item-input w-full !bg-white/50" data-field="duration" 
                                    value="${video.duration || '0:00'}" placeholder="e.g. 2:15">
                            </div>

                        <div class="form-group">
                            <label class="item-label text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Video Source</label>
                            <div class="flex gap-2">
                                <input type="text" id="${videoId}" class="array-item-input flex-1 !text-[11px] !bg-white/50" data-field="url" 
                                    value="${video.url || ''}" placeholder="Upload or paste link...">
                                <label class="cursor-pointer bg-blue-500 hover:bg-blue-600 w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90">
                                    <span class="material-symbols-outlined text-white text-base">upload</span>
                                    <input type="file" class="hidden" accept="video/*" onchange="app.handleVideoUpload(this, ${index})">
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="item-label text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Memory Note</label>
                            <textarea class="array-item-input w-full !text-xs !bg-white/50" data-field="description" 
                                placeholder="Describe this moment..." rows="2">${video.description || ''}</textarea>
                        </div>
                    </div>
                    
                    <button class="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-200 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-50" 
                        onclick="app.removeArrayItem('videos', 'videos', ${index})">
                        <span class="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
            `;
        }).join('');
    },

    addVideo() {
        app.addArrayItem('videos', 'videos', {
            title: 'New Memory',
            duration: '0:00',
            url: '',
            description: ''
        });
    },


    // Render Photo Gallery Step
    renderMemoriesStep() {
        return `
            <div class="step-header">
                <h2>Our Photo Gallery</h2>
                <p>Add and manage the photos that tell your story.</p>
            </div>
            <div class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Gallery Photos</label>
                    <div class="array-items" id="photosList" oninput="state.saveArrayItems('photos', 'sharedWorld')">
                        ${this.renderMemories()}
                    </div>
                    <button class="add-item-btn mt-4" onclick="renderers.addMemory()">
                        <span class="material-symbols-outlined">add_a_photo</span>
                        Add New Photo
                    </button>
                    <p class="form-hint">Changes are saved automatically. You can enter a URL or upload a photo.</p>
                </div>
            </div>
        `;
    },

    renderMemories() {
        const photos = state.config?.sharedWorld?.photos || [];
        if (photos.length === 0) {
            return '<p class="text-gray-400 text-sm italic">No photos added yet. Click "Add New Photo" to start.</p>';
        }

        return photos.map((photo, index) => {
            const inputId = `photo_src_${index}`;
            return `
                <div class="array-item" data-index="${index}">
                    <div class="flex-1 space-y-3">
                        <div class="flex gap-4 items-start">
                            <div class="flex-shrink-0">
                                <img id="prev_${inputId}" src="${photo.url || ''}" 
                                    class="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm ${photo.url ? '' : 'hidden'}"
                                    onerror="this.style.display='none'">
                                <div class="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 ${photo.url ? 'hidden' : ''}" id="placeholder_${inputId}">
                                    <span class="material-symbols-outlined text-gray-400">image</span>
                                </div>
                            </div>
                            <div class="flex-1 space-y-2">
                                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Photo URL / Upload</label>
                                <div class="flex gap-2">
                                    <input type="text" id="${inputId}" class="array-item-input flex-1 !text-xs" 
                                        data-field="url"
                                        value="${photo.url || ''}" placeholder="https://..."
                                        oninput="app.updateArrayItem('sharedWorld', 'photos', ${index}, 'url', this.value); app.updateImagePreview('${inputId}', this.value)">
                                    <label class="cursor-pointer bg-rose-50 hover:bg-rose-100 p-2 rounded-lg flex items-center justify-center transition-colors border border-rose-100 h-9">
                                        <span class="material-symbols-outlined text-sm text-rose-600">upload</span>
                                        <input type="file" class="hidden" accept="image/*" onchange="app.handlePhotoUpload(this, 'sharedWorld', 'photos', ${index}, 'url', '${inputId}')">
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Caption</label>
                                <input type="text" class="array-item-input w-full" 
                                    data-field="caption"
                                    value="${photo.caption || ''}" placeholder="A short memory..."
                                    oninput="app.updateArrayItem('sharedWorld', 'photos', ${index}, 'caption', this.value)">
                            </div>
                            <div class="form-group" style="display: none;">
                                <input type="hidden" data-field="date" value="${photo.date || ''}">
                                <input type="hidden" data-field="note" value="${photo.note || ''}">
                            </div>
                        </div>
                    </div>
                    <button class="array-item-remove" onclick="app.removeArrayItem('sharedWorld', 'photos', ${index})">
                        <span class="material-symbols-outlined">delete_forever</span>
                    </button>
                </div>
            `;
        }).join('');
    },

    addMemory() {
        app.addArrayItem('sharedWorld', 'photos', { url: '', caption: '', date: new Date().toISOString().split('T')[0] });
    },
    renderFinishStep() {
        const config = state.getConfig();
        const recipientName = config.metadata?.customerName || '';

        return `
            <div class="step-header">
                <h2>Finish & Share</h2>
                <p>Review your work and export the final configuration.</p>
            </div>

            <!-- Recipient Name Card -->
            <div class="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
                <div class="flex items-start gap-4 mb-6">
                    <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined">person</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-900 text-lg mb-1">Who is this for?</h3>
                        <p class="text-sm text-gray-500">Enter the recipient's name to personalize the website URL</p>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Recipient Name</label>
                        <input type="text" id="finish-recipient-name" 
                            class="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="e.g., Septian"
                            value="${recipientName}"
                            oninput="state.updateField('metadata', 'customerName', this.value)">
                    </div>
                    
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                        <div class="text-amber-600 mt-0.5">
                            <span class="material-symbols-outlined text-xl">info</span>
                        </div>
                        <div>
                            <p class="text-sm text-gray-700 leading-relaxed">
                                <span class="font-semibold">This name will be used for:</span>
                            </p>
                            <ul class="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
                                <li>The website URL parameter (e.g., <span class="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-amber-200">?to=Name</span>)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-emerald-600 to-green-700 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                <div class="relative z-10 text-center">
                    <div class="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span class="material-symbols-outlined text-4xl">celebration</span>
                    </div>
                    <h3 class="text-2xl font-bold mb-2">You're All Set!</h3>
                    <p class="text-emerald-100 mb-8 max-w-sm mx-auto">Your personalized experience is ready. Preview your creation below before publishing.</p>
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <button onclick="app.showPreview()" class="w-full sm:w-auto bg-emerald-800/30 backdrop-blur-md text-white border border-white/20 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                            <span class="material-symbols-outlined">smartphone</span>
                            Mobile Preview
                        </button>
                    </div>
                    <button onclick="app.publishOnline()" class="w-full sm:w-auto bg-white text-emerald-700 px-12 py-5 rounded-2xl font-black text-xl hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3 mx-auto">
                        <span class="material-symbols-outlined text-2xl">rocket_launch</span>
                        Generate & Publish
                    </button>
                </div>
                <div class="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div class="absolute -top-12 -left-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
            </div>

            <!-- Publish Result (Hidden by default) -->
            <div id="publishResult" class="hidden animate-fade-in-up">
                <div class="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <span class="material-symbols-outlined">link</span>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-900">Your Site is Live!</h4>
                            <p class="text-sm text-gray-500">Copy the link below or scan the QR code to share.</p>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row gap-8 items-start">
                        <!-- Link & Actions -->
                        <div class="flex-1 w-full space-y-4">
                            <div class="relative">
                                <input type="text" id="shareableLink" readonly 
                                    class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-mono text-emerald-700 pr-32 focus:outline-none"
                                    value="Generating link...">
                                <button onclick="app.copyLink()" class="absolute right-2 top-2 bottom-2 bg-emerald-600 text-white px-4 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2">
                                    <span class="material-symbols-outlined text-sm">content_copy</span>
                                    Copy
                                </button>
                            </div>
                            <div class="flex gap-3">
                                <a id="viewLiveBtn" href="#" target="_blank" class="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-center text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-sm">open_in_new</span>
                                    Visit Site
                                </a>
                                <button onclick="app.downloadQR()" class="flex-1 border-2 border-slate-100 text-slate-600 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-sm">download</span>
                                    Save QR
                                </button>
                                <button onclick="app.downloadDataJS()" class="flex-1 border-2 border-slate-100 text-slate-600 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-sm">javascript</span>
                                    Download data.js
                                </button>
                            </div>
                        </div>

                        <!-- QR Code -->
                        <div class="w-full md:w-32 flex flex-col items-center gap-2">
                            <div id="qrcode" class="p-2 bg-white border-2 border-slate-100 rounded-2xl shadow-sm overflow-hidden shrink-0"></div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan Me</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
};
