# RSS订阅阅读器 / NewsHub

一个现代化的 RSS 订阅阅读器与新闻聚合门户，基于 Next.js 构建，提供流畅的阅读体验和智能的内容管理。

在线地址：[https://news.hjkl01.cn/](https://news.hjkl01.cn/)

## ✨ 主要特性

- 🚀 **动态加载**: 真正的动态加载体验，内容实时显示
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代化UI**: 基于 Tailwind CSS 的优雅界面
- ⚡ **高性能**: 优化的 React 组件和状态管理
- 🔄 **智能缓存**: 避免重复加载，提升用户体验
- 📊 **实时反馈**: 丰富的加载状态和进度指示
- 🎯 **分类管理**: 智能分类和内容组织（新闻 / 国外 / 科技 / 技术 / 论坛 / 娱乐）
- 🔍 **搜索排序**: 支持按时间排序和内容搜索
- 🛡️ **爬虫熔断**: 关键源失败阈值、失败冷却、缓存 TTL

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router, Static Export)
- **UI**: React 19 + Tailwind CSS 4
- **图标**: Lucide React
- **日期**: dayjs
- **RSS**: rss-parser + node-fetch
- **语言**: JavaScript / TypeScript

## 🚀 快速开始

### 环境要求

- Node.js 20+（推荐 22 LTS）
- npm

### 安装依赖

```bash
npm ci
# 或
npm install
```

### 开发模式

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

### 构建前数据同步策略（推荐）

项目已支持两套同步/构建模式：

- 开发宽松模式（关键源失败不阻断）

```bash
npm run build:dev
```

- CI 严格模式（关键源失败达到阈值即阻断）

```bash
npm run build:ci
```

对应同步命令：

```bash
npm run sync:dev
npm run sync:ci
```

### GitHub Actions（CI）建议

部署工作流建议与本地保持一致：

```bash
npm ci
npm run build:ci
```

说明：`build:ci` 会自动执行 `prebuild:ci -> sync:ci -> crawl:ci + gene`，并在关键源失败达到阈值时阻断构建。

## 📁 项目结构

```
news/
├── src/app/
│   ├── page.jsx              # 首页
│   ├── news/                 # 新闻分类
│   ├── foreign/              # 国外分类
│   ├── tech/                 # 科技分类
│   ├── code/                 # 技术分类
│   ├── forum/                # 论坛分类
│   ├── funny/                # 娱乐分类
│   ├── rss/                  # 动态 RSS 阅读器
│   ├── components/           # 可复用组件
│   ├── layout.tsx
│   └── globals.css
├── public/
│   ├── rss-feeds.json        # RSS 源配置
│   ├── rss-items.json        # 爬取结果（构建时生成）
│   ├── rss-cache.json        # 源级缓存（构建时生成）
│   └── crawl-status.json     # 最近一次爬取状态
├── crawler.js                # RSS 爬虫
├── generate_news.js          # 按分类生成页面数据
├── package.json
└── README.md
```

## ⚙️ 配置说明

### RSS 源配置

在 `public/rss-feeds.json` 中配置 RSS 源：

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

分类建议：`新闻`、`国外`、`科技`、`技术`、`论坛`、`娱乐`。

### 爬虫环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `CRAWL_CONCURRENCY` | 8 | 并发数 |
| `CRAWL_CACHE_TTL_MINUTES` | 30 | 缓存有效期（分钟） |
| `CRAWL_FAILURE_COOLDOWN_MINUTES` | 20 | 失败熔断冷却（分钟） |
| `CRAWL_CRITICAL_FAILURE_THRESHOLD` | 1 | 关键源失败阈值（CI 用） |
| `CRAWL_CRITICAL_SOURCES` | github all,中国新闻网 即时新闻,solidot | 关键源关键词（逗号分隔） |
| `CRAWL_CACHE_ENABLED` | 1 | 设为 `0` 可关闭缓存 |

## 🎯 核心功能

### 1. 动态加载
- 分批并发加载 RSS 源
- 每个源加载完成后立即显示
- 智能的加载状态管理

### 2. 分类管理
- 自动分类 RSS 源
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
- ✅ 源级缓存 + 失败熔断
- ✅ dayjs 替代 moment（更小体积）

## 🐛 故障排除

### 常见问题

1. **RSS 源加载失败**
   - 检查网络连接
   - 验证 RSS 源 URL 是否有效
   - 查看 `public/crawl-status.json` 与浏览器控制台

2. **页面加载缓慢**
   - 检查 RSS 代理服务状态
   - 减少并发加载数量
   - 优化 RSS 源配置

3. **CI 构建被阻断**
   - 关键源失败达到阈值
   - 本地可先用 `npm run sync:dev` 排查

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide](https://lucide.dev/) - 图标库
- [dayjs](https://day.js.org/) - 轻量日期库
- [rss-parser](https://github.com/rbren/rss-parser) - RSS 解析

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
