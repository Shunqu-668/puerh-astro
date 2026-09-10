# 普洱茶网站：本机维护入口

本目录是当前开发源码，保留原 Git 历史。原始接收资料仍在业务的 inbox 下，不在原件上开发。

## 当前电脑
- 双击“启动网站预览.cmd”，保持窗口运行，访问 http://127.0.0.1:4321/ 。
- 双击“检查网站.cmd”，重新构建并检查页面与交互。检查结果与截图在 artifacts（不提交）。
- 本机及预发布域名上的表单不会向外发送；生产表单送达须另行验证。

## 标准 Node.js 环境 / 换电脑
使用 Node 24 LTS（本次验证24.19.0），或至少22.12。运行：

```sh
npm ci --ignore-scripts
npm run dev -- --host 127.0.0.1 --port 4321
npm run build
npm test
```

测试优先使用已安装的 Chrome/Edge；其他环境可设置 BROWSER_EXECUTABLE 或安装 Playwright Chromium。保持 package-lock.json 随源码转交；不要搬运 node_modules。

## 修改位置
- 首页：src/pages/index.astro；全站导航/页脚：src/components。
- 商品：src/data/products.ts、product-descriptions.json；图像：public/images/images。
- 询盘/样品：src/pages/contact.astro、sample.astro 与 src/scripts/inquiry.ts。
- 检查：scripts/verify-site.mjs（外部请求全模拟，不发真实询盘）。

## 发布前
当前分支 work/local-recovery。原始本地基线1d89443，历史网站基线0559b16。
部署为Cloudflare Pages，输出dist；当前生产提交需从后台核对。远程仓库已设置，但本次没有推送或部署。发布需明确授权并先记录生产对应与回退版本。
现存上游监控和旧部署脚本不是日常预览入口；监控在Actions环境可能创建外部Issue。
历史CLAUDE/交接文档是资料；本业务最新决定与docs/LOCAL_HANDOFF.md优先。不得把.env、会话、令牌或原始旧WordPress交接包加入仓库。
