# Agent Frontend

基于 React + TypeScript + MUI + Tailwind CSS 的智能助手前端应用。

## 🚀 项目状态

✅ **已完成** - 项目基础架构和核心功能已实现，开发服务器运行在 http://localhost:3000

## 🛠 技术栈

- **构建工具**: Vite 4.5
- **核心框架**: React 18 + TypeScript
- **UI组件库**: Material-UI (MUI) 5.14
- **CSS框架**: Tailwind CSS 3.3
- **路由**: React Router 6.20
- **状态管理**: 自定义Hooks + React State
- **HTTP客户端**: Axios 1.6
- **图标**: Material Icons

## ✨ 主要功能

### 🎯 已实现功能

1. **完整的聊天界面**
   - 现代化的Material Design风格
   - 响应式布局，支持桌面和移动端
   - 实时消息流式传输（SSE）
   - 消息气泡带头像和时间戳
   - 消息操作（复制、更多选项）

2. **会话管理**
   - 创建新对话
   - 会话列表展示
   - 删除单个或批量会话
   - 会话时间格式化显示
   - 最后消息预览

3. **用户界面**
   - 应用头部导航
   - 聊天页面和设置页面
   - 错误边界处理
   - 加载状态指示
   - 成功/错误提示

4. **设置管理**
   - 界面设置（深色模式、自动保存、通知）
   - API配置（URL、Token数、温度参数）
   - 数据管理（保存、重置、清除）
   - 应用信息展示

## 🚀 快速开始

### 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
# 浏览器打开 http://localhost:3000
```

### 构建生产版本

```bash
npm run build
```

## ⚙️ 配置

### 环境变量

创建 `.env` 文件：

```env
# API 基础URL
VITE_API_BASE_URL=http://localhost:8080

# 应用配置
VITE_APP_TITLE=Agent Frontend
VITE_APP_VERSION=0.0.1
```

## 🔮 下一步开发计划

1. **功能增强**
   - 深色模式主题切换
   - 消息搜索功能
   - 文件上传支持
   - 导出对话记录

2. **用户体验**
   - 虚拟滚动优化
   - 消息渲染优化
   - 离线状态处理
   - PWA支持

## 📄 许可证

本项目采用 MIT 许可证。 