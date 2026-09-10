# 实施依据｜2026-09-10

## 本轮规格与版式
42款规格直接来自同日已取得的puerhdirect.com产品页，逐条URL/原始重量包装文字见imported-product-specs.json；未另抓库存或认定批次已核。采购指南借鉴已读https://puerhdirect.com/blog/kak-vybrat-postavshchika-puer的核验方向，自行重写，不继承身份、MOQ、运费和利润承诺。用户本轮明确授权实施上轮建议与自主版式优化；Gemini无可调用能力，本轮未使用。技术沿用本地已锁定Astro/Playwright和此前官方生命周期依据，无新框架/依赖。设计与验证见DESIGN_AND_SPECS_2026-09-10.md。

本轮现状以实际本地源码、原锁文件、构建和浏览器验证为准。

- Astro官方生命周期与ClientRouter脚本行为：https://docs.astro.build/en/guides/view-transitions/ （本轮读取；用于在astro:page-load重新绑定表单/菜单，避免重复监听）。
- npm官方ci与ignore-scripts：https://docs.npmjs.com/cli/v11/commands/npm-ci/ （本轮读取；沿用锁文件安装，关闭安装期脚本）。
- npm11.6.2取自https://registry.npmjs.org/npm/11.6.2，下载包经registry声明SHA512校验。旧站生产依赖版本未变。
- 浏览器验证使用Playwright1.62.1及本机Chrome；测试代码和产物是实际结果，不以官方文档代替验收。
- 经营文案依据用户D006/D007；免费样品活动参数、生产后台状态和真实询盘送达未核，不从历史助手结论推导。
