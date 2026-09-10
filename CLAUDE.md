# puerh-astro

1:1 复刻 puerhdirect.com 的 Astro 静态站点，面向俄罗斯 B2B 普洱茶批发。暗色主题 + 橙色 #F58220 点缀，RU/EN 双语（同页面内联显示，非 i18n 路由分离）。无购物车、无在线支付，纯展示 + 线下询价。

## 交接文档

接手本项目前，按顺序读：
1. `CLAUDE.md`（本文件）— 项目地图、技术栈、目录结构
2. `docs/handoff.md` — 交接记录（当前状态、待办、诊断结论）
3. `docs/russian-writing-guide.md` — 俄语撰写规范（写任何俄语前必读）

## 线上地址
- 生产: https://puerhdirect.ru
- 部署: Cloudflare Pages（wrangler CLI）
- 仓库: https://github.com/Shunqu-668/puerh-astro

## 技术栈
- **Astro v6.3.8**，output: static
- **Tailwind CSS v4.1.17** via `@tailwindcss/vite`
- **@astrojs/sitemap**（sitemap + 自定义 XSL 样式）
- **sharp**（图片处理 / WebP 转换）
- **Web3Forms** 免费版（联系表单，250 次/月）
- **Yandex Metrica** ID 109468811

## 目录结构
```
puerh-astro/
  astro.config.mjs        # site URL + sitemap + XSL 集成
  package.json
  wrangler.toml           # Cloudflare Pages 配置
  public/
    images/               # 产品图 + 场景图（从参考站 1:1 下载）
    robots.txt            # Allow: / + sitemap-index.xml
    _headers
    sitemap.xsl
    llms.txt
  src/
    components/
      Layout.astro        # SEO meta + OG + JSON-LD + Metrica + ClientRouter
      Nav.astro           # 顶部导航（fixed, 移动端汉堡菜单）
      Footer.astro        # 3列页脚, 橙色顶边, bg #111111
      CoverHero.astro     # 通用 Cover Hero（标题+副标题+背景图）
      CTAButton.astro     # 橙色按钮组件
      Picture.astro       # <picture> WebP <source> + <img> fallback
    integrations/
      sitemap-xsl.mjs     # sitemap XSL 样式注入（node:fs 动态导入）
    data/
      products.ts         # 42 款产品数据 + 工具函数
      product-descriptions.json  # 产品 RU/EN/CN 三语描述
    content/
      blog/               # 5 篇俄语博客（Content Layer API, glob loader）
    pages/
      index.astro         # 首页（10 区块）
      catalog.astro       # 目录（42 产品卡片 + 分类筛选）
      about.astro         # 关于（云南产地 + 广州仓库 + 两代传承）
      contact.astro       # 联系（Telegram/WhatsApp/WeChat）
      private-label.astro # 贴牌白标（方案 + 格式 + 流程）
      compliance.astro    # EAC 合规（ТР ТС + 证书 + 流程）
      faq.astro           # 常见问题
      sample.astro        # 样品
      privacy.astro       # 隐私政策
      404.astro
      blog/
        index.astro       # 博客列表页
        [slug].astro      # 博客详情页（含 JSON-LD）
      catalog/
        ripe-puerh.astro  # 熟普子分类
        raw-puerh.astro   # 生普子分类
        teaware.astro     # 茶具
        other-tea.astro   # 其他茶
        product/
          [slug].astro    # 产品详情页
    styles/
      global.css          # Tailwind v4 + 自定义主题色
  scripts/
    monitor-upstream.mjs  # 上游监控（抓取 puerhdirect.com 快照）
    convert-webp.mjs      # 图片转 WebP
    scrape-descriptions.mjs # 抓取产品描述
  upstream-snapshots/     # puerhdirect.com 页面快照
  .github/workflows/      # monitor-upstream.yml（每周一自动运行）
  dist/                   # 构建输出
```

## 配色
- 橙色主色: #F58220
- 暗色区块: #1a1a1a
- 页脚: #111111（橙色顶边）
- 灰底: #f5f5f5

## 启动与部署
```bash
npm install
npm run dev      # → http://localhost:4321
npm run build    # 构建静态站点到 dist/

# 部署到 Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name puerh-astro --branch main
```

## 常见操作
- **修改产品数据**: 编辑 `src/data/products.ts`（42 款）+ `src/data/product-descriptions.json`（三语描述）
- **新增博客**: 在 `src/content/blog/` 添加 `.md` 文件（frontmatter: title/description/pubDate）
- **修改通用布局**: 编辑 `src/components/Layout.astro`
- **添加新页面**: 在 `src/pages/` 创建 `.astro` 文件，路由自动匹配文件名

## 俄语撰写规范
见记忆目录 `russian-writing-guide.md`。核心：**极短句**（每句 ≤10 词、每段 ≤2 句、名词结构优先），用词黑名单（`кастомизация`→`изготовление под заказ` 等），专有名词转写统一（`Мэнхай`/`Фанцунь` 不写拉丁转写），杜绝机翻味。

## 网络注意事项
- 本地需设代理: `HTTP_PROXY=https://127.0.0.1:26445`
- git push 需配代理: `git config http.proxy http://127.0.0.1:26445`
- GitHub Actions 无需代理（美国 IP）

## 验证状态
- ✅ 全部页面 200 OK，构建零错误（62 页）
- ✅ 图片 WebP + `<img>` fallback 适配
- ✅ 移动端汉堡菜单、响应式网格、触摸优化
- ✅ Astro 6.3.8
- ✅ robots.txt 已修复（标准 Allow 规则 + sitemap-index.xml）

## 注意
- RU/EN 双语在每个文本块中内联显示，无语言切换逻辑
