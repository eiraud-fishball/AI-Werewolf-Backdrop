/* ========================================
   StatsPanelController - 统计面板控制器
   游戏统计 / 玩家状态查看 / 重置游戏
   ======================================== */

const StatsPanelController = {
    init() {
        this._bindEvents();
        Logger.info('StatsPanelController', '初始化完成');
    },

    _bindEvents() {
        const statsBtn = document.getElementById('statsBtn');
        const statsModal = document.getElementById('statsModal');
        if (!statsBtn || !statsModal) return;

        const closeBtn = document.getElementById('closeStatsBtn');
        const overlay = document.getElementById('statsModalOverlay');
        const resetBtn = document.getElementById('resetGameBtn');

        statsBtn.addEventListener('click', () => this.open());
        closeBtn?.addEventListener('click', () => this.close());
        overlay?.addEventListener('click', () => this.close());
        resetBtn?.addEventListener('click', () => this._resetGame());
    },

    open() {
        const modal = document.getElementById('statsModal');
        if (!modal) return;
        modal.classList.remove('hidden');
        this._renderPlayerStats();
        this._renderGameLog();
    },

    close() {
        const modal = document.getElementById('statsModal');
        if (modal) modal.classList.add('hidden');
    },

    _resetGame() {
        if (confirm('确定要重置本局游戏吗？所有玩家状态和投票将被清除。')) {
            ConfigStore.resetCurrentGame();
            // 同步日夜控制器的天数
            DayNightController.phaseDay = 1;
            DayNightController.isNight = false;
            DayNightController.currentPhase = 'day';
            DayNightController._syncUI();
            DayNightController._applyVisuals();
            // 清除粒子
            if (DayNightController._particles) {
                DayNightController._particles.forEach(p => p.remove());
                DayNightController._particles = [];
            }
            PlayerRenderService.refresh();
            GameHost.updateStatsDisplay();
            SpeechService.votingRecords = [];
            EventBus.emit('game:reset');
            this._renderPlayerStats();
        }
    },

    _renderPlayerStats() {
        const container = document.getElementById('playerStatsList');
        if (!container) return;
        const config = ConfigStore.getConfig();

        container.innerHTML = config.players.map(player => `
            <div class="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                <div class="flex items-center gap-3">
                    <span class="text-white/60">${player.id}.</span>
                    <span class="text-white">${player.name}</span>
                    ${player.sheriff ? '<span class="text-yellow-400 text-xs">👑</span>' : ''}
                    <span class="text-sm px-2 py-0.5 rounded"
                          style="background: ${PlayerRenderService.roleColors[player.role] || '#6b7280'}30;
                                 color: ${PlayerRenderService.roleColors[player.role] || '#6b7280'}">
                        ${PlayerRenderService.roleIcons[player.role] || '👤'} ${player.role}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    ${player.votes > 0 ? `<span class="text-red-400 text-sm">${player.votes}票</span>` : ''}
                    ${player.votedFor ? `<span class="text-blue-400 text-xs">投→${PlayerStore.getById(player.votedFor)?.name || ''}</span>` : ''}
                    ${player.notes ? `<span class="text-cyan-400 text-xs" title="${this._escapeAttr(player.notes)}">📝</span>` : ''}
                    <span class="${player.status === 'dead' ? 'text-red-400' : 'text-green-400'} text-sm">
                        ${player.status === 'dead' ? '已淘汰' : '存活'}
                    </span>
                </div>
            </div>
        `).join('');
    },

    _renderGameLog() {
        // 日志渲染由 GameLogService 处理，面板中预留日志区域
        const logContainer = document.getElementById('gameLogList');
        if (logContainer) {
            GameLogStore.renderTo('gameLogList');
        }
    },

    _escapeAttr(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};
