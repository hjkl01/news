# 开发指南

## 🛠️ 开发环境设置

### 1. 环境要求

- **Node.js**: 18.0.0 或更高版本
- **包管理器**: npm, yarn, 或 pnpm
- **编辑器**: VS Code (推荐)
- **浏览器**: Chrome, Firefox, Safari, Edge

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

### 3. 开发服务器

```bash
# 启动开发服务器
npm run dev

# 访问地址
http://localhost:3000
```

## 📁 项目结构详解

```
news/
├── src/
│   └── app/                    # Next.js App Router
│       ├── rss/
│       │   └── page.jsx        # RSS阅读器主页面
│       ├── components/         # 可复用组件
│       │   ├── Header.jsx
│       │   ├── Sidebar.jsx
│       │   └── FeedList.jsx
│       ├── hooks/             # 自定义Hook
│       │   ├── useRSSData.js
│       │   └── useLoadingState.js
│       ├── utils/             # 工具函数
│       │   ├── rss.js
│       │   └── helpers.js
│       ├── layout.tsx         # 根布局
│       ├── globals.css        # 全局样式
│       └── page.jsx           # 首页
├── public/
│   ├── rss-feeds.json         # RSS源配置
│   └── favicon.ico
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── README.md
```

## 🔧 核心概念

### 1. 状态管理

项目使用React Hooks进行状态管理，主要分为以下几个部分：

#### RSS数据管理 (useRSSData)
```javascript
const {
  feedsByCategory,    // 按分类存储的feeds
  categories,         // 分类列表
  rssConfig,         // RSS配置
  loading,           // 加载状态
  error,             // 错误信息
  loadCategoriesAndConfig,  // 加载配置
  addFeedsToCategory,      // 添加feeds到分类
  clearCategoryFeeds,      // 清空分类feeds
  clearAllFeeds,          // 清空所有feeds
  setError               // 设置错误
} = useRSSData();
```

#### 加载状态管理 (useLoadingState)
```javascript
const {
  loadingFeeds,        // 正在加载的feeds
  failedFeeds,         // 加载失败的feeds
  loadedFeedsCount,    // 已加载的feeds数量
  addLoadingFeed,      // 添加加载状态
  removeLoadingFeed,   // 移除加载状态
  addFailedFeed,       // 添加失败状态
  incrementLoadedCount, // 增加加载计数
  resetLoadingState    // 重置加载状态
} = useLoadingState();
```

### 2. 动态加载机制

#### 分批加载
```javascript
const BATCH_SIZE = 3;  // 每批3个RSS源
const BATCH_DELAY = 100;  // 批次间延迟100ms
```

#### 并发控制
```javascript
// 并发加载当前批次
batch.forEach(async (feedConfig) => {
  addLoadingFeed(feedConfig.title);
  
  try {
    const result = await fetchRSSFeed(feedConfig, category);
    if (result && result.length > 0) {
      addFeedsToCategory(categoryId, result);
      incrementLoadedCount();
    } else {
      addFailedFeed(feedConfig.title);
    }
  } catch (error) {
    addFailedFeed(feedConfig.title);
  } finally {
    removeLoadingFeed(feedConfig.title);
  }
});
```

### 3. 性能优化

#### React优化
```javascript
// 使用useCallback优化事件处理
const handleCategoryClick = useCallback(async (categoryId) => {
  // 处理逻辑
}, [dependencies]);

// 使用useMemo优化计算属性
const groupedFeeds = useMemo(() => {
  return currentFeeds.reduce((acc, feed) => {
    // 分组逻辑
  }, {});
}, [currentFeeds]);
```

#### 缓存策略
```javascript
// 分类数据缓存
if (!feedsByCategory[categoryId] || feedsByCategory[categoryId].length === 0) {
  await loadFeedsForCategory(categoryId);
} else {
  // 使用缓存数据
}
```

## 🎨 样式指南

### 1. Tailwind CSS

项目使用Tailwind CSS进行样式管理：

```javascript
// 响应式设计
className="grid grid-cols-1 lg:grid-cols-4 gap-8"

// 状态样式
className={`px-4 py-2 rounded-lg ${
  isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
}`}

// 动画效果
className="transition-all duration-200 transform hover:scale-105"
```

### 2. 组件样式

#### 卡片组件
```javascript
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
  {/* 卡片内容 */}
</div>
```

#### 按钮组件
```javascript
<button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
  {/* 按钮内容 */}
</button>
```

