# Portal Layout Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页重构为高密度门户三栏布局，提升信息层级与扫读效率，同时保持现有数据流与路由行为不变。

**Architecture:** 采用“页面容器重排 + 列表展示模式拆分 + 全局密度样式收敛”的增量方案。`page.jsx` 负责区域编排，`NewsList.jsx` 负责不同密度展示变体，`Header.tsx` 和 `globals.css` 负责统一交互与视觉密度约束。全程不动数据来源和抓取链路。

**Tech Stack:** Next.js 14 (App Router), React 18, Tailwind CSS, ESLint (next lint)

---

## File Structure Map

- Modify: `src/app/page.jsx`
  - 责任：从单入口视图改为门户三栏壳层，编排左/中/右区域
- Modify: `src/app/components/NewsList.jsx`
  - 责任：提供主内容流与热点快览两种高密度展示模式
- Modify: `src/app/components/Header.tsx`
  - 责任：导航高密度化，保留 active 逻辑
- Modify: `src/app/globals.css`
  - 责任：新增/统一密度 token 与轻交互规则
- Optional Create: `src/app/components/PortalWidgets.jsx`
  - 责任：右栏工具块（趋势词/快捷入口/订阅入口）
- Test surface (manual + lint/build):
  - `npm run lint`
  - `npm run build`
  - 断点视觉检查：`sm/md/lg/xl`

---

## Chunk 1: Portal Shell & Region Composition

### Task 1: 重构首页为三栏门户骨架

**Files:**
- Modify: `src/app/page.jsx`
- Optional Create: `src/app/components/PortalWidgets.jsx`

- [ ] **Step 1: 先写失败快照用例（手工断言清单）**

在任务备注中写明当前失败标准（当前页面不存在三栏容器）：

```text
期望失败：页面仅有 NewsCloud 单区域，缺少 left/center/right 结构标识
```

- [ ] **Step 2: 运行当前页面确认失败状态**

Run: `npm run dev`  
Expected: 首页没有三栏结构（仅单块内容）

- [ ] **Step 3: 实现最小三栏容器（不改数据源）**

在 `page.jsx` 将主区域改为：

```jsx
<main className="mx-auto w-full max-w-7xl px-3 py-4 lg:px-4">
  <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12">
    <aside className="order-2 md:order-2 lg:order-1 lg:col-span-3" data-region="left" />
    <section className="order-1 md:order-1 lg:order-2 lg:col-span-6" data-region="center" />
    <aside className="order-3 md:order-3 lg:order-3 lg:col-span-3" data-region="right" />
  </section>
</main>
```

说明：中栏优先渲染现有主内容；左/右栏先占位，随后接入列表变体与 widgets。

- [ ] **Step 4: 验证三栏结构生效**

Run: `npm run dev`  
Expected: `lg` 为三栏，`md` 为双栏，`sm` 为单栏（中→左→右顺序）

- [ ] **Step 5: 提交**

```bash
git add src/app/page.jsx src/app/components/PortalWidgets.jsx
git commit -m "feat: scaffold portal three-column homepage shell"
```

> 若未创建 `PortalWidgets.jsx`，从 `git add` 中移除该路径。

---

## Chunk 2: NewsList High-Density Variants

### Task 2: 为 NewsList 增加展示模式（main/hot）

**Files:**
- Modify: `src/app/components/NewsList.jsx`

- [ ] **Step 1: 写失败断言（展示模式不存在）**

```text
期望失败：NewsList 仅有单一展示样式，无法按 region 复用为主流与快览
```

- [ ] **Step 2: 确认失败状态**

Run: `npm run dev`  
Expected: 左栏无法以紧凑快览模式复用当前数据

- [ ] **Step 3: 实现最小模式参数与分支渲染**

在 `NewsList` 增加 props：

```jsx
const NewsList = ({ data, error, loading = false, mode = 'main' }) => {
  const isHotMode = mode === 'hot';
  // 根据 mode 选择更紧凑或标准渲染块
};
```

目标：
- `main`：保留分组 + 展开结构（但压缩间距）
- `hot`：标题优先、元信息弱化、每条高度更小

- [ ] **Step 4: 将密度参数落到关键 class**

要求：
- 列表项 padding 缩小
- 移除位移动效（hover 不 `-translate-y`）
- 元信息保持单行优先

