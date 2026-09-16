# 实施依据｜2026-09-10

## D027图片处理｜2026-09-16
- 本项目原始商品照片及research/product-gallery-20260916.json的158张源指纹；未用生成图片替换。
- Astro官方Integration API：https://docs.astro.build/en/reference/integrations-reference/ ，确认astro:config:setup在Vite编译前运行，可在此生成可重建图片资源。

## D025补充｜2026-09-14
- 主体关系：用户明确.com与新版同公司、共有仓储供货团队；上级DECISIONS D025为事实源。
- 42茶款俄文特色：旧product-descriptions.json全部阅读（中文40条+2条俄英）；35厂家/40口感，缺失不编造，src/data/tea-profiles.ts记录整理依据；公开长营销描述不再渲染，原始文件保留。
- 图片尺寸：当前sharp依赖本地metadata能力；不新增依赖、改原图或把既有WebP体积优势冒充本轮压缩成果。
- 浏览器故障：2026-09-14实际读取 https://learn.chatgpt.com/docs/browser 、https://learn.chatgpt.com/docs/chrome-extension 、https://learn.chatgpt.com/docs/reference/troubleshooting 。连接重置仍失败；未按一般指引新建替代任务、改安全权限或发外部反馈。

本轮现状以实际本地源码、原锁文件、构建和浏览器验证为准。

- Astro官方生命周期与ClientRouter脚本行为：https://docs.astro.build/en/guides/view-transitions/ （本轮读取；用于在astro:page-load重新绑定表单/菜单，避免重复监听）。
- npm官方ci与ignore-scripts：https://docs.npmjs.com/cli/v11/commands/npm-ci/ （本轮读取；沿用锁文件安装，关闭安装期脚本）。
- npm11.6.2取自https://registry.npmjs.org/npm/11.6.2，下载包经registry声明SHA512校验。旧站生产依赖版本未变。
- 浏览器验证使用Playwright1.62.1及本机Chrome；测试代码和产物是实际结果，不以官方文档代替验收。
- 经营文案依据用户D006/D007；免费样品活动参数、生产后台状态和真实询盘送达未核，不从历史助手结论推导。

## 2026-09-16 商品细节照片
同公司https://puerhdirect.com 当前42款公开商品页，158张额外实拍照片。逐项来源、SHA256、尺寸见../../research/product-gallery-20260916.json；获取脚本同目录sync-product-gallery-20260916.py。用于本地商品图库，无第三方生成图。

2026-09-16实际浏览原站/about与/private-label：勐海/永德资源、芳村门店仓库、压制/包装与8g/50g/100g示例。用户已确认同公司共享资源；本轮复用既有service-pressing、shape图片并明确方案。不照搬20kg门槛与图文不符的200g茶砖示例。
