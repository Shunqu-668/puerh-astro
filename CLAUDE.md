# puerh-astro

1:1 复刻 puerhdirect.com 的 Astro 静态站点。暗色主题 + 橙色 #F58220 点缀，RU/EN 双语（同页面显示，非 i18n 路由分离）。

## 技术栈
- **Astro v5.7+**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **输出**: 静态站点 (`output: 'static'`)

## 目录结构
```
puerh-astro/
  astro.config.mjs
  package.json
  public/
    images/           # 66张图片（从参考站1:1下载）
      logo.png
      1.jpg ~ 4.png   # 分类图
      hero-bg.JPG      # Hero背景
      ...              # 场景图、产品形状图
      products/        # 44张产品图
  src/
    components/
      Layout.astro     # 共享布局（Nav + main + Footer）
      Nav.astro        # 顶部导航（fixed, 移动端汉堡菜单）
      Footer.astro     # 3列页脚, 橙色顶边, bg #111111
      CoverHero.astro  # 通用Cover Hero（标题+副标题+背景图）
      CTAButton.astro  # 橙色按钮组件
    data/
      products.ts      # 44个产品数据 + 工具函数
    pages/
      index.astro      # 首页（10区块）
      catalog.astro    # 目录（44产品卡片+分类筛选）
      private-label.astro  # 贴牌（白标方案+4格式+4步流程）
      about.astro      # 关于（云南产地+广州仓库+两代传承）
      contact.astro    # 联系（Telegram/WhatsApp/WeChat）
      catalog/
        ripe-puerh.astro   # 熟普子分类
        raw-puerh.astro    # 生普子分类
        teaware.astro      # 茶具
        other-tea.astro    # 其他茶
    styles/
      global.css       # Tailwind v4 + 自定义主题色
```

## 配色
- 橙色主色: #F58220
- 暗色区块: #1a1a1a
- 页脚: #111111 (橙色顶边)
- 灰底: #f5f5f5

## 启动方式
```bash
npm install
npm run dev      # → http://localhost:4321
npm run build    # 构建静态站点到 dist/
```

## 常见操作
- **修改产品数据**: 编辑 `src/data/products.ts`
- **修改通用布局**: 编辑 `src/components/Layout.astro`
- **添加新页面**: 在 `src/pages/` 创建 `.astro` 文件，路由自动匹配文件名

## 验证状态
- ✅ 全部 10 页 200 OK，构建零错误
- ✅ 图片路径已适配 `public/images/images/` 现有目录结构
- ✅ 移动端汉堡菜单、响应式网格、触摸优化
- ⚠️ Astro 5.18.2（可升级到 6.3.8: `npx @astrojs/upgrade`）

## 注意
- RU/EN 双语在每个文本块中内联显示，无语言切换逻辑
