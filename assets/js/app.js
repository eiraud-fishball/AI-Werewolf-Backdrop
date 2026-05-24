/* ========================================
   主应用 - 游戏核心逻辑
   ======================================== */

const GameApp = {
    isNight: false,
    currentPhase: 'day',
    phaseDay: 1,

    async init() {
        await FontManager.init();
        const background = await PlayerRenderer.init();
        this.setBackground(background);
        this.initDayNightToggle();
        this.initFullscreen();
        this.initConfigPanel();
        this.initStatsPanel();
        this.initParticles();
        this.initKeyboardShortcuts();
        this.updateStatsDisplay();
        ThemeSwitcher.init();
        EffectsManager.init();
    },

    setBackground(backgroundUrl) {
        const bgLayer = document.getElementById('bgLayer');
        if (bgLayer && backgroundUrl) {
            bgLayer.style.backgroundImage = `url('${backgroundUrl}')`;
        }
    },

    initDayNightToggle() {
        const toggleModeBtn = document.getElementById('toggleModeBtn');
        const modeIcon = document.getElementById('modeIcon');
        const modeText = document.getElementById('modeText');
        const overlayLayer = document.getElementById('overlayLayer');
        const bgLayer = document.getElementById('bgLayer');
        
        toggleModeBtn.addEventListener('click', () => {
            this.toggleDayNight();
        });
    },

    toggleDayNight() {
        const modeIcon = document.getElementById('modeIcon');
        const modeText = document.getElementById('modeText');
        const overlayLayer = document.getElementById('overlayLayer');
        const bgLayer = document.getElementById('bgLayer');
        const toggleModeBtn = document.getElementById('toggleModeBtn');
        const roleCards = document.querySelectorAll('.role-card');
        
        this.isNight = !this.isNight;
        
        const phaseInfo = ConfigManager.nextPhase();
        this.currentPhase = phaseInfo.phase;
        this.phaseDay = phaseInfo.day;
        this.updatePhaseDisplay();

        if (this.isNight) {
            overlayLayer.classList.remove('day-overlay');
            overlayLayer.classList.add('night-overlay');
            bgLayer.classList.add('brightness-75');
            modeIcon.classList.remove('fa-moon-o');
            modeIcon.classList.add('fa-sun-o');
            modeText.textContent = '夜晚阶段';
            toggleModeBtn.textContent = '切换白昼';
            toggleModeBtn.classList.remove('bg-wolf-accent');
            toggleModeBtn.classList.add('bg-blue-700');
            roleCards.forEach(card => {
                card.classList.remove('card-glow');
                card.classList.add('night-card-glow');
            });
            this.startNightParticles();
        } else {
            overlayLayer.classList.remove('night-overlay');
            overlayLayer.classList.add('day-overlay');
            bgLayer.classList.remove('brightness-75');
            modeIcon.classList.remove('fa-sun-o');
            modeIcon.classList.add('fa-moon-o');
            modeText.textContent = '白昼阶段';
            toggleModeBtn.textContent = '切换昼夜';
            toggleModeBtn.classList.remove('bg-blue-700');
            toggleModeBtn.classList.add('bg-wolf-accent');
            roleCards.forEach(card => {
                card.classList.remove('night-card-glow');
                card.classList.add('card-glow');
            });
            this.stopNightParticles();
        }
    },

    updatePhaseDisplay() {
        const phaseHistory = document.getElementById('phaseHistory');
        if (phaseHistory) {
            phaseHistory.textContent = `第 ${this.phaseDay} ${this.isNight ? '夜' : '天'}`;
        }
    },

    initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log(`无法进入全屏模式: ${err.message}`);
                });
                fullscreenBtn.classList.remove('fa-expand');
                fullscreenBtn.classList.add('fa-compress');
            } else {
                document.exitFullscreen();
                fullscreenBtn.classList.remove('fa-compress');
                fullscreenBtn.classList.add('fa-expand');
            }
        });

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.classList.remove('fa-compress');
                fullscreenBtn.classList.add('fa-expand');
            }
        });
    },

    initConfigPanel() {
        const settingsBtn = document.getElementById('settingsBtn');
        const configModal = document.getElementById('configModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const modalOverlay = document.getElementById('modalOverlay');
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        const cancelConfigBtn = document.getElementById('cancelConfigBtn');
        const configTabs = document.querySelectorAll('.config-tab');

        settingsBtn.addEventListener('click', () => this.openConfigModal());
        closeModalBtn.addEventListener('click', () => this.closeConfigModal());
        modalOverlay.addEventListener('click', () => this.closeConfigModal());
        cancelConfigBtn.addEventListener('click', () => this.closeConfigModal());
        saveConfigBtn.addEventListener('click', () => this.saveConfig());

        const saveGameConfigBtn = document.getElementById('saveGameConfigBtn');
        if (saveGameConfigBtn) {
            saveGameConfigBtn.addEventListener('click', () => this.saveConfig());
        }

        configTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                configTabs.forEach(t => t.classList.remove('active', 'bg-white/20'));
                tab.classList.add('active', 'bg-white/20');
                
                document.querySelectorAll('.config-tab-content').forEach(content => {
                    content.classList.add('hidden');
                });
                document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
            });
        });

        this.initImportExport();
        this.initPlayerManagement();
    },

    openConfigModal() {
        const configModal = document.getElementById('configModal');
        const config = ConfigManager.getConfig();
        
        document.getElementById('configTitle').value = config.gameInfo?.title || '';
        document.getElementById('configDescription').value = config.gameInfo?.description || '';
        document.getElementById('configBackground').value = config.background || '';
        document.getElementById('configRound').value = config.currentRound || 1;
        
        this.initStyleOptions(config.currentStyle || 'minimal');
        this.initEffectToggles();
        this.initFontSettings();
        this.renderPlayersList();
        configModal.classList.remove('hidden');
    },

    initStyleOptions(currentStyle) {
        const styleOptions = document.querySelectorAll('.style-option');
        styleOptions.forEach(option => {
            if (option.dataset.style === currentStyle) {
                option.classList.add('border-blue-500', 'bg-blue-500/20');
                option.classList.remove('border-white/20');
            } else {
                option.classList.remove('border-blue-500', 'bg-blue-500/20');
                option.classList.add('border-white/20');
            }
            
            option.onclick = () => {
                styleOptions.forEach(o => {
                    o.classList.remove('border-blue-500', 'bg-blue-500/20');
                    o.classList.add('border-white/20');
                });
                option.classList.add('border-blue-500', 'bg-blue-500/20');
                option.classList.remove('border-white/20');
                
                const style = option.dataset.style;
                ThemeSwitcher.setStyle(style);
                ConfigManager.updateConfig({ currentStyle: style });
            };
        });
    },

    initEffectToggles() {
        const effectToggles = document.querySelectorAll('.effect-toggle');
        effectToggles.forEach(toggle => {
            const effectName = toggle.dataset.effect;
            
            if (EffectsManager.isEffectEnabled(effectName)) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
            
            toggle.onclick = () => {
                EffectsManager.toggleEffect(effectName);
                
                if (EffectsManager.isEffectEnabled(effectName)) {
                    toggle.classList.add('active');
                } else {
                    toggle.classList.remove('active');
                }
            };
        });
    },

    initFontSettings() {
        const fontPresetSelect = document.getElementById('fontPresetSelect');
        const customFontFamily = document.getElementById('customFontFamily');
        const customFontCdn = document.getElementById('customFontCdn');
        const applyCustomFontBtn = document.getElementById('applyCustomFontBtn');
        const currentFontName = document.getElementById('currentFontName');

        fontPresetSelect.innerHTML = '<option value="">-- 选择预设字体 --</option>';
        FontManager.getPresetFonts().forEach((font, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = font.name;
            fontPresetSelect.appendChild(option);
        });

        const currentFont = FontManager.getCurrentFont();
        currentFontName.textContent = currentFont.name || currentFont.family;

        fontPresetSelect.onchange = () => {
            const selectedIndex = parseInt(fontPresetSelect.value);
            if (!isNaN(selectedIndex)) {
                const selectedFont = FontManager.getPresetFonts()[selectedIndex];
                FontManager.setFont(selectedFont);
                currentFontName.textContent = selectedFont.name;
            }
        };

        applyCustomFontBtn.onclick = () => {
            const family = customFontFamily.value.trim();
            const cdn = customFontCdn.value.trim();

            if (!family || !cdn) {
                alert('请填写完整的字体名称和CDN链接');
                return;
            }

            FontManager.setCustomFont(family, cdn);
            currentFontName.textContent = `自定义: ${family}`;
            customFontFamily.value = '';
            customFontCdn.value = '';
        };
    },

    closeConfigModal() {
        document.getElementById('configModal').classList.add('hidden');
    },

    saveConfig() {
        const newConfig = {
            gameInfo: {
                title: document.getElementById('configTitle').value,
                description: document.getElementById('configDescription').value
            },
            background: document.getElementById('configBackground').value,
            currentRound: parseInt(document.getElementById('configRound').value) || 1
        };

        ConfigManager.updateConfig(newConfig);
        this.setBackground(newConfig.background);
        PlayerRenderer.refresh();
        this.updateStatsDisplay();
        this.closeConfigModal();
    },

    initPlayerManagement() {
        const addPlayerBtn = document.getElementById('addPlayerBtn');
        addPlayerBtn.addEventListener('click', () => this.addPlayer());

        const saveAndRefreshBtn = document.getElementById('saveAndRefreshBtn');
        if (saveAndRefreshBtn) {
            saveAndRefreshBtn.addEventListener('click', () => {
                this.saveAllPlayerInputs();
                PlayerRenderer.refresh();
                this.updateStatsDisplay();
            });
        }
    },

    saveAllPlayerInputs() {
        const playersList = document.getElementById('playersList');
        const inputs = playersList.querySelectorAll('input[data-field][data-index]');
        const config = ConfigManager.getConfig();
        
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (config.players[index]) {
                config.players[index][field] = input.value;
            }
        });
        
        ConfigManager.updatePlayers(config.players);
    },

    renderPlayersList() {
        const playersList = document.getElementById('playersList');
        const config = ConfigManager.getConfig();
        
        playersList.innerHTML = config.players.map((player, index) => `
            <div class="flex items-center gap-2 bg-slate-700/50 rounded-lg p-3">
                <span class="text-white/60 w-6">${player.id}.</span>
                <input type="text" value="${player.name}" 
                       class="flex-1 bg-slate-600 text-white rounded px-2 py-1 text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
                       data-field="name" data-index="${index}">
                <input type="text" value="${player.role}" 
                       class="w-24 bg-slate-600 text-white rounded px-2 py-1 text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
                       data-field="role" data-index="${index}">
                <input type="text" value="${player.avatar}" 
                       class="w-40 bg-slate-600 text-white rounded px-2 py-1 text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
                       data-field="avatar" data-index="${index}" placeholder="头像URL">
                <button class="text-red-400 hover:text-red-300 px-2" onclick="GameApp.removePlayer(${index})">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `).join('');

        playersList.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                const config = ConfigManager.getConfig();
                config.players[index][field] = e.target.value;
                ConfigManager.updatePlayers(config.players);
            });
        });
    },

    addPlayer() {
        const config = ConfigManager.getConfig();
        const newId = config.players.length > 0 
            ? Math.max(...config.players.map(p => p.id)) + 1 
            : 1;
        
        config.players.push({
            id: newId,
            name: `玩家${newId}`,
            role: '平民',
            avatar: `https://picsum.photos/id/${newId + 20}/100/100`,
            status: 'alive',
            votes: 0
        });
        
        ConfigManager.updatePlayers(config.players);
        this.renderPlayersList();
    },

    removePlayer(index) {
        const config = ConfigManager.getConfig();
        config.players.splice(index, 1);
        ConfigManager.updatePlayers(config.players);
        this.renderPlayersList();
    },

    initImportExport() {
        const exportConfigBtn = document.getElementById('exportConfigBtn');
        const importConfigBtn = document.getElementById('importConfigBtn');
        const importFileInput = document.getElementById('importFileInput');
        const clearStorageBtn = document.getElementById('clearStorageBtn');
        const resetToDefaultBtn = document.getElementById('resetToDefaultBtn');

        exportConfigBtn.addEventListener('click', () => {
            ConfigManager.exportConfig();
        });

        importConfigBtn.addEventListener('click', () => {
            importFileInput.click();
        });

        importFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await ConfigManager.importConfig(file);
                    PlayerRenderer.refresh();
                    this.updateStatsDisplay();
                    alert('配置导入成功！');
                } catch (error) {
                    alert('配置导入失败：' + error.message);
                }
            }
        });

        clearStorageBtn.addEventListener('click', () => {
            if (confirm('确定要清除所有本地存储吗？这将重置所有配置和统计数据。')) {
                ConfigManager.clearStorage();
                location.reload();
            }
        });

        resetToDefaultBtn.addEventListener('click', () => {
            if (confirm('确定要恢复预设配置吗？当前的自定义配置将被清除。')) {
                ConfigManager.resetToDefault();
                PlayerRenderer.refresh();
                this.updateStatsDisplay();
                this.closeConfigModal();
            }
        });
    },

    initStatsPanel() {
        const statsBtn = document.getElementById('statsBtn');
        const statsModal = document.getElementById('statsModal');
        const closeStatsBtn = document.getElementById('closeStatsBtn');
        const statsModalOverlay = document.getElementById('statsModalOverlay');
        const resetGameBtn = document.getElementById('resetGameBtn');

        statsBtn.addEventListener('click', () => this.openStatsModal());
        closeStatsBtn.addEventListener('click', () => this.closeStatsModal());
        statsModalOverlay.addEventListener('click', () => this.closeStatsModal());

        resetGameBtn.addEventListener('click', () => {
            if (confirm('确定要重置本局游戏吗？所有玩家状态和投票将被清除。')) {
                ConfigManager.resetCurrentGame();
                PlayerRenderer.refresh();
                this.updateStatsDisplay();
                this.renderPlayerStatsList();
            }
        });
    },

    openStatsModal() {
        document.getElementById('statsModal').classList.remove('hidden');
        this.renderPlayerStatsList();
    },

    closeStatsModal() {
        document.getElementById('statsModal').classList.add('hidden');
    },

    renderPlayerStatsList() {
        const playerStatsList = document.getElementById('playerStatsList');
        const config = ConfigManager.getConfig();

        playerStatsList.innerHTML = config.players.map(player => `
            <div class="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                <div class="flex items-center gap-3">
                    <span class="text-white/60">${player.id}.</span>
                    <span class="text-white">${player.name}</span>
                    <span class="text-sm px-2 py-0.5 rounded" 
                          style="background: ${PlayerRenderer.roleColors[player.role] || '#6b7280'}30; 
                                 color: ${PlayerRenderer.roleColors[player.role] || '#6b7280'}">
                        ${PlayerRenderer.roleIcons[player.role] || '👤'} ${player.role}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    ${player.votes > 0 ? `<span class="text-red-400 text-sm">${player.votes}票</span>` : ''}
                    <span class="${player.status === 'dead' ? 'text-red-400' : 'text-green-400'} text-sm">
                        ${player.status === 'dead' ? '已淘汰' : '存活'}
                    </span>
                </div>
            </div>
        `).join('');
    },

    updateStatsDisplay() {
        document.getElementById('aliveCount').textContent = ConfigManager.getAliveCount();
        document.getElementById('deadCount').textContent = ConfigManager.getDeadCount();
    },

    initParticles() {
        this.particleContainer = document.getElementById('particleContainer');
        this.particles = [];
    },

    startNightParticles() {
        this.stopNightParticles();
        
        const createParticle = () => {
            if (!this.isNight) return;
            
            const particle = document.createElement('div');
            particle.className = 'night-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
                pointer-events: none;
            `;
            
            this.particleContainer.appendChild(particle);
            this.particles.push(particle);
            
            if (this.particles.length < 50) {
                setTimeout(createParticle, 100);
            }
        };
        
        createParticle();
    },

    stopNightParticles() {
        this.particles.forEach(p => p.remove());
        this.particles = [];
    },

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.toggleDayNight();
                    break;
                case 'f':
                case 'F':
                    document.getElementById('fullscreenBtn').click();
                    break;
                case 's':
                case 'S':
                    document.getElementById('settingsBtn').click();
                    break;
                case 'Escape':
                    this.closeConfigModal();
                    this.closeStatsModal();
                    break;
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GameApp.init();
});
