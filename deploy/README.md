# shareMall 生产部署指南

单台云服务器（ECS/CVM）+ Docker Compose + Nginx，适用于中国大陆小规模上线。

## 架构

```text
公网 :80/:443
    └── nginx（H5 / Admin 静态 + /api 反代）
            └── server（NestJS :3000）
                    ├── mysql:3306
                    └── redis:6379
```

- 用户 H5 域名建议：`m.yourdomain.com`
- 管理后台建议：`admin.yourdomain.com`（可加 IP 白名单）
- API 走同域 `/api`，无需前端改 CORS

## 一、云服务器准备

### 1. 购买 ECS/CVM

| 环境 | 推荐配置 |
| --- | --- |
| 测试 | 2 核 4G，40G SSD，Ubuntu 22.04 / Debian 12 |
| 生产 | 4 核 8G |

推荐厂商：阿里云 ECS、腾讯云 CVM（与后续 OSS/短信/支付同厂商）。

### 2. 安全组

仅开放：

- **22** — SSH（建议限制来源 IP）
- **80** — HTTP
- **443** — HTTPS（上线后）

不要对公网开放 3306（MySQL）、6379（Redis）。

### 3. 安装依赖

```bash
# 以 Ubuntu 为例
sudo apt update && sudo apt install -y git curl

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# 重新登录后生效

# Docker Compose（Docker 24+ 已内置 compose 插件）
docker compose version

# Node.js 22 + pnpm（用于构建前端静态资源）
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
corepack enable
corepack prepare pnpm@9.12.0 --activate
```

## 二、域名与 ICP 备案

1. 购买域名并在云厂商控制台提交 **ICP 备案**（通常 2–4 周）。
2. 备案通过后添加 DNS 解析：
   - `m.yourdomain.com` → ECS 公网 IP
   - `admin.yourdomain.com` → ECS 公网 IP
3. 备案完成前可用 IP 访问内测：临时修改 [nginx.conf](./nginx.conf) 中 `server_name` 为 `_` 或服务器 IP。

## 三、首次部署

### 1. 拉取代码

```bash
cd /opt
sudo git clone <你的仓库地址> shareMall
sudo chown -R $USER:$USER shareMall
cd shareMall
```

### 2. 配置生产环境变量

```bash
cp deploy/.env.production.example deploy/.env.production
```

编辑 `deploy/.env.production`，**至少修改**：

- `MYSQL_ROOT_PASSWORD` — 强密码
- `DB_PASSWORD` — 与上面一致（server 连接 MySQL）
- `JWT_SECRET` — 32 位以上随机字符串

生成随机密钥示例：

```bash
openssl rand -base64 48
```

### 3. 配置 Nginx 域名

编辑 [deploy/nginx.conf](./nginx.conf)：

- 将 `m.example.com` 改为你的 H5 域名
- 将 `admin.example.com` 改为你的管理后台域名
- （可选）取消 Admin `server` 块中 IP 白名单注释

### 4. 构建前端与共享包

```bash
pnpm install
pnpm build:shared
pnpm build:h5
pnpm build:admin
```

构建产物：

- `apps/h5/dist/`
- `apps/admin/dist/`

### 5. 启动服务

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml up -d --build
```

查看状态：

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml ps
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml logs -f server
```

健康检查：

```bash
curl http://127.0.0.1/api/health
# 需在本机 hosts 或已解析域名下访问 H5
```

### 6. 数据库迁移

首次启动时，`schema.sql` 会通过 MySQL 容器 `docker-entrypoint-initdb.d` 自动执行。

若数据库卷已存在、需补跑增量脚本，手动执行：

```bash
for f in apps/server/migrations/00*.sql apps/server/migrations/0*.sql; do
  [ -f "$f" ] && docker exec -i sharemall-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" sharemall < "$f"
done
```

（将 `$MYSQL_ROOT_PASSWORD` 换为实际密码，或从 `deploy/.env.production` 读取。）

## 四、HTTPS

备案与域名解析完成后：

### 方式 A：Certbot（Let's Encrypt）

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d m.yourdomain.com -d admin.yourdomain.com
```

将证书挂载到 nginx 容器，并在 `deploy/nginx.conf` 增加 `listen 443 ssl` 配置，同时在 [docker-compose.prod.yml](../docker-compose.prod.yml) 取消 443 端口与证书 volume 注释。

### 方式 B：云厂商免费 DV 证书

在阿里云/腾讯云申请证书，下载 Nginx 格式，放到 `deploy/certs/`，配置 `ssl_certificate` / `ssl_certificate_key`。

## 五、日常运维

### 更新部署

```bash
cd /opt/shareMall
git pull
pnpm install
pnpm build:shared && pnpm build:h5 && pnpm build:admin
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml up -d --build
```

仅更新后端：

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml up -d --build server
```

### 查看日志

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml logs -f nginx server
```

### MySQL 备份

```bash
docker exec sharemall-mysql mysqldump -uroot -p sharemall > backup-$(date +%F).sql
```

建议配置 cron 每日备份并上传对象存储。

### 停止服务

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yml down
```

