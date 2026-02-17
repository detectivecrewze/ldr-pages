/**
 * LDR Studio - Shared World Editor Module
 * Handles the music playlist and date ideas.
 */
const SharedEditor = window.SharedEditor = {
    render() {
        return `
            <div class="step-header">
                <h2 class="text-2xl font-black text-slate-800">Our Shared World</h2>
                <p class="text-slate-500">Music, date ideas, and special memories you share.</p>
            </div>

            <div class="space-y-10 animate-fadeIn">
                <!-- Music Player -->
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                     <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-rose-500">music_note</span>
                        Our Playlist
                    </h3>
                    
                    <div class="array-items space-y-3" id="playlistList" oninput="state.saveArrayItems('playlist', 'sharedWorld')">
                        ${renderers.renderPlaylist()}
                    </div>

                    <button class="add-item-btn mt-6 w-full justify-center !py-4 !bg-slate-50 !text-slate-600 !border-slate-100 hover:!bg-slate-100 transition-all font-bold rounded-2xl flex items-center gap-2 group" 
                        onclick="renderers.addPlaylistItem()">
                        <span class="material-symbols-outlined group-hover:rotate-12 transition-transform">add_circle</span>
                        Add New Song
                    </button>
                </div>

                <!-- Date Ideas -->
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-amber-500">restaurant</span>
                        Date Night Ideas
                    </h3>
                    
                    <div class="array-items space-y-3" id="dateIdeasList" oninput="state.saveArrayItems('dateIdeas', 'sharedWorld')">
                        ${renderers.renderDateIdeas()}
                    </div>

                    <button class="add-item-btn mt-6 w-full justify-center !py-4 !border-dashed !border-slate-200 hover:!border-amber-300 hover:!text-amber-600 transition-all font-bold rounded-2xl flex items-center gap-2 group" 
                        onclick="renderers.addDateIdea()">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">celebration</span>
                        Add Date Idea
                    </button>
                </div>
            </div>
        `;
    }
};
