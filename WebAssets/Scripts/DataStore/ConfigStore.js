/* ========================================
   ConfigStore - 配置仓储
   本地存储读写 / 深层合并 / 导入导出
   ======================================== */

const ConfigStore = {
    STORAGE_KEY: 'ai-werewolf-config',
    STATS_KEY: 'ai-werewolf-stats',

    defaultConfig: null,
    currentConfig: null,
    stats: {
        goodWins: 0,
        wolfWins: 0,
        currentRound: 1,
        phaseHistory: []
    },

    async init() {
        await this.loadDefaultConfig();
        this.loadStats();
        this.loadFromStorage();
        Logger.info('ConfigStore', '配置初始化完成');
        return this.currentConfig;
    },

    async loadDefaultConfig() {
        try {
            const [gameConfigRes, playersRes] = await Promise.all([
                fetch('WebAssets/Data/GameConfig.json'),
                fetch('WebAssets/Data/Players.json')
            ]);

            const gameConfig = await gameConfigRes.json();
            const playersData = await playersRes.json();

            this.defaultConfig = {
                background: gameConfig.background || 'https://picsum.photos/id/1048/1920/1080',
                gameInfo: {
                    title: (gameConfig.gameInfo && gameConfig.gameInfo.title) || 'AI狼人杀 - 第1局',
                    description: (gameConfig.gameInfo && gameConfig.gameInfo.description) || '预女猎白12人经典版型'
                },
                font: {
                    family: (gameConfig.font && gameConfig.font.family) || 'Source Han Sans VF',
                    cdn: (gameConfig.font && gameConfig.font.cdn) || 'https://hanzi.itedev.com/fonts/Source+Han+Sans+VF/result.css'
                },
                players: playersData.players || [],
                currentRound: 1,
                currentPhase: 'day',
                phaseDay: 1
            };

            this.currentConfig = JSON.parse(JSON.stringify(this.defaultConfig));
        } catch (error) {
            Logger.error('ConfigStore', '加载默认配置失败', error);
            this.defaultConfig = this.getFallbackConfig();
            this.currentConfig = JSON.parse(JSON.stringify(this.defaultConfig));
        }
    },

    getFallbackConfig() {
        return {
            background: 'https://picsum.photos/id/1048/1920/1080',
            gameInfo: { title: 'AI狼人杀 - 第1局', description: '预女猎白12人经典版型' },
            font: { family: 'Noto Sans SC', cdn: 'https://hanzi.itedev.com/fonts/Noto+Sans+SC/result.css' },
            players: [],
            currentRound: 1,
            currentPhase: 'day',
            phaseDay: 1,
            currentStyle: 'minimal'
        };
    },

    /** 深层合并对象（避免浅覆盖丢失嵌套字段） */
    _deepMerge(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key]) {
                result[key] = { ...target[key], ...source[key] };
            } else {
                result[key] = source[key];
            }
        }
        return result;
    },

    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.currentConfig = this._deepMerge(this.defaultConfig, parsed);
                Logger.debug('ConfigStore', '已加载本地存储配置');
            }
        } catch (error) {
            Logger.warn('ConfigStore', '加载本地存储失败，使用默认配置', error);
            this.currentConfig = JSON.parse(JSON.stringify(this.defaultConfig));
        }
    },

    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentConfig));
        } catch (error) {
            Logger.warn('ConfigStore', '本地存储写入失败（可能超出配额）', error);
        }
    },

    loadStats() {
        try {
            const saved = localStorage.getItem(this.STATS_KEY);
            if (saved) this.stats = JSON.parse(saved);
        } catch (error) {
            Logger.warn('ConfigStore', '加载统计数据失败', error);
        }
    },

    saveStats() {
        try {
            localStorage.setItem(this.STATS_KEY, JSON.stringify(this.stats));
        } catch (error) {
            Logger.warn('ConfigStore', '保存统计数据失败', error);
        }
    },

    getConfig() { return this.currentConfig; },
    getStats() { return this.stats; },

    updateConfig(newConfig) {
        this.currentConfig = { ...this.currentConfig, ...newConfig };
        this.saveToStorage();
    },

    updatePlayers(players) {
        this.currentConfig.players = players;
        this.saveToStorage();
    },

    updateFont(fontConfig) {
        this.currentConfig.font = fontConfig;
        this.saveToStorage();
    },

    getFont() {
        return this.currentConfig.font || { family: 'Noto Sans SC', cdn: '' };
    },

    resetToDefault() {
        this.currentConfig = JSON.parse(JSON.stringify(this.defaultConfig));
        localStorage.removeItem(this.STORAGE_KEY);
        Logger.info('ConfigStore', '已恢复默认配置');
        return this.currentConfig;
    },

    clearStorage() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.STATS_KEY);
        this.stats = { goodWins: 0, wolfWins: 0, currentRound: 1, phaseHistory: [] };
        Logger.info('ConfigStore', '已清除所有本地存储');
    },

    exportConfig() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            config: this.currentConfig,
            stats: this.stats
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-werewolf-config-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Logger.info('ConfigStore', '配置已导出');
    },

    async importConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (imported.config) {
                        this.currentConfig = this._deepMerge(this.defaultConfig, imported.config);
                        this.saveToStorage();
                    }
                    if (imported.stats) {
                        this.stats = { ...this.stats, ...imported.stats };
                        this.saveStats();
                    }
                    Logger.info('ConfigStore', '配置导入成功');
                    resolve(this.currentConfig);
                } catch (error) {
                    reject(new Error('无效的配置文件格式'));
                }
            };
            reader.onerror = () => reject(new Error('读取文件失败'));
            reader.readAsText(file);
        });
    },

    recordWin(faction) {
        if (faction === 'good') this.stats.goodWins++;
        else if (faction === 'wolf') this.stats.wolfWins++;
        this.saveStats();
    },

    resetCurrentGame() {
        PlayerStore.resetCurrentGame();
        this.currentConfig.phaseDay = 1;
        this.currentConfig.currentPhase = 'day';
        this.saveToStorage();
    },

    nextPhase() {
        const current = this.currentConfig.currentPhase;
        if (current === 'day') {
            this.currentConfig.currentPhase = 'night';
        } else {
            this.currentConfig.currentPhase = 'day';
            this.currentConfig.phaseDay++;
        }
        this.saveToStorage();
        return { phase: this.currentConfig.currentPhase, day: this.currentConfig.phaseDay };
    },

    getAliveCount() { return PlayerStore.getAliveCount(); },
    getDeadCount() { return PlayerStore.getDeadCount(); }
};
