# RSS订阅阅读器

一个现代化的RSS订阅阅读器，基于Next.js 14构建，提供流畅的阅读体验和智能的内容管理。

## ✨ 主要特性

- 🚀 **动态加载**: 真正的动态加载体验，内容实时显示
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代化UI**: 基于Tailwind CSS的优雅界面
- ⚡ **高性能**: 优化的React组件和状态管理
- 🔄 **智能缓存**: 避免重复加载，提升用户体验
- 📊 **实时反馈**: 丰富的加载状态和进度指示
- 🎯 **分类管理**: 智能分类和内容组织
- 🔍 **搜索排序**: 支持按时间排序和内容搜索

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **UI库**: React 18 + Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Hooks + 自定义Hook
- **构建工具**: Vite (通过Next.js)
- **语言**: JavaScript/TypeScript

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm/yarn/pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
news/
├── src/
│   └── app/
│       ├── rss/
│       │   └── page.jsx          # RSS阅读器主页面
│       ├── components/           # 可复用组件
│       ├── layout.tsx           # 根布局
│       └── globals.css          # 全局样式
├── public/
│   └── rss-feeds.json           # RSS源配置文件
├── package.json
├── tailwind.config.ts
└── README.md
```

## ⚙️ 配置说明

### RSS源配置

在 `public/rss-feeds.json` 中配置RSS源：

```json
{
  "feeds": [
    {
      "title": "RSS源名称",
      "category": "分类名称",
      "url": "RSS源URL"
    }
  ]
}
```

## 🎯 核心功能

### 1. 动态加载
- 分批并发加载RSS源
- 每个源加载完成后立即显示
- 智能的加载状态管理

### 2. 分类管理
- 自动分类RSS源
- 支持分类切换
- 分类数据缓存

### 3. 内容展示
- 响应式文章列表
- 支持展开/收起
- 按时间排序功能

### 4. 用户体验
- 实时加载反馈
- 错误处理和重试
- 优雅的加载动画

## 📊 性能优化

### 已实现的优化

- ✅ React.memo 和 useMemo 优化
- ✅ useCallback 优化事件处理
- ✅ 动态导入和代码分割
- ✅ 图片懒加载
- ✅ 缓存策略

## 🐛 故障排除

### 常见问题

1. **RSS源加载失败**
   - 检查网络连接
   - 验证RSS源URL是否有效
   - 查看浏览器控制台错误信息

2. **页面加载缓慢**
   - 检查RSS代理服务状态
   - 减少并发加载数量
   - 优化RSS源配置

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Lucide](https://lucide.dev/) - 图标库
- [RSS to JSON](https://rsstojson.com/) - RSS代理服务

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
