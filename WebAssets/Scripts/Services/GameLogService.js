/* ========================================
   GameLogService - 游戏事件日志服务
   记录 / 展示所有关键游戏事件
   ======================================== */

const GameLogService = {
    _initialized: false,

    init() {
        if (this._initialized) return;
        GameLogStore.init();
        this._initialized = true;

        // 监听各类事件
        EventBus.on('phase:change', payload => {
            GameLogStore.add('phase', `☀️🌙 进入${payload.isNight ? '🌙夜晚' : '☀️白昼'}阶段（第 ${payload.day} ${payload.isNight ? '夜' : '天'}）`);
        });

        EventBus.on('player:death', payload => {
            GameLogStore.add('death', `💀 ${payload.name} 已被淘汰`);
        });

        EventBus.on('player:revive', payload => {
            GameLogStore.add('revive', `❤️ ${payload.name} 已复活`);
        });

        EventBus.on('player:sheriff', payload => {
            GameLogStore.add('sheriff', `👑 ${payload.name} 当选警长`);
        });

        EventBus.on('player:sheriff:removed', payload => {
            GameLogStore.add('sheriff', `❌ ${payload.name} 的警徽被收回`);
        });

        EventBus.on('player:speech', payload => {
            GameLogStore.add('speech', `💬 ${payload.name} 发言：${payload.content.length > 30 ? payload.content.slice(0, 30) + '...' : payload.content}`);
        });

        EventBus.on('vote:cast', payload => {
            const voter = PlayerStore.getById(payload.voterId);
            const target = PlayerStore.getById(payload.targetId);
            if (voter && target) {
                GameLogStore.add('vote', `🗳️ ${voter.name} → ${target.name}`);
            }
        });

        EventBus.on('game:reset', () => {
            GameLogStore.add('system', '🔄 游戏已重置');
        });

        Logger.info('GameLogService', '初始化完成');
    },

    /** 渲染日志面板到指定容器 */
    render(containerId) {
        GameLogStore.renderTo(containerId);
    },

    /** 刷新日志显示 */
    refresh(containerId) {
        this.render(containerId);
    },

    /** 获取所有日志 */
    getAll() {
        return GameLogStore.getAll();
    },

    /** 清空日志 */
    clear() {
        GameLogStore.clear();
    }
};
