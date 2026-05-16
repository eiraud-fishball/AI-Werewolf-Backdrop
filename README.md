# AI狼人杀对局背景板

一个现代化的AI狼人杀游戏对局展示界面，支持多种主题风格、昼夜切换、动态配置等功能。

## 📖 项目简介

本项目是一个基于Web的AI狼人杀对局背景板，用于展示AI玩家信息、游戏状态和规则说明。采用现代化的前端技术栈，支持多种视觉主题，配置灵活，易于定制。

### 主要功能

- 🎮 **玩家展示**：动态展示12位AI玩家信息（名称、头像、角色）
- 🌓 **昼夜切换**：支持白昼/夜晚模式切换，视觉效果丰富
- 🎨 **多主题支持**：提供4种精心设计的主题风格
  - 简约现代
  - 游戏卡牌
  - 科技未来
  - 中国古典
- ⚙️ **动态配置**：所有数据通过JSON配置文件管理，无需修改代码
- 🖼️ **自定义背景**：支持自定义背景图片
- 📱 **响应式设计**：适配不同屏幕尺寸
- 🔲 **全屏模式**：支持全屏展示

## 📁 项目结构

```
d:\AI\背景板\
├── index.html                          # 主页面
├── README.md                           # 项目说明文档
└── assets/                             # 资源文件夹
    ├── css/                           # 样式文件夹
    │   ├── base.css                   # 基础样式（重置、字体、通用样式）
    │   ├── themes.css                 # 主题样式（四种风格定义）
    │   └── components.css             # 组件样式（按钮、卡片等）
    ├── js/                            # 脚本文件夹
    │   ├── app.js                     # 主应用逻辑（昼夜切换、全屏等）
    │   ├── player-renderer.js         # 玩家渲染器（动态渲染玩家卡片）
    │   └── theme-switcher.js          # 主题切换器（风格切换逻辑）
    └── data/                          # 数据文件夹
        ├── game-config.json           # 游戏配置（背景、游戏信息）
        └── players.json               # 玩家配置（玩家列表）
```

## 🚀 快速开始

### 1. 克隆或下载项目

```bash
# 克隆项目
git clone [项目地址]

# 或直接下载项目文件
```

### 2. 启动本地服务器

由于项目使用Fetch API加载JSON配置文件，需要通过HTTP服务器运行。

#### 方式一：使用Python（推荐）

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 方式二：使用Node.js

```bash
# 安装http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

#### 方式三：使用VS Code Live Server插件

在VS Code中安装Live Server插件，右键点击`index.html`选择"Open with Live Server"。

### 3. 访问应用

打开浏览器访问：`http://localhost:8000`

## ⚙️ 配置说明

### 游戏配置 (`assets/data/game-config.json`)

控制游戏的全局设置：

```json
{
  "background": "https://picsum.photos/id/1048/1920/1080",
  "gameInfo": {
    "title": "狼人杀对局现场",
    "description": "AI智能阵营博弈 · 昼夜交替发言"
  }
}
```

#### 配置项说明

- **background**: 背景图片URL
  - 支持网络图片URL
  - 支持本地图片路径（相对于项目根目录）
  
- **gameInfo**: 游戏规则说明
  - **title**: 标题文字
  - **description**: 描述文字

### 玩家配置 (`assets/data/players.json`)

控制玩家信息：

```json
{
  "players": [
    {
      "id": 1,
      "name": "DeepSeek",
      "avatar": "https://picsum.photos/id/1/100/100",
      "role": "平民"
    }
  ]
}
```

#### 配置项说明

- **id**: 玩家编号（1-12）
  - 1-6号玩家显示在左侧
  - 7-12号玩家显示在右侧
  
- **name**: 玩家名称

- **avatar**: 玩家头像URL
  - 支持网络图片URL
  - 支持本地图片路径
  
- **role**: 玩家角色
  - 狼王、狼人、平民、预言家、女巫、猎人、骑士、守卫等

## 🎨 自定义指南

### 更换背景图片

编辑 `assets/data/game-config.json`：

```json
{
  "background": "你的图片URL或路径"
}
```

### 修改玩家信息

编辑 `assets/data/players.json`，修改对应玩家的信息：

```json
{
  "id": 1,
  "name": "新玩家名称",
  "avatar": "新头像URL",
  "role": "新角色"
}
```

### 添加或删除玩家

在 `players` 数组中添加或删除玩家对象，注意保持 `id` 的唯一性和顺序性。

### 自定义主题颜色

编辑 `assets/css/themes.css`，修改对应主题的CSS变量和样式。

## 🛠️ 技术栈

- **HTML5**: 语义化标签
- **CSS3**: 
  - Flexbox布局
  - CSS变量
  - 动画效果
  - 文字描边
- **JavaScript (ES6+)**:
  - Fetch API
  - Async/Await
  - 模块化设计
- **Tailwind CSS**: 快速样式开发
- **Font Awesome**: 图标库

## 📋 功能详解

### 昼夜切换

点击"切换昼夜"按钮可以在白昼和夜晚模式间切换：
- **白昼模式**: 明亮的背景，蓝色调
- **夜晚模式**: 暗色背景，橙色调，降低背景亮度

### 主题切换

顶部工具栏提供4种主题风格：
- **简约现代**: 简洁大方，适合正式场合
- **游戏卡牌**: 卡牌风格，游戏感强
- **科技未来**: 科技感十足，适合现代风格
- **中国古典**: 古典韵味，适合传统文化主题

### 全屏模式

点击全屏按钮可以进入/退出全屏模式，适合展示和演示。

## 🔧 开发指南

### 修改样式

- **基础样式**: 编辑 `assets/css/base.css`
- **主题样式**: 编辑 `assets/css/themes.css`
- **组件样式**: 编辑 `assets/css/components.css`

### 修改逻辑

- **主应用逻辑**: 编辑 `assets/js/app.js`
- **玩家渲染**: 编辑 `assets/js/player-renderer.js`
- **主题切换**: 编辑 `assets/js/theme-switcher.js`

### 添加新功能

1. 在对应的JS文件中添加新方法
2. 在HTML中添加相应的UI元素
3. 在CSS中添加样式（如需要）
4. 更新配置文件（如需要）

## 📝 注意事项

1. **本地运行**: 必须通过HTTP服务器运行，不能直接双击HTML文件打开
2. **跨域问题**: 如果使用本地图片，确保服务器配置允许访问
3. **配置文件**: 修改JSON配置文件后刷新页面即可生效
4. **浏览器兼容**: 建议使用现代浏览器（Chrome、Firefox、Edge、Safari）

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Font Awesome](https://fontawesome.com/) - 图标库
- [Picsum Photos](https://picsum.photos/) - 随机图片服务

---

**开发者**: AI狼人杀项目组  
**最后更新**: 2026年5月
