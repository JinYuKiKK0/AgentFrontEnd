# Agent 聊天助手前端

这是一个基于 Next.js 和 React 构建的现代化 AI 聊天助手前端项目，与基于 SpringBoot + Spring AI 的后端服务配合使用。

## 功能特点

- 🚀 现代化的聊天界面设计
- 💬 实时消息发送和接收
- 🎨 响应式布局，适配各种设备
- ⌨️ 支持快捷键操作（Enter 发送，Shift+Enter 换行）
- 🔄 加载状态动画反馈
- 🌈 基于 Tailwind CSS 的美观 UI

## 技术栈

- **Next.js**: React 框架，提供服务端渲染和静态生成
- **React**: 用户界面库
- **TypeScript**: 类型安全的 JavaScript 超集
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Axios**: HTTP 客户端，用于 API 请求
- **Heroicons**: SVG 图标集

## 快速开始

### 前提条件

- Node.js 16.x 或更高版本
- 后端服务运行在 http://localhost:8080

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式运行

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 运行生产版本

```bash
npm run start
# 或
yarn start
```

## API 接口

项目使用 `/ai/chat` 接口与后端通信，详细信息可在 `swagger/default_OpenAPI.json` 文件中查看。

## 项目结构

```
├── public/             # 静态资源
├── src/                # 源代码
│   ├── components/     # 组件
│   ├── pages/          # 页面
│   ├── services/       # API 服务
│   ├── styles/         # 样式
│   └── utils/          # 工具函数
├── .gitignore          # Git 忽略文件
├── next.config.js      # Next.js 配置
├── package.json        # 项目依赖
├── README.md           # 项目说明
├── tailwind.config.js  # Tailwind CSS 配置
└── tsconfig.json       # TypeScript 配置
```

## 自定义配置

如需修改 API 服务地址，请编辑 `src/services/api.ts` 文件中的 `API_BASE_URL` 常量。