## 🔍 调试指南

### 1. 浏览器调试

#### 控制台日志
```javascript
// 开发环境下的调试信息
console.log(`Loading batch ${batchNumber}:`, batch.map(f => f.title));
console.log(`Successfully loaded ${result.length} items from ${feedName}`);
console.warn(`Failed to load feed: ${feedName}`, result);
```

#### React DevTools
- 安装React DevTools浏览器扩展
- 查看组件状态和props
- 监控组件重新渲染

### 2. 网络调试

#### 网络请求监控
```javascript
// 在浏览器开发者工具的Network标签页中查看：
// - RSS代理请求
// - 配置文件加载
// - 请求状态和响应时间
```

#### 错误处理
```javascript
// 检查RSS源是否可访问
const response = await fetch(proxyUrl);
if (!response.ok) {
  console.warn(`HTTP error for ${feedConfig.name}: ${response.status}`);
  return null;
}
```

## 🧪 测试指南

### 1. 单元测试

```javascript
// 使用Jest和React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import RSSPage from './RSSPage';

describe('RSSPage', () => {
  test('should load categories on mount', () => {
    render(<RSSPage />);
    expect(screen.getByText('RSS订阅阅读器')).toBeInTheDocument();
  });

  test('should handle category click', () => {
    render(<RSSPage />);
    const categoryButton = screen.getByText('新闻');
    fireEvent.click(categoryButton);
    // 验证状态变化
  });
});
```

### 2. 集成测试

```javascript
// 测试RSS源加载
test('should load RSS feeds for category', async () => {
  render(<RSSPage />);
  
  // 等待分类加载
  await waitFor(() => {
    expect(screen.getByText('新闻')).toBeInTheDocument();
  });
  
  // 点击分类
  fireEvent.click(screen.getByText('新闻'));
  
  // 验证加载状态
  expect(screen.getByText('正在动态加载RSS内容...')).toBeInTheDocument();
});
```

## 🚀 部署指南

### 1. 构建生产版本

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

### 2. 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_RSS_PROXY_URL=https://rsstojson.hjkl01.cn/api/rss
NEXT_PUBLIC_BATCH_SIZE=3
NEXT_PUBLIC_BATCH_DELAY=100
```

### 3. 部署平台

#### Vercel (推荐)
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

#### Netlify
```bash
# 构建
npm run build

# 部署到Netlify
# 上传out目录到Netlify
```

## 📝 代码规范

### 1. 命名规范

```javascript
// 组件使用PascalCase
const RSSPage = () => {};

// Hook使用camelCase，以use开头
const useRSSData = () => {};

// 常量使用UPPER_SNAKE_CASE
const BATCH_SIZE = 3;

// 变量和函数使用camelCase
const loadFeedsForCategory = () => {};
```

### 2. 文件组织

```javascript
// 每个文件只导出一个主要功能
// hooks/useRSSData.js
export const useRSSData = () => {
  // Hook实现
};

// utils/rss.js
export const fetchRSSFeed = async () => {
  // RSS获取逻辑
};
```

### 3. 注释规范

```javascript
/**
 * 加载指定分类的RSS feeds
 * @param {string} categoryId - 分类ID
 * @returns {Promise<void>}
 */
const loadFeedsForCategory = async (categoryId) => {
  // 实现逻辑
};

// 单行注释
const BATCH_SIZE = 3; // 每批加载的RSS源数量
```

## 🔄 版本控制

### 1. Git工作流

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "feat: add new RSS source management"

# 推送到远程
git push origin feature/new-feature

# 创建Pull Request
```

### 2. 提交信息规范

```bash
# 功能新增
feat: add RSS source management

# 问题修复
fix: resolve RSS loading timeout issue

# 文档更新
docs: update README with new features

# 性能优化
perf: optimize RSS loading performance

# 重构
refactor: restructure RSS data management
```

## 🎯 最佳实践

### 1. 性能优化

- 使用React.memo包装纯组件
- 合理使用useCallback和useMemo
- 避免在渲染函数中创建对象
- 使用懒加载和代码分割

### 2. 用户体验

- 提供加载状态反馈
- 优雅处理错误情况
- 支持键盘导航
- 确保响应式设计

### 3. 代码质量

- 编写可读性强的代码
- 添加适当的注释
- 遵循单一职责原则
- 保持代码简洁

## 📚 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React Hooks 文档](https://react.dev/reference/react/hooks)

---

如有问题，请查看项目文档或提交Issue。 