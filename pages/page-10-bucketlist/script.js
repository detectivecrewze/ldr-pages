// Bucket List - Shared Future Goals Script

const BucketListPage = {
    config: null,
    bucketList: {
        daily: [],
        adventure: [],
        food: []
    },

    init() {
        this.loadConfig();
        this.loadBucketList();
        this.renderChecklist();
        this.updateStats();
        this.setupEventListeners();
    },

    loadConfig() {
        if (window.parent && window.parent !== window && window.parent.CONFIG) {
            this.config = window.parent.CONFIG;
        } else if (window.CONFIG) {
            this.config = window.CONFIG;
        } else {
            this.config = {};
        }
    },

    loadBucketList() {
        const defaultList = {
            daily: [
                { text: "Grocery shopping together on weekends", done: false, priority: false },
                { text: "Build a blanket fort and watch movies", done: false, priority: true },
                { text: "Plant a small garden or keep houseplants", done: false, priority: false },
                { text: "Have our own coffee ritual every morning", done: false, priority: true },
                { text: "Adopt a pet together", done: false, priority: false },
                { text: "Dance in the living room to our favorite songs", done: false, priority: true }
            ],
            adventure: [
                { text: "Go to the beach and watch the sunrise together", done: false, priority: true },
                { text: "Hike to a waterfall and take a photo together", done: false, priority: false },
                { text: "Take a spontaneous road trip", done: false, priority: true },
                { text: "Visit a theme park and ride all the rides", done: false, priority: false },
                { text: "Go stargazing at a remote location", done: false, priority: true },
                { text: "Try bungee jumping or skydiving together", done: false, priority: false }
            ],
            food: [
                { text: "Eat at that famous Ramen place in Shibuya", done: false, priority: true },
                { text: "Try the best pizza in New York City", done: false, priority: false },
                { text: "Cook our first meal together in our new kitchen", done: false, priority: true },
                { text: "Have a midnight ice cream run", done: false, priority: false },
                { text: "Make homemade pasta from scratch", done: false, priority: false },
                { text: "Breakfast in bed on a lazy Sunday", done: false, priority: true }
            ]
        };

        this.bucketList = this.config?.bucketList || defaultList;
    },

    renderChecklist() {
        // Render Daily items
        this.renderCategory('dailyItems', this.bucketList.daily, 'daily');

        // Render Adventure items
        this.renderCategory('adventureItems', this.bucketList.adventure, 'adventure');

        // Render Food items
        this.renderCategory('foodItems', this.bucketList.food, 'food');
    },

    renderCategory(elementId, items, category) {
        const container = document.getElementById(elementId);
        if (!container) return;

        container.innerHTML = items.map((item, index) => `
            <label class="checklist-item ${item.done ? 'completed' : ''}" data-category="${category}" data-index="${index}">
                <input type="checkbox" class="checklist-checkbox" ${item.done ? 'checked' : ''}>
                <span class="checklist-text">
                    ${this.escapeHtml(item.text)}
                    ${item.priority ? '<span class="priority-star">★</span>' : ''}
                </span>
            </label>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.checklist-checkbox').forEach((checkbox, idx) => {
            checkbox.addEventListener('change', (e) => {
                this.toggleItem(category, idx, e.target.checked);
            });
        });
    },

    toggleItem(category, index, checked) {
        this.bucketList[category][index].done = checked;

        // Update visual state
        const itemEl = document.querySelector(`[data-category="${category}"][data-index="${index}"]`);
        if (itemEl) {
            itemEl.classList.toggle('completed', checked);
        }

        this.updateStats();
    },

    updateStats() {
        let total = 0;
        let completed = 0;

        Object.values(this.bucketList).forEach(category => {
            total += category.length;
            completed += category.filter(item => item.done).length;
        });

        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('totalItems').textContent = total;
        document.getElementById('completedItems').textContent = completed;
        document.getElementById('progressPercent').textContent = percent + '%';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    setupEventListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.parent.postMessage({ type: 'NAVIGATE', direction: 'close' }, '*');
        });

        // Finish button
        document.getElementById('finishButton').addEventListener('click', () => {
            window.parent.postMessage({
                type: 'APP_COMPLETE',
                appId: 'bucketlist',
                nextApp: 'quiz'
            }, '*');
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    BucketListPage.init();
});

// Listen for config updates
window.addEventListener('message', (e) => {
    if (e.data?.type === 'CONFIG_UPDATE') {
        window.CONFIG = e.data.config;
        BucketListPage.config = e.data.config;
        BucketListPage.loadBucketList();
        BucketListPage.renderChecklist();
        BucketListPage.updateStats();
    }
});
