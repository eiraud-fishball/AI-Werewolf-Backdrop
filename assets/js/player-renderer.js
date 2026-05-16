/* ========================================
   玩家渲染器 - 动态渲染玩家卡片
   ======================================== */

const PlayerRenderer = {
    players: [],
    background: '',
    gameInfo: {
        title: '狼人杀对局现场',
        description: 'AI智能阵营博弈 · 昼夜交替发言'
    },
    leftContainer: null,
    rightContainer: null,

    async init() {
        this.leftContainer = document.getElementById('leftPlayersContainer');
        this.rightContainer = document.getElementById('rightPlayersContainer');
        
        if (!this.leftContainer || !this.rightContainer) {
            console.error('玩家容器元素未找到');
            return;
        }

        await Promise.all([
            this.loadGameConfig(),
            this.loadPlayers()
        ]);
        
        this.render();
        this.renderGameInfo();
        return this.background;
    },

    async loadGameConfig() {
        try {
            const response = await fetch('assets/data/game-config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.background = data.background || 'https://picsum.photos/id/1048/1920/1080';
            this.gameInfo = data.gameInfo || this.gameInfo;
        } catch (error) {
            console.error('加载游戏配置失败:', error);
            this.background = 'https://picsum.photos/id/1048/1920/1080';
        }
    },

    async loadPlayers() {
        try {
            const response = await fetch('assets/data/players.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.players = data.players;
        } catch (error) {
            console.error('加载玩家配置失败:', error);
            this.players = [];
        }
    },

    render() {
        const leftPlayers = this.players.filter(p => p.id <= 6);
        const rightPlayers = this.players.filter(p => p.id >= 7);

        this.leftContainer.innerHTML = leftPlayers.map(p => this.createPlayerCard(p)).join('');
        this.rightContainer.innerHTML = rightPlayers.map(p => this.createPlayerCard(p)).join('');
    },

    createPlayerCard(player) {
        return `
            <div class="role-card group relative player-card rounded-xl overflow-hidden transition-all duration-300 card-glow">
                <div class="flex items-center p-3 gap-3">
                    <div class="avatar-container w-14 h-14 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img src="${player.avatar}" alt="${player.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1">
                        <div class="text-white text-base font-bold">${player.id}. ${player.name}</div>
                        <div class="text-gray-300 text-sm mt-1">${player.role}</div>
                    </div>
                </div>
            </div>
        `;
    },

    renderGameInfo() {
        const titleElement = document.getElementById('gameInfoTitle');
        const descriptionElement = document.getElementById('gameInfoDescription');
        
        if (titleElement && this.gameInfo.title) {
            titleElement.textContent = this.gameInfo.title;
        }
        
        if (descriptionElement && this.gameInfo.description) {
            descriptionElement.textContent = this.gameInfo.description;
        }
    }
};
