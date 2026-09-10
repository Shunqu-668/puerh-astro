# 交接记录

> 接手本项目前，先读 `CLAUDE.md`（项目地图）了解结构，再读本文件了解进度和待办。

## 当前状态（一句话）

代码侧已全部完成、构建稳定；卡在**用户侧人工操作**（Yandex Webmaster 验证 / Direct 开户 / VK·TG 建社群）。接手后先确认用户是否已推进这些，再决定下一步。

## 部署状态

- ✅ 生产: https://puerhdirect.ru（Cloudflare Pages）
- ✅ 最后部署: 0559b16（2026-06-29），此后代码无新提交
- ✅ 构建 62 页零错误，全部页面 200 OK
- ✅ robots.txt 已修复（Allow: / + sitemap-index.xml）

## 已完成（AI 侧，全部 ✅）

| 项 | 内容 | 提交 |
|----|------|------|
| 产品图 | 全站 56 处 `<img>` 换成 `Picture.astro`（WebP + fallback） | 0559b16 |
| EAC 页面 | /compliance（ТР ТС + 5 类证书 + 4 步流程） | 0559b16 |
| 博客 | 框架 + 5 篇俄语文章（Content Layer API，列表+详情+JSON-LD） | 9a68077 |
| 俄语精简 | #11 非产品页缩句 + #12 42 款产品描述校对（短句、去黑名单词、修语法） | d3301ce 等 |
| B2B 关键词 | teaware/sample + 42 款产品描述统一加 «Фанцунь» / MOQ 20кг | 953a857 |
| SEO | 全站 meta description 个性化 + 三语产品描述 + JSON-LD | b00cbf5 等 |
| robots.txt | 移除重复 Yandex 块 + Clean-param，标准 Allow 规则 | 50fcd16 |
| 监控 | 上游快照自动刷新（GitHub Actions 每周一）+ 本地脚本 | 42b81c4 |

## 待办（全部是用户侧人工操作，AI 无法代做）

### 🔴 阻塞主链（严格顺序：先 #2 → 才能 #6）

| # | 任务 | 谁 | 状态 |
|---|------|-----|------|
| 2 | Yandex Webmaster 验证域名 + 提交 sitemap + 重抓页面 | 👤 用户 | ⬜ 卡住 |
| 6 | Yandex Direct 关键词调研 + 文案（AI 可先做调研） | 🤖 Claude | ⬜ 等 #2 |
| 6 | Yandex Direct 开户 + 充值 + 投放 | 👤 用户 | ⬜ 等 #2 |

### 🟡 独立并行（不依赖主链）

| # | 任务 | 谁 | 状态 |
|---|------|-----|------|
| 5 | VK 建社群 + 首发帖 | 👤 用户 | ⬜ |
| 5 | Telegram 频道升级为内容频道 | 👤 用户 | ⬜ |
| 5 | Tiu.ru + Avito 入驻上架 | 👤 用户（AI 写描述） | ⬜ |
| 5 | 茶论坛注册 + Yandex Business | 👤 用户 | ⬜ |
| 8 | 对齐上游 HTML 差异（首页/img/contact/nav） | 🤖 Claude | ⬜ 低优先级 |

## 已知诊断结论（接手必读）

1. **俄语区无流量根因**：Yandex 索引不足（80%）+ 无内容 + 无推广 + 无外链。
2. **俄语"机翻味"根因**：上游用极短句（5-8 词、名词结构），本站早期加了大段长段落（10-25 词、动词结构）暴露 AI 痕迹。已通过 #11/#12 全部缩句修复。**后续任何新增俄语必须遵守 `docs/russian-writing-guide.md`。**
3. **分类器曾卡死写操作**：DeepSeek v4-pro 间歇不可用导致 Auto 模式分类器卡死。已手动切"询问模式"绕开。

## Yandex Webmaster 待完成三项（用户操作清单）

1. **Search query statistics** → 创建自定义分组，添加目标搜索词（пуэр оптом / чай пуэр из китая / шу пуэр купить оптом / private label пуэр / контрактное производство чая），按品类分组（Шу Пуэр / Шэн Пуэр / Private Label）
2. **Important page monitoring** → 添加核心页面（首页 / catalog / private-label / about / contact）
3. 确认 robots.txt 修复后 Yandex Site Diagnostics 不再报错

## 环境

- 工作目录: `D:\桌面\RU普洱\puerh-astro`（接手后以实际路径为准）
- 网络: git push 当前直连可用（旧代理 127.0.0.1:26202/26445 已失效，代理软件未运行）
- 本地抓取上游如需代理: `HTTP_PROXY=https://127.0.0.1:26445`
- 部署: `npm run build && npx wrangler pages deploy dist --project-name puerh-astro --branch main`
- 监控: 每周一 8:00 UTC GitHub Actions（monitor-upstream.yml）
- 本地监控: `HTTP_PROXY=https://127.0.0.1:26445 node scripts/monitor-upstream.mjs`
- Yandex Webmaster: https://webmaster.yandex.com
- Yandex Metrica: ID 109468811
- 仓库: https://github.com/Shunqu-668/puerh-astro
