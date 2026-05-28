## ADDED Requirements

### Requirement: Cloudflare Pages Deployment
系统 SHALL 提供 Cloudflare Pages 部署配置。用户可通过 `npx wrangler pages deploy dist/` 命令将构建产物部署到 Cloudflare Pages，获得 HTTPS 外网访问地址。

#### Scenario: Deploy via wrangler CLI
- **WHEN** 执行 `npx wrangler pages deploy dist/ --project-name=excel-chart-visualizer` 命令
- **THEN** 构建产物被部署到 Cloudflare Pages，命令输出包含 HTTPS 外网访问 URL

#### Scenario: Build for production
- **WHEN** 执行 `npm run build`（或 `pnpm build`）
- **THEN** Vite 将项目构建为 `dist/` 目录下的静态文件，包含 index.html 和所有 JS/CSS 资源

### Requirement: SPA Routing Support
系统 SHALL 配置 Cloudflare Pages 的 SPA 路由回退，确保所有路径请求都返回 index.html。项目根目录 SHALL 包含 `public/_redirects` 文件。

#### Scenario: Handle client-side routing
- **WHEN** 用户直接访问非根路径的 URL
- **THEN** Cloudflare Pages 返回 index.html，由前端路由处理

### Requirement: Build Configuration
系统 SHALL 在 `package.json` 中提供 `build` 脚本用于生产构建，并确保构建产物为纯静态文件（无服务器端渲染依赖）。

#### Scenario: Verify build output
- **WHEN** 执行构建命令后检查 `dist/` 目录
- **THEN** 目录包含 `index.html` 入口文件和所有静态资源文件，无外部服务依赖
