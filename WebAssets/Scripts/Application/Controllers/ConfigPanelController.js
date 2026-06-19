/* ========================================
   ConfigPanelController - 配置面板控制器
   设置弹窗 / 主题 / 特效 / 字体 / 玩家管理
   ======================================== */

const ConfigPanelController = {
    init() {
        this._bindEvents();
        Logger.info('ConfigPanelController', '初始化完成');
    },

    _bindEvents() {
        const settingsBtn = document.getElementById('settingsBtn');
        const configModal = document.getElementById('configModal');
        if (!settingsBtn || !configModal) return;

        const closeModalBtn = document.getElementById('closeModalBtn');
        const modalOverlay = document.getElementById('modalOverlay');
        const cancelConfigBtn = document.getElementById('cancelConfigBtn');
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        const saveGameConfigBtn = document.getElementById('saveGameConfigBtn');
        const configTabs = document.querySelectorAll('.config-tab');

        settingsBtn.addEventListener('click', () => this.open());
        closeModalBtn?.addEventListener('click', () => this.close());
        modalOverlay?.addEventListener('click', () => this.close());
        cancelConfigBtn?.addEventListener('click', () => this.close());
        saveConfigBtn?.addEventListener('click', () => this.save());
        saveGameConfigBtn?.addEventListener('click', () => this.save());

        configTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                configTabs.forEach(t => t.classList.remove('active', 'bg-white/20'));
                tab.classList.add('active', 'bg-white/20');
                document.querySelectorAll('.config-tab-content').forEach(c => c.classList.add('hidden'));
                const target = document.getElementById(`tab-${tab.dataset.tab}`);
                if (target) target.classList.remove('hidden');
            });
        });

        this._initStyleOptions();
        this._initEffectToggles();
        this._initFontSettings();
        this._initPlayerManagement();
        this._initImportExport();
    },

    open() {
        const config = ConfigStore.getConfig();
        const titleInput = document.getElementById('configTitle');
        const descInput = document.getElementById('configDescription');
        const bgInput = document.getElementById('configBackground');
        const roundInput = document.getElementById('configRound');

        if (titleInput) titleInput.value = config.gameInfo?.title || '';
        if (descInput) descInput.value = config.gameInfo?.description || '';
        if (bgInput) bgInput.value = config.background || '';
        if (roundInput) roundInput.value = config.currentRound || 1;

        this._syncStyleOptions(config.currentStyle || 'minimal');
        this._syncEffectToggles();
        this._syncFontSettings();
        this._renderPlayersList();

        const modal = document.getElementById('configModal');
        if (modal) modal.classList.remove('hidden');
    },

    close() {
        const modal = document.getElementById('configModal');
        if (modal) modal.classList.add('hidden');
    },

    save() {
        const titleInput = document.getElementById('configTitle');
        const descInput = document.getElementById('configDescription');
        const bgInput = document.getElementById('configBackground');
        const roundInput = document.getElementById('configRound');

        ConfigStore.updateConfig({
            gameInfo: {
                title: titleInput?.value || '',
                description: descInput?.value || ''
            },
            background: bgInput?.value || '',
            currentRound: parseInt(roundInput?.value) || 1
        });

        BackgroundService.set(bgInput?.value || '');
        PlayerRenderService.refresh();
        GameHost.updateStatsDisplay();
        this.close();
    },

    // ---- 主题样式 ----

    _initStyleOptions() {
        const styleOptions = document.querySelectorAll('.style-option');
        styleOptions.forEach(option => {
            option.onclick = () => {
                styleOptions.forEach(o => {
                    o.classList.remove('border-blue-500', 'bg-blue-500/20');
                    o.classList.add('border-white/20');
                });
                option.classList.add('border-blue-500', 'bg-blue-500/20');
                option.classList.remove('border-white/20');

                ThemeService.setStyle(option.dataset.style);
                ConfigStore.updateConfig({ currentStyle: option.dataset.style });
            };
        });
    },

    _syncStyleOptions(currentStyle) {
        const styleOptions = document.querySelectorAll('.style-option');
        styleOptions.forEach(option => {
            if (option.dataset.style === currentStyle) {
                option.classList.add('border-blue-500', 'bg-blue-500/20');
                option.classList.remove('border-white/20');
            } else {
                option.classList.remove('border-blue-500', 'bg-blue-500/20');
                option.classList.add('border-white/20');
            }
        });
    },

    // ---- 特效开关 ----

    _initEffectToggles() {
        const effectToggles = document.querySelectorAll('.effect-toggle');
        effectToggles.forEach(toggle => {
            toggle.onclick = () => {
                EffectsService.toggleEffect(toggle.dataset.effect);
                toggle.classList.toggle('active', EffectsService.isEffectEnabled(toggle.dataset.effect));
            };
        });
    },

    _syncEffectToggles() {
        document.querySelectorAll('.effect-toggle').forEach(toggle => {
            toggle.classList.toggle('active', EffectsService.isEffectEnabled(toggle.dataset.effect));
        });
    },

    // ---- 字体 ----

    _initFontSettings() {
        const fontPresetSelect = document.getElementById('fontPresetSelect');
        const customFontFamily = document.getElementById('customFontFamily');
        const customFontCdn = document.getElementById('customFontCdn');
        const applyCustomFontBtn = document.getElementById('applyCustomFontBtn');
        const currentFontName = document.getElementById('currentFontName');

        if (!fontPresetSelect) return;

        fontPresetSelect.innerHTML = '<option value="">-- 选择预设字体 --</option>';
        FontService.getPresetFonts().forEach((font, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = font.name;
            fontPresetSelect.appendChild(opt);
        });

        const currentFont = FontService.getCurrentFont();
        if (currentFontName) currentFontName.textContent = currentFont.name || currentFont.family;

        fontPresetSelect.onchange = () => {
            const idx = parseInt(fontPresetSelect.value);
            if (!isNaN(idx)) {
                const font = FontService.getPresetFonts()[idx];
                FontService.setFont(font);
                if (currentFontName) currentFontName.textContent = font.name;
            }
        };

        if (applyCustomFontBtn) {
            applyCustomFontBtn.onclick = () => {
                const family = customFontFamily?.value.trim();
                const cdn = customFontCdn?.value.trim();
                if (!family || !cdn) {
                    alert('请填写完整的字体名称和CDN链接');
                    return;
                }
                FontService.setCustomFont(family, cdn);
                if (currentFontName) currentFontName.textContent = `自定义: ${family}`;
                if (customFontFamily) customFontFamily.value = '';
                if (customFontCdn) customFontCdn.value = '';
            };
        }
    },

    _syncFontSettings() {
        const currentFontName = document.getElementById('currentFontName');
        const currentFont = FontService.getCurrentFont();
        if (currentFontName) currentFontName.textContent = currentFont.name || currentFont.family;
    },

    // ---- 玩家管理 ----

    _initPlayerManagement() {
        const addPlayerBtn = document.getElementById('addPlayerBtn');
        addPlayerBtn?.addEventListener('click', () => this._addPlayer());

        const saveAndRefreshBtn = document.getElementById('saveAndRefreshBtn');
        saveAndRefreshBtn?.addEventListener('click', () => {
            this._saveAllPlayerInputs();
            PlayerRenderService.refresh();
            GameHost.updateStatsDisplay();
        });
    },

    _saveAllPlayerInputs() {
        const playersList = document.getElementById('playersList');
        if (!playersList) return;
        const inputs = playersList.querySelectorAll('input[data-field][data-index]');
        const config = ConfigStore.getConfig();

        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            if (config.players[index]) {
                config.players[index][field] = input.value;
            }
        });
        ConfigStore.updatePlayers(config.players);
    },

    _renderPlayersList() {
        const playersList = document.getElementById('playersList');
        if (!playersList) return;
        const config = ConfigStore.getConfig();

        playersList.innerHTML = config.players.map((player, index) => `
            <div class="flex items-center gap-2 bg-slate-700/50 rounded-lg p-3">
                <span class="text-white/60 w-6">${player.id}.</span>
                <input type="text" value="${this._escapeAttr(player.name)}"
                       class="flex-1 bg-slate-600 text-white rounded px-2 py-1 text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
                       data-field="name" data-index="${index}">
                <input type="text" value="${this._escapeAttr(player.role)}"
                       class="w-24 bg-slate-600 text-white rounded px-2 py-1 text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
                       data-field="role" data-index="${index}">
                <input type="text" value="${this._escapeAttr(player.avatar)}"
                       class="w-40 bg-slate-600 text-white rounded px-2 py-1 text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
                       data-field="avatar" data-index="${index}" placeholder="头像URL">
                <button class="text-red-400 hover:text-red-300 px-2" onclick="ConfigPanelController._removePlayer(${index})">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `).join('');

        playersList.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                const config = ConfigStore.getConfig();
                config.players[index][field] = e.target.value;
                ConfigStore.updatePlayers(config.players);
            });
        });
    },

    _addPlayer() {
        PlayerStore.add({});
        this._renderPlayersList();
    },

    _removePlayer(index) {
        PlayerStore.remove(index);
        this._renderPlayersList();
    },

    // ---- 导入导出 ----

    _initImportExport() {
        const exportBtn = document.getElementById('exportConfigBtn');
        const importBtn = document.getElementById('importConfigBtn');
        const importInput = document.getElementById('importFileInput');
        const clearBtn = document.getElementById('clearStorageBtn');
        const resetBtn = document.getElementById('resetToDefaultBtn');

        exportBtn?.addEventListener('click', () => ConfigStore.exportConfig());
        importBtn?.addEventListener('click', () => importInput?.click());

        importInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await ConfigStore.importConfig(file);
                PlayerRenderService.refresh();
                GameHost.updateStatsDisplay();
                alert('配置导入成功！');
            } catch (error) {
                alert('配置导入失败：' + error.message);
            }
        });

        clearBtn?.addEventListener('click', () => {
            if (confirm('确定要清除所有本地存储吗？这将重置所有配置和统计数据。')) {
                ConfigStore.clearStorage();
                location.reload();
            }
        });

        resetBtn?.addEventListener('click', () => {
            if (confirm('确定要恢复预设配置吗？')) {
                ConfigStore.resetToDefault();
                PlayerRenderService.refresh();
                GameHost.updateStatsDisplay();
                this.close();
            }
        });
    },

    _escapeAttr(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};