保留数据卷；彻底删除数据加 `-v`（慎用）。

## 六、上线检查清单

- [ ] `deploy/.env.production` 已设置强密码与 `JWT_SECRET`
- [ ] 安全组仅开放 22/80/443
- [ ] Admin 域名已配置 IP 白名单或 VPN
- [ ] Swagger `/api/docs` 已对公网关闭（nginx 已 return 404）
- [ ] MySQL 定期备份
- [ ] HTTPS 已启用
- [ ] 短信/OSS/支付等外部密钥已按需填入环境变量

## 七、CI/CD（GitHub Actions 自动部署）

推送 `main` 分支后，GitHub Actions 会：在云端构建前端与 shared → SCP 上传到 ECS → SSH 执行 `docker compose up -d --build`。

Workflow 文件：[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

### 1. ECS 一次性准备

**（1）创建生产环境变量（必做，不会随 CI 上传）**

```bash
cd /opt/shareMall   # 按实际路径
cp deploy/.env.production.example deploy/.env.production
# 编辑并至少修改 MYSQL_ROOT_PASSWORD、DB_PASSWORD（两者一致）、JWT_SECRET
vi deploy/.env.production
```

若 MySQL 已在运行，密码需与现有一致：

```bash
docker exec sharemall-mysql printenv MYSQL_ROOT_PASSWORD
```

**（2）部署用户具备 Docker 权限**

```bash
sudo usermod -aG docker $USER
# 重新登录后 docker ps 应正常
```

**（3）生成 GitHub Actions 专用 SSH 密钥（本机执行）**

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/sharemall_deploy -N ""
ssh-copy-id -i ~/.ssh/sharemall_deploy.pub 你的用户@ECS公网IP
```

验证：

```bash
ssh -i ~/.ssh/sharemall_deploy 你的用户@ECS公网IP "cd /opt/shareMall && docker compose --env-file deploy/.env.production -f docker-compose.prod.yml ps"
```

**（4）安全组**

- 入方向开放 **22**（GitHub Actions 源 IP 不固定，内测通常需对 `0.0.0.0/0` 开放；生产建议改用 self-hosted runner 或堡垒机）
- **80** / **443** 保持开放

### 2. GitHub 仓库 Secrets

路径：**Settings → Secrets and variables → Actions → New repository secret**

| Secret | 说明 | 示例 |
| --- | --- | --- |
| `DEPLOY_HOST` | ECS 公网 IP 或域名 | `47.xxx.xxx.xxx` |
| `DEPLOY_USER` | SSH 用户名 | `root` |
| `DEPLOY_KEY` | 部署私钥**全文**（`~/.ssh/sharemall_deploy` 内容，含 BEGIN/END） | — |
| `DEPLOY_PATH` | 服务器项目根目录（无末尾 `/`） | `/opt/shareMall` |

另确认 **Settings → Actions → General** 已允许 Actions 运行。

### 3. 触发部署

| 方式 | 操作 |
| --- | --- |
| 自动 | 合并/推送到 `main` |
| 手动 | GitHub → Actions → **Deploy to ECS** → **Run workflow** |

成功后在 Actions 日志中应看到 SCP、SSH、`docker compose up -d --build` 均为绿色。

### 4. CI 会上传的内容

- 构建产物：`apps/h5/dist`、`apps/admin/dist`
- 后端源码与 Docker 构建：`apps/server`、`tsconfig.base.json`
- 编排与配置：`docker-compose.prod.yml`、`deploy/`（nginx 等）、`packages/`、根目录 lock/workspace 文件

**不会上传**：`deploy/.env.production`（含密钥，仅保留在 ECS 上）。

### 5. 数据库迁移

CI **不会**自动执行增量 SQL。若有新迁移文件（如 `008_xxx.sql`），部署后需在 ECS 手动执行，见上文「6. 数据库迁移」。

### 6. 常见问题

| 现象 | 处理 |
| --- | --- |
| `ls deploy/.env.production` 不存在 | 按本节步骤 1 在 ECS 上 `cp` 模板并编辑 |
| SSH 连接失败 | 检查安全组 22、公钥是否在 `~/.ssh/authorized_keys` |
| `docker compose` 权限 denied | 用户加入 `docker` 组并重新登录 |
| 仅前端更新、后端仍是旧版 | 确认 workflow 已包含 `apps/server` 与 `tsconfig.base.json`（当前版本已包含） |
| 部署后 API 报错缺表 | 手动补跑 `apps/server/migrations/` 下增量脚本 |

## 相关文件

| 文件 | 说明 |
| --- | --- |
| [docker-compose.prod.yml](../docker-compose.prod.yml) | 生产 Compose |
| [apps/server/Dockerfile](../apps/server/Dockerfile) | 后端镜像 |
| [deploy/nginx.conf](./nginx.conf) | Nginx 路由 |
| [deploy/.env.production.example](./.env.production.example) | 生产环境变量模板 |
