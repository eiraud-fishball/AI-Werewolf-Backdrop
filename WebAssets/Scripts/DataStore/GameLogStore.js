/* ========================================
   GameLogStore - 游戏日志存储
   记录所有关键事件，支持持久化
   ======================================== */

const GameLogStore = {
    STORAGE_KEY: 'ai-werewolf-gamelog',
    MAX_ENTRIES: 200,

    /** @type {Array<{time:string, type:string, message:string}>} */
    entries: [],

    init() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.entries = JSON.parse(saved);
            }
        } catch (err) {
            Logger.warn('GameLogStore', '加载日志失败', err);
        }
        return this;
    },

    /** 添加一条日志 */
    add(type, message) {
        const entry = {
            time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            type: type,
            message: message
        };
        this.entries.push(entry);

        // 限制最大条数
        if (this.entries.length > this.MAX_ENTRIES) {
            this.entries = this.entries.slice(-this.MAX_ENTRIES);
        }

        this._persist();
        Logger.debug('GameLogStore', `[${type}] ${message}`);
        return entry;
    },

    /** 获取所有日志 */
    getAll() {
        return this.entries;
    },

    /** 按类型过滤 */
    getByType(type) {
        return this.entries.filter(e => e.type === type);
    },

    /** 获取最近的 N 条 */
    getRecent(count = 20) {
        return this.entries.slice(-count);
    },

    /** 清空日志 */
    clear() {
        this.entries = [];
        this._persist();
        localStorage.removeItem(this.STORAGE_KEY);
    },

    _persist() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries));
        } catch (err) {
            Logger.warn('GameLogStore', '持久化日志失败', err);
        }
    },

    /** 渲染日志到指定容器 */
    renderTo(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.entries.length === 0) {
            container.innerHTML = '<div class="text-white/40 text-sm py-4 text-center">暂无事件记录</div>';
            return;
        }

        container.innerHTML = this.entries.map(e => {
            const colorMap = {
                'phase': 'text-blue-400',
                'vote': 'text-yellow-400',
                'death': 'text-red-400',
                'revive': 'text-green-400',
                'sheriff': 'text-yellow-300',
                'speech': 'text-purple-400',
                'system': 'text-white/60',
                'note': 'text-cyan-400'
            };
            return `<div class="flex items-start gap-2 py-1 px-2 hover:bg-white/5 rounded text-sm">
                <span class="text-white/30 text-xs whitespace-nowrap mt-0.5">${e.time}</span>
                <span class="${colorMap[e.type] || 'text-white/70'}">${e.message}</span>
            </div>`;
        }).join('');

        // 自动滚动到底部
        container.scrollTop = container.scrollHeight;
    }
};
