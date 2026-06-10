# shareMall

移动端 H5 商城（贡献金 + 数字藏品 + 提现）Monorepo。

## 技术栈

- 用户端 H5：Vue3 + Vite + TypeScript + Vant + Pinia
- 管理后台：Vue3 + Vite + TypeScript + Element Plus
- 后端服务：NestJS（Node.js + TypeScript）
- 数据库与中间件：MySQL 8 + Redis
- 包管理：pnpm workspace（Monorepo）

详见 [docs/技术栈选型.md](docs/技术栈选型.md)。

## 目录结构

```text
shareMall/
├── apps/
│   ├── h5/        # 用户端 H5 (Vue3 + Vant)
│   ├── admin/     # 管理后台 (Vue3 + Element Plus)
│   └── server/    # 后端 (NestJS)
├── packages/
│   └── shared/    # 共享类型/常量/工具 (TS)
├── docs/          # 产品与技术文档
└── docker-compose.yml
```

## 环境要求

- Node.js >= 18（推荐 22，见 `.nvmrc`）。注意：Vite 5 在 Node 16 下会报 `crypto.getRandomValues is not a function`，请勿使用 Node 16。
- pnpm >= 9（可用 `corepack enable` 启用）。

## 快速开始

```bash
# 切换 Node 版本（若使用 nvm）
nvm use

# 安装依赖（需 pnpm >= 9）
pnpm install

# 启动后端
pnpm dev:server

# 启动用户端 H5
pnpm dev:h5

# 启动管理后台
pnpm dev:admin
```

## 文档

- **开发进度（任务完成情况）**：[docs/开发进度.md](docs/开发进度.md)
- 产品页面：[docs/产品页面清单与功能拆解.md](docs/产品页面清单与功能拆解.md)
- 后台页面：[docs/后台管理端页面清单与功能拆解.md](docs/后台管理端页面清单与功能拆解.md)
- 路由排期：[docs/页面路由表与开发排期.md](docs/页面路由表与开发排期.md)
- 数据模型与接口：[docs/数据模型与接口字段清单.md](docs/数据模型与接口字段清单.md)
- 数据库 DDL：[docs/数据库DDL.md](docs/数据库DDL.md) / [server/migrations/schema.sql](apps/server/migrations/schema.sql)
- 接口规范：[docs/OpenAPI接口规范.md](docs/OpenAPI接口规范.md) / [docs/openapi.yaml](docs/openapi.yaml)
- 技术栈：[docs/技术栈选型.md](docs/技术栈选型.md)
