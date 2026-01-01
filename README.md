# Synapse

<div align="center">

### Synapse - 基于话题的内容聚合平台

**Reddit 风格话题 + Gist 风格代码 + Blog 风格文章 + Twitter 风格动态**

[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 项目简介

Synapse 是一个 Java 课程设计项目，实现了一个多类型内容聚合平台。用户可以发布：

- **💻 代码片段 (Snippet)** - Gist 风格的代码分享，支持语法高亮
- **📰 文章 (Article)** - 支持 Markdown 的长文内容
- **💭 动态 (Moment)** - Twitter 风格的简短文字

所有内容都可以通过 **标签 (Tag)** 进行分类和聚合。

---

## 技术栈

| 层级 | 技术 |
|:-----|:-----|
| 前端 | React 19, Vite 7, Tailwind CSS 4, TanStack Router/Query |
| 后端 | Spring Boot 3.2, Spring Data JPA, MySQL/H2 |
| 认证 | JWT |
| 代码高亮 | Shiki |
| Markdown | react-markdown |

---

## 快速开始

### Docker（推荐）

一键启动应用和数据库：

```bash
docker compose --profile demo up --build
```

访问 http://localhost:8080

### 本地开发

**后端**
```bash
cd server
./mvnw spring-boot:run
```

**前端**
```bash
cd client
bun install
bun run dev
```

访问 [server/README.md](server/README.md) 和 [client/README.md](client/README.md) 查看详细文档

## 功能特性

### 核心功能
- 🔐 **用户认证** - JWT 登录注册，权限控制
- 📝 **多类型内容发布** - Snippet（代码片段）/ Article（文章）/ Moment（动态）
- 🏷️ **标签系统** - 话题分类，按标签筛选内容
- 🔍 **关键词搜索** - 实时搜索帖子标题和内容
- 📄 **分页加载** - 高效的数据加载和翻页

### 社交功能
- 💬 **评论系统** - 帖子评论，编辑/删除自己的评论
- 👍 **点赞功能** - 给帖子和评论点赞，实时点赞计数
- 🔖 **书签收藏** - 收藏感兴趣的帖子，个人收藏列表
- 👥 **关注系统** - 关注用户，查看关注者/粉丝列表
- 👤 **用户主页** - 查看用户信息和发布的帖子

### 内容增强
- 📤 **图片上传** - 支持头像和封面图上传
- 💻 **代码高亮** - 代码片段语法高亮显示
- 📱 **响应式设计** - 移动端友好的界面

---

## 构建与部署

### Docker 部署（推荐）

**演示环境**（包含 MySQL）

```bash
# 一键启动
docker compose --profile demo up --build

# 后台运行
docker compose --profile demo up -d --build

# 停止并删除数据
docker compose --profile demo down -v
```

**生产环境**（使用外部数据库）

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置数据库和密钥
vim .env

# 启动
docker compose up -d --build
```

### 数据备份

**备份数据库**

```bash
# 导出数据库到 SQL 文件
docker exec synapse-mysql mysqldump -uroot -psynapse123 synapse > backup-$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i synapse-mysql mysql -uroot -psynapse123 synapse < backup-20250101.sql
```

**备份上传文件**

```bash
# 查看 uploads 数据卷位置
docker volume inspect java-teamwork_uploads_data

# 备份到 tar 文件
docker run --rm -v java-teamwork_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /data .

# 恢复
docker run --rm -v java-teamwork_uploads_data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup-20250101.tar.gz -C /data
```

**完整备份脚本**

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

### 生产数据库选项

**推荐方案**

| 方案 | 适用场景 | 说明 |
|-----|---------|------|
| 云托管数据库 | 生产环境 | AWS RDS、Google Cloud SQL、阿里云 RDS，自动备份、高可用 |
| 单独 MySQL 实例 | 小型生产 | 独立服务器或 VPS 上的 MySQL |
| PostgreSQL | 需要更复杂查询 | 性能优于 MySQL，需添加 PostgreSQL 驱动 |

**使用外部数据库步骤**

```bash
# 1. 创建数据库
# MySQL
CREATE DATABASE synapse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# PostgreSQL
CREATE DATABASE synapse ENCODING 'UTF8';

# 2. 复制并编辑 .env 文件
cp .env.example .env
vim .env  # 修改 DB_URL, DB_USERNAME, DB_PASSWORD

# 3. 启动（不启动 demo profile 的 MySQL）
docker compose up -d --build
```

**添加 PostgreSQL 支持**（可选）

在 `server/pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
```

### 本地开发（不使用 Docker）

前端和后端分别运行（热重载）：

```bash
# 后端 (端口 8080)
cd server && ./mvnw spring-boot:run

# 前端 (端口 3000，代理到后端)
cd client && bun run dev
```

### 手动生产部署

**1. 创建 MySQL 数据库**
```sql
CREATE DATABASE synapse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**2. 设置环境变量**
```bash
# MySQL 配置
export DB_URL="jdbc:mysql://localhost:3306/synapse?useSSL=true&serverTimezone=UTC"
export DB_USERNAME="your_username"
export DB_PASSWORD="your_password"

# JWT 密钥
export JWT_SECRET="your-256-bit-secret-key"
```

**3. 构建前端（使用相对路径）**
```bash
cd client
VITE_API_BASE_URL=/api VITE_STATIC_BASE_URL= npm run build
```

**4. 集成到后端**
```bash
# 复制前端构建产物到 Spring Boot static 目录
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

访问 `http://localhost:8080`，前端和 API 都在同一端口下。

**注意**：Vite 环境变量（`VITE_*`）是构建时固定的，无法在 Java 运行时通过环境变量修改。如需更改 API 端点，需重新构建前端。

---

## 文档

- [后端文档](server/README.md) - API 接口、数据库设计、配置说明
- [前端文档](client/README.md) - 组件结构、路由配置、开发指南

---

## 许可证

[MIT](LICENSE)
