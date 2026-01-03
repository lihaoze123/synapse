<div align="center">

# Synapse

### 突触 · 基于话题的内容聚合平台

**Reddit 风格话题 + Gist 风格代码 + Blog 风格文章 + Twitter 风格动态**

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[![Docker](https://img.shields.io/badge/docker-supported-2496ED?style=flat-square&logo=docker)]()
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)]()
[![Redis](https://img.shields.io/badge/Redis-cache-DC382D?style=flat-square&logo=redis)]()
[![JWT](https://img.shields.io/badge/JWT-auth-FF6B6B?style=flat-square)]()

</div>

---

## 项目简介

**Synapse** 是一个全栈内容聚合平台，支持多种内容类型通过话题标签有机连接。

<details>
<summary><b>支持的内容类型</b></summary>

| 类型 | 描述 | 特性 |
|:----:|:-----|:-----|
| **Snippet** | Gist 风格代码片段 | 语法高亮 · 一键复制 · 语言标签 |
| **Article** | Markdown 长文文章 | 封面图 · 摘要 · 富文本渲染 |
| **Moment** | Twitter 风格动态 | 简洁 · 实时 · 快速分享 |

</details>

<details>
<summary><b>话题聚合系统</b></summary>

所有内容通过 **标签** 进行分类和筛选，类似 Reddit 的 subreddit 机制，但更灵活。

</details>

---

## 快速开始

### Docker（推荐）

一键启动应用和数据库：

```bash
docker compose --profile demo up --build
```

访问 **http://localhost:8080**

<details>
<summary><b>更多 Docker 选项</b></summary>

```bash
# 后台运行
docker compose --profile demo up -d --build

# 停止并删除数据
docker compose --profile demo down -v

# 生产模式（使用外部数据库）
cp .env.example .env
vim .env  # 配置数据库和密钥
docker compose up -d --build
```

</details>

### 本地开发

<details open>
<summary><b>后端服务器</b></summary>

```bash
cd server
./mvnw spring-boot:run
```

| 端口 | 服务 |
|:----:|:-----|
| 8080 | Spring Boot API |

</details>

<details>
<summary><b>前端开发服务器</b></summary>

```bash
cd client
bun install
bun run dev
```

| 端口 | 服务 |
|:----:|:-----|
| 3000 | Vite Dev Server (代理到 8080) |

</details>

详细文档：[后端](server/README.md) · [前端](client/README.md)

---

## 功能特性

### 核心功能

| 功能 | 描述 |
|:----|:-----|
| **用户认证** | JWT 登录注册，基于 Token 的无状态认证 |
| **多类型发布** | Snippet / Article / Moment 三种内容类型 |
| **标签系统** | 话题分类，按标签筛选内容流 |
| **实时搜索** | 防抖搜索，支持标题和内容检索 |
| **智能分页** | 高效的数据加载和无限滚动 |

### 社交功能

| 功能 | 描述 |
|:----|:-----|
| **评论系统** | 嵌套评论，编辑/删除自己的内容 |
| **点赞互动** | 帖子和评论点赞，实时计数 |
| **书签收藏** | 个人收藏夹，稍后阅读 |
| **关注网络** | 关注用户，查看粉丝/关注列表 |
| **用户主页** | 公开资料，个人作品展示 |
| **消息通知** | 实时通知，支持点赞、评论、关注、提及 |

### 内容增强

| 功能 | 描述 |
|:----|:-----|
| **图片上传** | 头像和封面图，UUID 命名防冲突 |
| **代码高亮** | 基于 CodeMirror 的语法高亮，支持 20+ 语言 |
| **响应式设计** | 移动端优先，自适应布局 |
| **草稿自动保存** | 编辑器自动保存草稿，防止丢失内容 |
| **暗色模式** | 支持亮色/暗色/跟随系统三种主题 |
| **私密帖子** | 支持密码保护的私密内容 |
| **Redis 缓存** | 可选缓存层，提升响应速度（Demo 模式） |

---

## 构建与部署

### Docker 部署（推荐）

<details open>
<summary><b>演示环境（包含 MySQL）</b></summary>

```bash
# 一键启动
docker compose --profile demo up --build

# 后台运行
docker compose --profile demo up -d --build

# 停止并删除数据
docker compose --profile demo down -v
```

</details>

<details>
<summary><b>生产环境（使用外部数据库）</b></summary>

```bash
# 1. 创建数据库
# MySQL
CREATE DATABASE synapse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# PostgreSQL
CREATE DATABASE synapse ENCODING 'UTF8';

# 2. 配置环境变量
cp .env.example .env
vim .env  # 修改 DB_URL, DB_USERNAME, DB_PASSWORD

# 3. 启动（不启动 demo profile 的 MySQL）
docker compose up -d --build
```

</details>

### 数据备份

<details>
<summary><b>数据库备份</b></summary>

```bash
# 导出数据库
docker exec synapse-mysql mysqldump -uroot -psynapse123 synapse > backup-$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i synapse-mysql mysql -uroot -psynapse123 synapse < backup-20250101.sql
```

</details>

<details>
<summary><b>上传文件备份</b></summary>

```bash
# 查看数据卷位置
docker volume inspect java-teamwork_uploads_data

# 备份到 tar 文件
docker run --rm -v java-teamwork_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /data .

# 恢复
docker run --rm -v java-teamwork_uploads_data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup-20250101.tar.gz -C /data
```

</details>

<details>
<summary><b>完整备份脚本</b></summary>

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"
mkdir -p "$BACKUP_DIR"

# 备份数据库
docker exec synapse-mysql mysqldump -uroot -psynapse123 synapse > "$BACKUP_DIR/database.sql"

# 备份上传文件
docker run --rm -v java-teamwork_uploads_data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/uploads.tar.gz -C /data .

echo "Backup completed: $BACKUP_DIR"
```

</details>

### 生产数据库选项

| 方案 | 适用场景 | 说明 |
|:-----|:---------|:-----|
| **云托管数据库** | 生产环境 | AWS RDS、Google Cloud SQL、阿里云 RDS |
| **单独 MySQL 实例** | 小型生产 | 独立服务器或 VPS 上的 MySQL |
| **PostgreSQL** | 复杂查询需求 | 性能优于 MySQL，需添加驱动依赖 |

<details>
<summary><b>添加 PostgreSQL 支持</b></summary>

在 `server/pom.xml` 中添加：

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
```

</details>

### 使用预构建镜像

推荐直接从 GitHub Container Registry 拉取预构建镜像，无需本地构建：

```bash
# 拉取最新版本镜像
docker pull ghcr.io/<org>/<repo>:latest

# 拉取指定版本镜像
docker pull ghcr.io/<org>/<repo>:v1.0.0

# 运行容器
docker run -d -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host:3306/synapse \
  -e SPRING_DATASOURCE_USERNAME=user \
  -e SPRING_DATASOURCE_PASSWORD=pass \
  ghcr.io/<org>/<repo>:latest
```

<details>
<summary><b>可用镜像标签</b></summary>

| 标签格式 | 说明 | 示例 |
|:--------|:-----|:-----|
| `latest` | 最新稳定版（仅 main 分支） | `ghcr.io/<org>/<repo>:latest` |
| `v1.0.0` | 语义化版本号（Release 时） | `ghcr.io/<org>/<repo>:v1.0.0` |
| `v1.0` | 主版本号 | `ghcr.io/<org>/<repo>:v1.0` |
| `v1` | 主版本号 | `ghcr.io/<org>/<repo>:v1` |
| `sha-abc123` | Git commit SHA | `ghcr.io/<org>/<repo>:sha-abc123` |

</details>

<details>
<summary><b>手动触发构建</b></summary>

在 GitHub Actions 页面手动触发 `Docker` workflow，可指定自定义标签：

1. 进入 Actions → Docker workflow
2. 点击 "Run workflow"
3. 输入标签名称（可选）

</details>

### 手动生产部署

<details>
<summary><b>逐步部署指南</b></summary>

**1. 创建数据库**
```sql
CREATE DATABASE synapse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**2. 设置环境变量**
```bash
export DB_URL="jdbc:mysql://localhost:3306/synapse?useSSL=true&serverTimezone=UTC"
export DB_USERNAME="your_username"
export DB_PASSWORD="your_password"
export JWT_SECRET="your-256-bit-secret-key"
```

**3. 构建前端**
```bash
cd client
VITE_API_BASE_URL=/api VITE_STATIC_BASE_URL= bun run build
```

**4. 集成到后端**
```bash
cp -r client/dist/* server/src/main/resources/static/
```

**5. 构建后端**
```bash
cd server
./mvnw clean package
```

**6. 运行**
```bash
java -jar target/synapse-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

</details>

> **注意**：Vite 环境变量（`VITE_*`）是构建时固定的，无法在 Java 运行时通过环境变量修改。如需更改 API 端点，需重新构建前端。

---

## 文档

| 文档 | 说明 |
|:-----|:-----|
| [后端文档](server/README.md) | API 接口、数据库设计、配置说明 |
| [前端文档](client/README.md) | 组件结构、路由配置、开发指南 |

---

## 许可证

[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

<div align="center">

**Synapse** · 突触 · 内容聚合平台

Built with React + Spring Boot

</div>
