/* ========================================
   SpeechService - 发言与投票服务
   发言板展示 / 投票记录 / 公告栏渲染
   ======================================== */

const SpeechService = {
    /** 投票记录 [{ from: playerId, to: playerId }] */
    votingRecords: [],

    // ========== 发言板 ==========

    showSpeechBoard(playerId) {
        const player = PlayerStore.getById(playerId);
        if (!player) return;

        const speechBoard = document.getElementById('speechBoard');
        const defaultInfo = document.getElementById('defaultGameInfo');
        const speechAvatar = document.getElementById('speechAvatar');
        const speechPlayerName = document.getElementById('speechPlayerName');
        const speechContent = document.getElementById('speechContent');

        if (!speechBoard || !defaultInfo) return;

        speechAvatar.src = player.avatar;
        speechAvatar.alt = player.name;

        const content = prompt(`请输入 ${player.name} 的发言内容：`);
        if (content === null) {
            speechBoard.classList.add('hidden');
            defaultInfo.classList.remove('hidden');
            return;
        }

        const text = content || '（沉默不语）';

        speechPlayerName.textContent = player.name;
        TextAutoScaler.apply(speechPlayerName, 1.5);

        speechContent.textContent = text;
        TextAutoScaler.apply(speechContent, 1.0);

        defaultInfo.classList.add('hidden');
        speechBoard.classList.remove('hidden');

        // 隐藏其他面板
        document.getElementById('votingBoard')?.classList.add('hidden');
        document.getElementById('eventAnnouncement')?.classList.add('hidden');

        // 记录日志和事件
        GameLogStore.add('speech', `💬 ${player.name} 发言: ${text.length > 40 ? text.slice(0, 40) + '...' : text}`);
        EventBus.emit('player:speech', { id: playerId, name: player.name, content: text });

        // 3分钟后自动隐藏发言板
        clearTimeout(this._speechHideTimer);
        this._speechHideTimer = setTimeout(() => this.hideSpeechBoard(), 180000);
    },

    hideSpeechBoard() {
        const speechBoard = document.getElementById('speechBoard');
        const defaultInfo = document.getElementById('defaultGameInfo');
        speechBoard?.classList.add('hidden');
        defaultInfo?.classList.remove('hidden');
    },

    // ========== 投票逻辑 ==========

    /**
     * 投票目标变更
     * @param {number} voterId - 投票方
     * @param {number} targetId - 被投票方（0 表示取消）
     */
    handleVoteTargetChange(voterId, targetId) {
        // 防御 NaN
        if (isNaN(targetId) || targetId === undefined || targetId === null) targetId = 0;

        const voter = PlayerStore.getById(voterId);
        if (!voter) return;

        if (!targetId) {
            // 取消投票
            this.votingRecords = this.votingRecords.filter(r => r.from !== voterId);
            PlayerStore.clearVotedFor(voterId);
        } else {
            // 移除旧的投票记录
            this.votingRecords = this.votingRecords.filter(r => r.from !== voterId);
            this.votingRecords.push({ from: voterId, to: targetId });
            PlayerStore.setVotedFor(voterId, targetId);

            // 发射投票事件
            EventBus.emit('vote:cast', { voterId, targetId });

            // 记录日志
            const target = PlayerStore.getById(targetId);
            if (target) {
                GameLogStore.add('vote', `🗳️ ${voter.name} → ${target.name}`);
            }
        }
        this.showVotingBoard();
    },

    /** 清除某玩家的投票记录（用于死亡时） */
    clearPlayerVotes(playerId) {
        this.votingRecords = this.votingRecords.filter(r => r.from !== playerId && r.to !== playerId);
        PlayerStore.clearVotedFor(playerId);
    },

    /** 同步 votingRecords 与 PlayerStore 数据（render 后调用） */
    _syncVotingRecords() {
        const players = PlayerStore.getAll();
        // 移除已被删除的玩家相关的投票记录
        const validIds = players.map(p => p.id);
        this.votingRecords = this.votingRecords.filter(r =>
            validIds.includes(r.from) && validIds.includes(r.to)
        );
    },

    // ========== 投票公告栏 ==========

    showVotingBoard() {
        const votingBoard = document.getElementById('votingBoard');
        const votingDetails = document.getElementById('votingDetails');
        const defaultInfo = document.getElementById('defaultGameInfo');

        if (!votingBoard || !votingDetails) return;

        if (this.votingRecords.length === 0) {
            votingBoard.classList.add('hidden');
            return;
        }

        // 按得票数分组
        const voteGroups = {};
        this.votingRecords.forEach(r => {
            if (!voteGroups[r.to]) voteGroups[r.to] = [];
            voteGroups[r.to].push(r.from);
        });

        const sorted = Object.entries(voteGroups).sort((a, b) => b[1].length - a[1].length);

        let html = '';
        sorted.forEach(([targetId, voters]) => {
            const target = PlayerStore.getById(parseInt(targetId));
            if (!target) return;

            const voterNames = voters.map((vid, idx) => {
                const v = PlayerStore.getById(vid);
                if (!v) return '';
                const color = PlayerRenderService.roleColors[v.role] || '#fff';
                return `${idx > 0 ? '、' : ''}<span style="color:${color}">${this._escapeHtml(v.name)}</span>`;
            }).filter(Boolean).join('');

            html += `<div class="vote-record">
                <span class="text-white font-medium">${voterNames}</span>
                <span class="vote-arrow">➜</span>
                <span class="text-yellow-400 font-bold">${this._escapeHtml(target.name)}</span>
                <span class="text-red-400 text-xs ml-1">[${voters.length}票]</span>
            </div>`;
        });

        votingDetails.innerHTML = html;

        defaultInfo?.classList.add('hidden');
        document.getElementById('speechBoard')?.classList.add('hidden');
        document.getElementById('eventAnnouncement')?.classList.add('hidden');
        votingBoard.classList.remove('hidden');
    },

    hideVotingBoard() {
        const votingBoard = document.getElementById('votingBoard');
        const defaultInfo = document.getElementById('defaultGameInfo');
        votingBoard?.classList.add('hidden');
        defaultInfo?.classList.remove('hidden');
    },

    /** 关闭投票面板并清空所有投票记录和票数 */
    clearVotes() {
        this.votingRecords = [];
        PlayerStore.getAll().forEach(p => {
            p.votes = 0;
            p.votedFor = 0;
        });
        ConfigStore.updatePlayers(PlayerStore.getAll());
        this.hideVotingBoard();
        PlayerRenderService.refresh();
        Logger.info('SpeechService', '投票已清空');
    },

    _escapeHtml(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }
};
