# 搜索平台连接与上线核验

> 2026-09-16用户纠正：GSC、Yandex在接手前均已连接。本次需求是让助手取得数据读取能力，不是重新验证域名。下面的初次验证教程保留为历史参考，不再作为下一步。当前流程见RELEASE_RUNBOOK.md；先检查已有账号会话或配置经过用户授权的只读数据访问。未读取后台数据，不再将域名验证列为用户待办。

更新：2026-09-16。域名由用户确认使用 puerhdirect.ru，DNS 在 Cloudflare；.com 独立运行。
本地 SEO 已验证。没有登录搜索账号、修改 DNS 或部署；本文为操作步骤，不是连接成功证明。

## Google Search Console

1. 用自己的 Google 账号打开 https://search.google.com/search-console/ 。已有该域名资源时先选择它、检查所有权，无需重复添加。
2. 添加资源，选「网域 / Domain」，输入 `puerhdirect.ru`，不要加协议、www 或路径。
3. 选择 DNS TXT 验证，复制 Google 给出的完整 `google-site-verification=...` 值。
4. Cloudflare 选择 puerhdirect.ru → DNS → Records → Add record。
5. Type=TXT，Name=@，Content=完整验证值，TTL=Auto，保存。新增记录，不覆盖邮箱 SPF、DKIM 或其他 TXT。
6. 回 Google 点击验证。若未找到记录，核对名称与内容并等待 DNS 生效后重试。成功后保留 TXT。

## Yandex Webmaster

1. 用自己的 Yandex 账号打开 https://webmaster.yandex.ru/ 。已有相同站点时先检查权限。
2. 添加 `https://puerhdirect.ru/`，保持 HTTPS、无 www，与本站规范地址一致。
3. 在所有权验证中选 DNS / TXT，原样复制平台给出的整条验证值。
4. 在 Cloudflare 同一域名新增另一条 TXT，Name=@，Content=Yandex 给出的值，TTL=Auto；不要把两家值合并进一条记录。
5. 返回 Yandex 验证。解析可能需要等待，成功后继续保留记录。

DNS 验证无需部署新版，也无需安装统计脚本。现有页面的旧 Yandex 验证标记和 Metrica 统计编号保留，但它们不能证明当前登录账号有权限。Webmaster 管收录，Metrica 管访问统计，两者分开。

## 新版上线后

- GSC「站点地图」与 Yandex「Indexing → Sitemap files」均提交 `https://puerhdirect.ru/sitemap-index.xml`。
- 先验证首页、目录、一个商品和一篇文章的线上抓取，再按需要申请索引/重新抓取。
- 验证 www 和 HTTP 永久跳转到无 www 的 HTTPS；页面返回200、缺失页返回404；正式页面没有 noindex 响应头或标签。
- 核对 CDN、防火墙、robots 和 sitemap 不妨碍搜索机器人；Cloudflare 预览部署默认 noindex，仍需核对实际响应。不要把默认生产 pages.dev 地址误认成预览部署。
- .com 不重定向到 .ru，也不把 .ru 的 canonical 指向 .com。两站同公司不代表要合并索引。
- 所有权验证后看到的统计可能仍是旧线上版本；本地预览无法被公网上的搜索平台收录。
- 跟踪俄罗斯目标查询的展现、点击、页面收录，以及真实有效询盘；不把检查通过视作排名或 AI 引用保证。

## 本地维护

运行「检查网站.cmd」会构建站点并运行功能和 SEO 检查。报告在 artifacts/verification.json、seo-verification.json。
DNS 验证时无需填写 .env；若采用 HTML 标签替代方式，可参考 .env.example 的公开验证值配置，不要填账号密码或 API 密钥。
SITE_NOINDEX=true 仅用于明确不允许收录的预览构建；正式域名保持 false。这个可选开关没有做单独环境构建验收，正式版已验证 index 策略。

## 官方依据

- Google所有权：https://support.google.com/webmasters/answer/9008080?hl=en
- Yandex所有权：https://yandex.ru/support/webmaster/en/service/rights
- Cloudflare DNS：https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/
- Yandex sitemap：https://yandex.com/support/webmaster/en/indexing-options/sitemap
- Google AI搜索：https://developers.google.com/search/docs/appearance/ai-features
