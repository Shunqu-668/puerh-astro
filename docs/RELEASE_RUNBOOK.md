# 网站发布事实与执行流程

## 最新事实覆盖｜2026-09-16 Yandex优先
两个搜索平台官方API已接通，Cloudflare生产状态此前已只读验证；下文早期“未连接/未核”段为历史。当前Yandex地图61URL无错误，4在搜索。本地62页（61应收录）检查通过；本地robots经Yandex官方分析器0错误。发布后对照61URL逐页验证抓取与入搜索，详细清单见../../research/search-platform-data/yandex-local-index-audit.json，执行顺序与边界见../../research/YANDEX_LOCAL_SEO_2026-09-16.md。未部署或提交重新抓取。

核查：2026-09-16。来源为接收原件，未将旧文档中的命令或人工待办视为本轮执行授权。

## 最新后台实查（覆盖下方此前连接失败/待核项）

2026-09-16T08:37:04.506Z，Cloudflare官方API只读成功：项目puerh-astro，生产分支main，domains为puerh-astro.pages.dev和puerhdirect.ru，sourceType=null，无Git来源/构建配置返回，符合既有直接上传链路。当前生产部署7216ca9c-d971-4942-9999-b9ff421617e2，成功，2026-06-29T09:40:03.797956Z，commit0559b16fa389c513f71aef26d5367dd8b7c7d933。取得10条成功生产部署记录，证据位于业务根research/cloudflare-20260916/status.json。
未来新版上线前记录该当前成功部署作为回退基线；尚未尝试回退，当前只读成功不证明拥有部署写权限。
先前Node EACCES表明执行环境网络限制；经正常审批后只读成功，并非凭证已失效。Google/Yandex数据访问依然待独立OAuth，使用官方API，不用Wizard。实现及授权记录见业务根tools/SEARCH_API_README.md。

## 已有事实

- 当前维护：D:/SQ-MIX/projects/puerh-russia/site；Astro 6.3.8静态站；构建输出dist。
- 原部署方式：在项目目录本地构建，再用Wrangler上传dist到Cloudflare Pages项目puerh-astro，明确指定--branch main。来源：inbox/old-pc-20260910/workfiles/puerh-astro/CLAUDE.md的“启动与部署”、docs/handoff.md的“环境”，以及puerh-web/memory/puerh-astro-project.md。
- 旧发布命令：`npm run build`，然后`npx wrangler pages deploy dist --project-name puerh-astro --branch main`。命令仅作历史证据，本次未执行。
- 正式域名puerhdirect.ru；用户明确.com独立。
- Git远程Shunqu-668/puerh-astro，当前分支work/local-recovery。源码保存与上传构建产物是两个动作，不能推断push即自动上线。
- 仓库唯一现有Actions是每周监测.com并生成报告/可能创建Issue，不是生产部署工作流。不能因此证明Cloudflare后台一定没有Git绑定。
- 旧handoff记录最后部署0559b16，2026-06-29；这是历史记录，尚非当前Cloudflare部署ID实查。
- 旧.env存在Cloudflare授权相关变量；只检查变量名称，不在文档或聊天保存值。有效性、权限、所属当前项目尚未验证。

## 现有搜索平台状态

用户2026-09-16明确GSC和Yandex接手前已连接。本次“连接”指让助手读取现有平台数据。
旧puerh-web/memory/search-engine-indexing-plan.md标记2026-05-27已完成：Google使用Cloudflare DNS验证，Yandex使用HTML meta验证，两家均提交sitemap-index.xml。
旧puerh-astro/docs/handoff.md仍写Yandex验证阻塞，与前述材料冲突；由用户最新确认覆盖。不再要求新增TXT或重新验证。
搜索过旧项目相关文档与代码、配置文件名、两个.env的变量名，未找到可复用的GSC/Yandex API读取实现或OAuth凭证配置。范围不含全盘账号信息，不等于用户从未配置API。
现有Metrica统计编号不是Webmaster数据授权；Cloudflare凭证也不能读取GSC/Yandex。

## 后续发布顺序（待发布授权，不自动执行）

1. 读取现有GSC/Yandex数据保存上线前基线：近期完整28天与前28天，辅以3个月；展现、点击、CTR、位置、查询/页面/地区/设备、收录与抓取问题。各平台口径分别保留。
2. Cloudflare只读核验项目、正式域名、生产分支、当前部署ID/源码版本、可回退的成功生产部署、是否存在Git触发。旧记录不能替代此项。
3. 整理用户审核后的累计工作树；保留源图、响应式图片构建集成、品牌资产和锁文件，不包含.env、依赖、原始账号资料。记录待发布源码版本及构建产物指纹。
4. 构建并运行本地功能及SEO检查。目前已通过62页/27组/61可收录URL；实际发布时以确定源码重新检查。预览发布若获授权，用非生产分支验证线上资源、页面、响应头与移动端；预览禁止收录且表单当前设计不真实外发。
5. 明确获生产发布授权后，沿已确认原链路上传dist至原puerh-astro项目/main，不新建同名站、不迁移托管、不改.com。源码归档提交/远程推送也按用户授权，避免以push误触生产。
6. 核验实际.ru首页、目录、商品、文章、表单；HTTPS/www跳转、缺失页404、robots/sitemap/canonical、生产无noindex、图片缓存更新及Metrica加载。真实表单收件须明确测试授权并实际查收，不能用模拟测试代替。
7. 检查两家现有站点地图处理状态和抽样URL抓取，有必要时请求重新抓取；不重新建资源或删除历史数据。保持可比较周期，后续效果看有效询盘与搜索变化。
8. 若出现严重问题，按预先记录的成功生产部署回退；回退后重新验站。不能把源码git reset当成线上回退。发布与回退记录都落本项目。

## 当前核验边界

本轮尝试Cloudflare官方API只读查询，连接失败（HttpRequestException，未得到HTTP响应），未验证凭证是否有效。浏览器访问搜索后台也超时，未读取后台数据。不能将网络失败称账号失效。
本地和历史材料研究已完成；当前后台部署状态与数据授权待实际连接。未发布、推送、改DNS、申请索引或发送表单。

## 官方规则核对

2026-09-16查阅：
- https://developers.cloudflare.com/pages/get-started/direct-upload/ ：上传预构建目录，分支控制环境；Git集成项目也可能使用Wrangler，所以历史命令不独自证明项目创建类型。
- https://developers.cloudflare.com/pages/configuration/rollbacks/ ：回退成功生产部署，预览不是生产回退目标。
- https://developers.google.com/webmaster-tools/v1/how-tos/authorizing ：私有GSC数据需要OAuth，优先webmasters.readonly；域名验证字符串不是数据访问令牌。
