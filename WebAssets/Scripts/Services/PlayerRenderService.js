/* ========================================
   PlayerRenderService - 玩家渲染服务
   玩家卡片渲染 / 状态管理 / 警长 / 得票
   ======================================== */

const PlayerRenderService = {
    players: [],
    background: '',
    gameInfo: {
        title: '狼人杀对局现场',
        description: 'AI智能阵营博弈 · 昼夜交替发言'
    },
    leftContainer: null,
    rightContainer: null,

    roleIcons: {
        '预言家': '🔮', '女巫': '🧪', '猎人': '🏹', '守卫': '🛡️',
        '骑士': '⚔️', '愚者': '🎭', '狼人': '🐺', '狼王': '👑',
        '平民': '👤', '白痴': '🤪', '守墓人': '⚰️', '摄梦人': '💤',
        '石像鬼': '🗿', '机械狼': '🤖', '魔术师': '🎩', '猎魔人': '🧙',
        '狂人': '👤', '炼金魔女': '🧪', '通灵师': '🔮',
    },

    roleColors: {
        '预言家': '#8b5cf6', '女巫': '#a855f7', '猎人': '#f59e0b',
        '守卫': '#3b82f6', '骑士': '#6366f1', '愚者': '#ec4899',
        '狼人': '#ef4444', '狼王': '#dc2626', '平民': '#38bdf8',
        '白痴': '#f472b6', '守墓人': '#4b5563', '摄梦人': '#7c3aed',
        '石像鬼': '#64748b', '机械狼': '#0ea5e9', '魔术师': '#d946ef',
        '猎魔人': '#84cc16', '狂人': '#38bdf8', '炼金魔女': '#e28f11ff',
        '通灵师': '#582df3ff',
    },

    async init() {
        this.leftContainer = document.getElementById('leftPlayersContainer');
        this.rightContainer = document.getElementById('rightPlayersContainer');

        if (!this.leftContainer || !this.rightContainer) {
            console.error('玩家容器元素未找到');
            return;
        }

        const config = await ConfigStore.init();
        this.loadFromConfig(config);
        this.render();
        this.renderGameInfo();
        return this.background;
    },

    loadFromConfig(config) {
        if (!config) return;
        this.background = config.background || 'https://picsum.photos/id/1048/1920/1080';
        this.gameInfo = config.gameInfo || this.gameInfo;
        this.players = config.players.map(p => ({
            ...p,
            status: p.status || 'alive',
            votes: p.votes || 0,
            sheriff: p.sheriff || false,
            votedFor: p.votedFor || null,
            notes: p.notes || ''
        }));
    },

    render() {
        const leftPlayers = this.players.filter(p => p.id <= 6);
        const rightPlayers = this.players.filter(p => p.id >= 7);

        this.leftContainer.innerHTML = leftPlayers.map((p, index) => this.createPlayerCard(p, index)).join('');
        this.rightContainer.innerHTML = rightPlayers.map((p, index) => this.createPlayerCard(p, index + 6)).join('');

        // 重新渲染后同步 SpeechService 中的 votingRecords
        SpeechService._syncVotingRecords();
    },

    createPlayerCard(player, index) {
        const icon = this.roleIcons[player.role] || '❓';
        const color = this.roleColors[player.role] || '#94a3b8';
        const displayRole = player.role || '未知';
        const isDead = player.status === 'dead';
        const isSheriff = player.sheriff;
        const statusClass = isDead ? 'opacity-50 grayscale' : '';
        const isRightSide = player.id >= 7;
        const sidePosClass = isRightSide ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2';

        // 警长 SVG 星星徽章
        const sheriffBadge = isSheriff ? `
            <div class="sheriff-badge" onclick="event.stopPropagation(); PlayerRenderService.toggleSheriff(${player.id})" title="取消警徽">
                <svg width="77" height="77" viewBox="0 0 32 32">
                    <defs>
                        <linearGradient id="starGrad${player.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <polygon points="16,2 20,11 30,12 22,19 24,29 16,24 8,29 10,19 2,12 12,11"
                             fill="url(#starGrad${player.id})" stroke="#B8860B" stroke-width="1.5"/>
                    <text x="16" y="21" text-anchor="middle" font-size="10" font-weight="bold" fill="#8B4513" font-family="Arial">警</text>
                </svg>
            </div>
        ` : '';

        // 死亡覆盖层
        const deadOverlay = isDead ? `
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                <span class="dead-mark">❌</span>
            </div>
        ` : '';

        // 投票目标下拉
        const voteTargetOptions = this.players
            .filter(p => p.id !== player.id && p.status !== 'dead')
            .map(p => `<option value="${p.id}" ${player.votedFor === p.id ? 'selected' : ''}>${this._escapeHtml(p.name)}</option>`)
            .join('');

        return `
            <div class="role-card group relative player-card rounded-xl overflow-visible transition-all duration-300 card-glow ${statusClass} player-card-animate"
                 style="animation-delay: ${index * 0.1}s"
                 data-player-id="${player.id}">
                ${sheriffBadge}
                ${deadOverlay}
                <div class="flex items-center p-3 gap-3">
                    <div class="avatar-container w-16 h-16 overflow-hidden flex-shrink-0 flex items-center justify-center rounded-lg">
                        <img src="${this._escapeAttr(player.avatar)}" alt="${this._escapeAttr(player.name)}" class="w-full h-full object-cover ${isDead ? 'grayscale' : ''}">
                    </div>
                    <div class="flex-1 min-w-0 flex flex-col gap-2">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="player-name text-xl text-white font-bold truncate" title="${this._escapeAttr(player.name)}">
                                ${this._escapeHtml(player.name)}
                            </span>
                            ${player.votes > 0 ? `<span class="vote-badge bg-red-500 text-white text-sm px-2 py-0.5 rounded-full font-bold">${player.votes}票</span>` : ''}
                            ${isDead ? '<span class="dead-badge text-red-400 text-sm font-bold">已淘汰</span>' : ''}
                            ${player.notes ? `<span class="text-cyan-400 text-sm cursor-help" title="备注: ${this._escapeAttr(player.notes)}">📝</span>` : ''}
                        </div>
                        <div class="role-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-bold self-start"
                             style="background: ${color}; box-shadow: 0 2px 10px ${color}70;">
                            <span class="role-icon">${icon}</span>
                            <span class="role-text">${displayRole}</span>
                        </div>
                    </div>
                </div>
                <!-- 浮动工具组 - 悬停显示：2×2田字格 + 投票选择器(存活时) -->
                <div class="absolute top-1/2 -translate-y-1/2 ${sidePosClass} hidden group-hover:block z-30 w-[7.5rem]">
                    <div class="grid grid-cols-2 gap-1.5 w-fit mx-auto">
                        <button class="w-7 h-7 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs flex items-center justify-center transition-all shadow-lg"
                                onclick="SpeechService.showSpeechBoard(${player.id})" title="发言">
                            <i class="fa fa-microphone"></i>
                        </button>
                        <button class="w-7 h-7 rounded-lg ${isDead ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white text-xs flex items-center justify-center transition-all shadow-lg"
                                onclick="PlayerRenderService.toggleStatus(${player.id})" title="${isDead ? '复活' : '淘汰'}">
                            <i class="fa ${isDead ? 'fa-heart' : 'fa-times'}"></i>
                        </button>
                        <button class="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center justify-center transition-all shadow-lg"
                                onclick="PlayerRenderService.toggleSheriff(${player.id})" title="${isSheriff ? '取消警徽' : '任命警长'}">
                            <i class="fa fa-star"></i>
                        </button>
                        <button class="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs flex items-center justify-center transition-all shadow-lg"
                                onclick="PlayerRenderService.editNotes(${player.id})" title="备注">
                            <i class="fa fa-pencil"></i>
                        </button>
                    </div>
                    ${!isDead ? `
                    <div class="flex items-center gap-1 px-1 mt-1.5 bg-slate-800/60 rounded-lg py-0.5">
                        <span class="text-white/50 text-[9px] whitespace-nowrap">投票:</span>
                        <select class="vote-target-select bg-slate-700/80 text-white text-[9px] rounded px-1 py-0.5 border border-white/10 focus:outline-none flex-1 min-w-0"
                                data-voter-id="${player.id}"
                                onchange="SpeechService.handleVoteTargetChange(${player.id}, parseInt(this.value) || 0)">
                            <option value="">-- 选择 --</option>
                            ${voteTargetOptions}
                        </select>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /** 得票计数 +1 */
    addVote(playerId) {
        PlayerStore.addVote(playerId);
        this.refresh();
    },

    /** 切换生死状态 */
    toggleStatus(playerId) {
        const player = PlayerStore.getById(playerId);
        if (!player) return;

        const previous = player.status;
        const newStatus = PlayerStore.toggleStatus(playerId);

        if (newStatus && newStatus !== previous) {
            if (newStatus === 'dead') {
                SpeechService.clearPlayerVotes(playerId);
                EventBus.emit('player:death', { id: playerId, name: player.name });
            } else {
                EventBus.emit('player:revive', { id: playerId, name: player.name });
            }
        }

        this.refresh();
        GameHost.updateStatsDisplay();
    },

    /** 切换警长（唯一） */
    toggleSheriff(playerId) {
        const player = PlayerStore.getById(playerId);
        if (!player) return;

        const wasSheriff = player.sheriff;
        const isNowSheriff = PlayerStore.toggleSheriff(playerId);

        if (wasSheriff && !isNowSheriff) {
            EventBus.emit('player:sheriff:removed', { id: playerId, name: player.name });
        } else if (!wasSheriff && isNowSheriff) {
            EventBus.emit('player:sheriff', { id: playerId, name: player.name });
        }

        this.refresh();
    },

    /** 编辑玩家备注 */
    editNotes(playerId) {
        const player = PlayerStore.getById(playerId);
        if (!player) return;
        const notes = prompt(`编辑 ${player.name} 的备注：`, player.notes || '');
        if (notes === null) return;
        PlayerStore.update(playerId, { notes: notes });
        this.refresh();
        if (notes) {
            GameLogStore.add('note', `📝 ${player.name} 备注: ${notes.length > 40 ? notes.slice(0, 40) + '...' : notes}`);
        }
    },

    renderGameInfo() {
        const titleElement = document.getElementById('gameInfoTitle');
        const descriptionElement = document.getElementById('gameInfoDescription');

        if (titleElement && this.gameInfo.title) {
            titleElement.textContent = this.gameInfo.title;
            TextAutoScaler.apply(titleElement, 1.2);
        }
        if (descriptionElement && this.gameInfo.description) {
            descriptionElement.textContent = this.gameInfo.description;
            TextAutoScaler.apply(descriptionElement, 0.8);
        }
    },

    refresh() {
        const config = ConfigStore.getConfig();
        this.loadFromConfig(config);
        this.render();
        this.renderGameInfo();
        GameHost.updateStatsDisplay();
    },

    resetVotes() {
        this.players.forEach(p => {
            p.votes = 0;
            p.votedFor = null;
        });
        ConfigStore.updatePlayers(this.players);
        SpeechService.votingRecords = [];
        this.render();
        GameLogStore.add('system', '🗳️ 投票已重置');
    },

    _escapeHtml(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    _escapeAttr(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};
