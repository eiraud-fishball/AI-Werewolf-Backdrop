/* ========================================
   PlayerStore - 玩家数据存储
   从 ConfigStore 中拆分出的玩家 CRUD
   ======================================== */

const PlayerStore = {
    /** 获取玩家列表 */
    getAll() {
        return ConfigStore.getConfig().players || [];
    },

    /** 按 ID 查找玩家 */
    getById(playerId) {
        return this.getAll().find(p => p.id === playerId) || null;
    },

    /** 获取存活玩家 */
    getAlive() {
        return this.getAll().filter(p => p.status !== 'dead');
    },

    /** 获取已淘汰玩家 */
    getDead() {
        return this.getAll().filter(p => p.status === 'dead');
    },

    /** 获取存活数 */
    getAliveCount() {
        return ConfigStore.getAliveCount();
    },

    /** 获取淘汰数 */
    getDeadCount() {
        return ConfigStore.getDeadCount();
    },

    /** 获取下一个可用 ID */
    getNextId() {
        const players = this.getAll();
        return players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
    },

    /** 添加玩家 */
    add(data) {
        const players = this.getAll();
        const newPlayer = {
            id: this.getNextId(),
            name: data.name || `玩家${this.getNextId()}`,
            role: data.role || '平民',
            avatar: data.avatar || `https://picsum.photos/id/${this.getNextId() + 20}/100/100`,
            status: 'alive',
            votes: 0,
            sheriff: false,
            votedFor: null,
            notes: '',
            ...data
        };
        players.push(newPlayer);
        ConfigStore.updatePlayers(players);
        Logger.info('PlayerStore', `添加玩家: ${newPlayer.name} (ID=${newPlayer.id})`);
        return newPlayer;
    },

    /** 批量覆盖玩家列表 */
    setAll(players) {
        ConfigStore.updatePlayers(players);
    },

    /** 更新单个玩家的字段 */
    update(playerId, fields) {
        const players = this.getAll();
        const player = players.find(p => p.id === playerId);
        if (!player) {
            Logger.warn('PlayerStore', `玩家 ID=${playerId} 不存在`);
            return false;
        }
        Object.assign(player, fields);
        ConfigStore.updatePlayers(players);
        return true;
    },

    /** 切换生死 status */
    toggleStatus(playerId) {
        const player = this.getById(playerId);
        if (!player) return null;
        const newStatus = player.status === 'dead' ? 'alive' : 'dead';
        this.update(playerId, { status: newStatus });
        Logger.info('PlayerStore', `玩家 ${player.name} → ${newStatus === 'dead' ? '已淘汰' : '存活'}`);
        return newStatus;
    },

    /** 切换警长（唯一） */
    toggleSheriff(playerId) {
        const target = this.getById(playerId);
        if (!target) return false;

        if (target.sheriff) {
            this.update(playerId, { sheriff: false });
            Logger.info('PlayerStore', `取消 ${target.name} 的警徽`);
            return false;
        }

        // 取消所有玩家的警徽
        const players = this.getAll();
        players.forEach(p => { if (p.sheriff) p.sheriff = false; });
        target.sheriff = true;
        ConfigStore.updatePlayers(players);
        Logger.info('PlayerStore', `任命 ${target.name} 为警长`);
        return true;
    },

    /** 增加得票 */
    addVote(playerId) {
        const player = this.getById(playerId);
        if (!player) return;
        player.votes = (player.votes || 0) + 1;
        ConfigStore.updatePlayers(this.getAll());
    },

    /** 设置投票目标 */
    setVotedFor(voterId, targetId) {
        const voter = this.getById(voterId);
        if (!voter) return;
        voter.votedFor = targetId;
        ConfigStore.updatePlayers(this.getAll());
    },

    /** 清除投票目标 */
    clearVotedFor(voterId) {
        const voter = this.getById(voterId);
        if (!voter) return;
        voter.votedFor = null;
        ConfigStore.updatePlayers(this.getAll());
    },

    /** 删除玩家 */
    remove(index) {
        const players = this.getAll();
        if (index < 0 || index >= players.length) return;
        const removed = players.splice(index, 1)[0];
        ConfigStore.updatePlayers(players);
        Logger.info('PlayerStore', `删除玩家: ${removed.name}`);
    },

    /** 重置本局所有玩家状态 */
    resetCurrentGame() {
        const players = this.getAll();
        players.forEach(p => {
            p.status = 'alive';
            p.votes = 0;
            p.sheriff = false;
            p.votedFor = null;
        });
        ConfigStore.updatePlayers(players);
        Logger.info('PlayerStore', '本局玩家状态已重置');
    }
};