- [ ] **Step 5: 验证模式切换效果**

Run: `npm run dev`  
Expected:
- 中栏信息完整
- 左栏单位屏可见条数显著增加

- [ ] **Step 6: 提交**

```bash
git add src/app/components/NewsList.jsx
git commit -m "feat: add high-density main and hot list variants"
```

---

## Chunk 3: Header Density Compression

### Task 3: 导航高密度化（保留 active 逻辑）

**Files:**
- Modify: `src/app/components/Header.tsx`

- [ ] **Step 1: 写失败断言（当前导航装饰偏重）**

```text
期望失败：导航胶囊感、阴影与留白偏大，不符合高密度门户扫读目标
```

- [ ] **Step 2: 最小化视觉装饰并压缩间距**

改造点：
- 减小 nav link 横向 padding
- 降低阴影层级
- 仅保留 active 态强调色

- [ ] **Step 3: 验证 active 行为无回归**

Run: `npm run dev`  
Expected: 切换路由时 active 链接仍准确

- [ ] **Step 4: 提交**

```bash
git add src/app/components/Header.tsx
git commit -m "refactor: compress header navigation density"
```

---

## Chunk 4: Global Density Tokens & Interaction Rules

### Task 4: 收敛全局密度与交互规范

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 写失败断言（缺少统一密度 token）**

```text
期望失败：当前组件各自定义间距与交互，无法保证门户态一致密度
```

- [ ] **Step 2: 添加密度 token 与轻交互类**

示例（按项目命名风格调整）：

```css
:root {
  --density-gap-sm: 0.5rem;
  --density-gap-md: 0.75rem;
  --density-item-px: 0.75rem;
  --density-item-py: 0.5rem;
}

.hover-lite {
  transition: background-color 160ms ease;
}
```

- [ ] **Step 3: 清理不符合新规范的全局位移动效**

目标：高密度内容区不使用 hover 位移。

- [ ] **Step 4: 验证全站样式一致性**

Run: `npm run dev`  
Expected: 首页模块视觉节奏一致，扫读稳定

- [ ] **Step 5: 提交**

```bash
git add src/app/globals.css
git commit -m "style: add portal density tokens and light interaction rules"
```

---

## Chunk 5: Integration & Verification

### Task 5: 整体装配与回归验证

**Files:**
- Modify: `src/app/page.jsx`
- Modify: `src/app/components/NewsList.jsx`
- Modify: `src/app/components/Header.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: 连接 page 区域与列表模式**

目标映射：
- center → `NewsList mode="main"`
- left → `NewsList mode="hot"`（可筛选 top-N）
- right → `PortalWidgets` 或占位模块

- [ ] **Step 2: 运行 lint**

Run: `npm run lint`  
Expected: 无 error

- [ ] **Step 3: 运行 build**

Run: `npm run build`  
Expected: build 成功

- [ ] **Step 4: 手工断点验收**

检查项：
- `sm`: 中→左→右顺序正确
- `md`: 双栏布局清晰
- `lg/xl`: 三栏比例接近 22/56/22
- 导航 active 正常
- 交互无位移抖动

- [ ] **Step 5: 提交整合变更**

```bash
git add src/app/page.jsx src/app/components/NewsList.jsx src/app/components/Header.tsx src/app/globals.css src/app/components/PortalWidgets.jsx
git commit -m "feat: ship high-density portal homepage layout refactor"
```

---

## Chunk 6: Documentation & Final QA

### Task 6: 更新文档并形成交付说明

**Files:**
- Modify: `README.md`（如需）
- Modify: `DEVELOPMENT.md`（如需）

- [ ] **Step 1: 补充布局说明与断点规则**

记录：
- 三栏门户策略
- 高密度原则
- 手工验收关键项

- [ ] **Step 2: 最终回归执行**

Run:

```bash
npm run lint && npm run build
```

Expected: 全通过

- [ ] **Step 3: 最终提交（仅文档变更）**

```bash
git add README.md DEVELOPMENT.md
git commit -m "docs: document portal layout and density rules"
```

---

## Notes for Implementation Discipline

- 遵循 DRY / YAGNI：先完成结构与密度目标，不提前引入新功能。
- 每个 task 完成即提交，保持可回滚与审查友好。
- 若某一步需要偏离计划，先在提交信息中解释“偏离原因 + 替代方案”。
