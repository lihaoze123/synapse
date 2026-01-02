<div align="center">

# 🔌 Synapse Backend

### 🚀 Spring Boot 后端服务 | RESTful API | JWT 认证

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**Synapse (突触)** - 一个基于话题的内容聚合平台后端服务

</div>

---

## 📖 项目简介

Synapse 后端基于 **Spring Boot** 构建，提供完整的 RESTful API 支持，融合了 Reddit 风格的话题系统、Gist 风格的代码片段、Blog 风格的文章和 Twitter 风格的动态。

### ✨ 核心特性

- 🔐 **JWT 认证** - 无状态 Token 认证机制
- 📝 **多态内容** - 支持 SNIPPET / ARTICLE / MOMENT 三种帖子类型
- 🏷️ **标签系统** - 灵活的话题分类和聚合
- 👍 **点赞功能** - 帖子和评论点赞
- 💬 **评论系统** - 帖子评论，支持编辑/删除
- 🔖 **书签收藏** - 收藏帖子功能
- 👥 **关注系统** - 用户关注/粉丝
- 🔔 **消息通知** - 点赞、评论、关注、提及通知
- 🔐 **私密帖子** - 支持密码保护的私密内容
- 📤 **文件上传** - 本地存储，UUID 命名
- 🔍 **全文搜索** - 支持关键词搜索和类型筛选
- 📄 **分页查询** - 高效的数据分页加载

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|:---:|:---:|:---|
| ![Java](https://img.shields.io/badge/Java-17-orange?style=flat) | 17 | 编程语言 |
| ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen?style=flat) | 3.2.1 | Web 框架 |
| ![Spring Data JPA](https://img.shields.io/badge/Spring%20Data%20JPA-3.2.1-brightgreen?style=flat) | 3.2.1 | ORM 框架 |
| ![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat) | 8.0+ | 生产数据库 |
| ![H2](https://img.shields.io/badge/H2-2.2.224-blue?style=flat) | 2.2.224 | 开发数据库 |
| ![JWT](https://img.shields.io/badge/JJWT-0.12.3-red?style=flat) | 0.12.3 | JWT 库 |
| ![Lombok](https://img.shields.io/badge/Lombok-1.18.30-red?style=flat) | 1.18.30 | 简化代码 |
| ![Maven](https://img.shields.io/badge/Maven-3.9-red?style=flat) | 3.9+ | 构建工具 |
| ![Checkstyle](https://img.shields.io/badge/Checkstyle-3.3.1-green?style=flat) | 3.3.1 | 代码规范 |

---

## 📁 项目结构

```
com.synapse/
├── 📂 config/                 # ⚙️ 配置类
│   ├── CorsConfig.java       # 🌐 CORS 跨域配置
│   ├── JwtConfig.java        # 🔑 JWT 配置
│   └── StaticResourceConfig.java  # 📁 静态资源配置
│
├── 📂 controller/             # 🎮 控制器层
│   ├── AuthController.java   # 🔐 认证接口
│   ├── PostController.java   # 📝 帖子接口
│   ├── CommentController.java    # 💬 评论接口
│   ├── LikeController.java    # 👍 帖子点赞接口
│   ├── CommentLikeController.java    # 👍 评论点赞接口
│   ├── BookmarkController.java    # 🔖 书签接口
│   ├── FollowController.java    # 👥 关注接口
│   ├── TagController.java    # 🏷️ 标签接口
│   ├── UserController.java   # 👤 用户接口
│   ├── FileController.java   # 📤 文件上传接口
│   └── NotificationController.java  # 🔔 通知接口
│
├── 📂 dto/                    # 📦 数据传输对象
│   ├── request/              # ← 请求 DTO
│   └── response/             # → 响应 DTO
│
├── 📂 entity/                 # 🗄️ JPA 实体
│   ├── User.java             # 👤 用户实体
│   ├── Post.java             # 📄 帖子实体
│   ├── Comment.java          # 💬 评论实体
│   ├── CommentLike.java      # 👍 评论点赞实体
│   ├── Like.java             # 👍 帖子点赞实体
│   ├── Bookmark.java         # 🔖 书签实体
│   ├── Follow.java           # 👥 关注实体
│   ├── Tag.java              # 🏷️ 标签实体
│   ├── Notification.java     # 🔔 通知实体
│   ├── NotificationType.java # 📋 通知类型枚举
│   └── PostType.java         # 📋 帖子类型枚举
│
├── 📂 repository/             # 💾 数据访问层
│   ├── UserRepository.java
│   ├── PostRepository.java
│   └── TagRepository.java
│
├── 📂 service/                # 🧠 业务逻辑层
│   ├── AuthService.java
│   ├── PostService.java
│   ├── TagService.java
│   ├── UserService.java
│   ├── NotificationService.java
│   ├── CommentService.java
│   ├── FollowService.java
│   └── LikeService.java
│
└── 📂 util/                   # 🔧 工具类
    ├── FileUtil.java         # 📤 文件上传工具
    └── JwtUtil.java          # 🔑 JWT 工具
```

---

## 🗄️ 数据库设计

### ER 图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │──────<│    Post     │>──────│    Tag      │
│  (用户表)    │   1:N │  (帖子表)    │  N:N  │  (标签表)    │
└─────────────┘       └─────────────┘       └─────────────┘
                            │
                            │ N:M
                            ▼
                     ┌─────────────┐
                     │  Post_Tags  │
                     │  (关联表)    │
                     └─────────────┘
```

### 表结构详情

<details>
<summary><b>👤 users - 用户表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| id | BIGINT | PK | 主键（自增） |
| username | VARCHAR(50) | UNIQUE | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码 |
| avatar_url | VARCHAR(500) | | 头像 URL |

</details>

<details>
<summary><b>📄 posts - 帖子表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| id | BIGINT | PK | 主键（自增） |
| type | ENUM | NOT NULL | SNIPPET/ARTICLE/MOMENT |
| title | VARCHAR(200) | | 标题（MOMENT 可为空） |
| content | TEXT | NOT NULL | 内容（Markdown 或代码） |
| language | VARCHAR(50) | | 代码语言（仅 SNIPPET） |
| summary | VARCHAR(500) | | 摘要（自动生成） |
| cover_image | VARCHAR(500) | | 封面图 URL |
| is_private | BOOLEAN | DEFAULT false | 是否为私密帖子 |
| password | VARCHAR(255) | | 密码（私密帖子） |
| user_id | BIGINT | FK | 作者 ID |
| created_at | DATETIME | | 创建时间（自动） |

</details>

<details>
<summary><b>🏷️ tags - 标签表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| id | BIGINT | PK | 主键（自增） |
| name | VARCHAR(50) | UNIQUE | 标签名 |
| icon | VARCHAR(100) | | 图标（可选） |

</details>

<details>
<summary><b>🔗 post_tags - 帖子标签关联表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| post_id | BIGINT | FK | 帖子 ID |
| tag_id | BIGINT | FK | 标签 ID |

</details>

<details>
<summary><b>💬 comments - 评论表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| id | BIGINT | PK | 主键（自增） |
| post_id | BIGINT | FK | 帖子 ID |
| user_id | BIGINT | FK | 评论者 ID |
| content | TEXT | NOT NULL | 评论内容 |
| created_at | DATETIME | | 创建时间 |
| updated_at | DATETIME | | 更新时间 |

</details>

<details>
<summary><b>👍 likes - 帖子点赞表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| id | BIGINT | PK | 主键（自增） |
| user_id | BIGINT | FK | 用户 ID |
| post_id | BIGINT | FK | 帖子 ID |
| created_at | DATETIME | | 创建时间 |

**唯一约束**: (user_id, post_id)

</details>

<details>
<summary><b>👍 comment_likes - 评论点赞表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| id | BIGINT | PK | 主键（自增） |
| user_id | BIGINT | FK | 用户 ID |
| comment_id | BIGINT | FK | 评论 ID |
| created_at | DATETIME | | 创建时间 |

**唯一约束**: (user_id, comment_id)

</details>

<details>
<summary><b>🔖 bookmarks - 书签表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| id | BIGINT | PK | 主键（自增） |
| user_id | BIGINT | FK | 用户 ID |
| post_id | BIGINT | FK | 帖子 ID |
| created_at | DATETIME | | 创建时间 |

**唯一约束**: (user_id, post_id)

</details>

<details>
<summary><b>👥 follows - 关注表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| follower_id | BIGINT | FK | 关注者 ID |
| following_id | BIGINT | FK | 被关注者 ID |
| created_at | DATETIME | | 创建时间 |

**唯一约束**: (follower_id, following_id)

</details>

<details>
<summary><b>🔔 notifications - 通知表</b></summary>

| 字段 | 类型 | 约束 | 说明 |
|:-----|:-----|:-----|:-----|
| id | BIGINT | PK | 主键（自增） |
| user_id | BIGINT | FK | 接收者 ID |
| actor_id | BIGINT | FK | 触发者 ID |
| type | ENUM | NOT NULL | LIKE/COMMENT/FOLLOW/MENTION |
| post_id | BIGINT | FK | 关联帖子 ID |
| comment_id | BIGINT | FK | 关联评论 ID |
| is_read | BOOLEAN | DEFAULT false | 是否已读 |
| created_at | DATETIME | | 创建时间 |

</details>

---

## 🔌 API 接口

<details open>
<summary><b>🔐 认证接口 /api/auth</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录，返回 JWT | ❌ |
| GET | `/api/auth/me` | 获取当前用户信息 | ✅ |

</details>

<details>
<summary><b>📝 帖子接口 /api/posts</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| GET | `/api/posts` | 获取帖子列表（支持 tag、type 筛选和分页） | ❌ |
| GET | `/api/posts/{id}` | 获取单个帖子详情 | ❌ |
| GET | `/api/posts/search` | 搜索帖子（支持 keyword、type 筛选） | ❌ |
| POST | `/api/posts` | 创建帖子 | ✅ |
| PUT | `/api/posts/{id}` | 更新帖子（仅作者） | ✅ |
| DELETE | `/api/posts/{id}` | 删除帖子（仅作者） | ✅ |
| POST | `/api/posts/{id}/verify-password` | 验证私密帖子密码 | ✅ |

**查询参数示例：**
```
GET /api/posts?tag=Java&type=SNIPPET&page=0&size=20
GET /api/posts/search?keyword=Spring&type=ARTICLE
```

</details>

<details>
<summary><b>💬 评论接口 /api/comments</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| GET | `/api/posts/{postId}/comments` | 获取帖子评论列表（分页） | ❌ |
| GET | `/api/comments/{id}` | 获取单条评论详情 | ❌ |
| POST | `/api/posts/{postId}/comments` | 发表评论 | ✅ |
| PUT | `/api/comments/{id}` | 更新评论（仅作者） | ✅ |
| DELETE | `/api/comments/{id}` | 删除评论（仅作者） | ✅ |

</details>

<details>
<summary><b>👍 点赞接口 /api/likes</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| POST | `/api/likes/posts/{postId}` | 点赞/取消点赞帖子 | ✅ |

**响应示例：**
```json
{
  "success": true,
  "message": "liked",
  "data": {
    "liked": true,
    "count": 42
  }
}
```

</details>

<details>
<summary><b>👍 评论点赞接口 /api/comment-likes</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| POST | `/api/comment-likes/{commentId}` | 点赞/取消点赞评论 | ✅ |

</details>

<details>
<summary><b>🔖 书签接口 /api/bookmarks</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| GET | `/api/bookmarks` | 获取书签列表（分页） | ✅ |
| GET | `/api/bookmarks/posts/{postId}` | 检查帖子是否已收藏 | ✅ |
| GET | `/api/bookmarks/posts/{postId}/count` | 获取帖子收藏数 | ❌ |
| POST | `/api/bookmarks/posts/{postId}` | 添加书签 | ✅ |
| DELETE | `/api/bookmarks/posts/{postId}` | 移除书签 | ✅ |

</details>

<details>
<summary><b>👥 关注接口 /api/follows</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| GET | `/api/follows/following` | 获取关注列表（分页） | ✅ |
| GET | `/api/follows/followers` | 获取粉丝列表（分页） | ✅ |
| GET | `/api/follows/check/{userId}` | 检查是否关注某用户 | ✅ |
| GET | `/api/follows/counts/{userId}` | 获取用户关注数/粉丝数 | ❌ |
| POST | `/api/follows/{userId}` | 关注用户 | ✅ |
| DELETE | `/api/follows/{userId}` | 取消关注 | ✅ |

</details>

<details>
<summary><b>🔔 通知接口 /api/notifications</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| GET | `/api/notifications` | 获取通知列表（分页） | ✅ |
| GET | `/api/notifications/unread-count` | 获取未读通知数量 | ✅ |
| POST | `/api/notifications/read/{id}` | 标记通知为已读 | ✅ |
| POST | `/api/notifications/read-all` | 标记所有通知为已读 | ✅ |

**通知类型：**
- `LIKE` - 点赞通知
- `COMMENT` - 评论通知
- `FOLLOW` - 关注通知
- `MENTION` - 提及通知

</details>

<details>
<summary><b>🏷️ 标签接口 /api/tags</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| GET | `/api/tags` | 获取热门标签（默认 10 个） | ❌ |
| GET | `/api/tags/all` | 获取所有标签 | ❌ |

</details>

<details>
<summary><b>👤 用户接口 /api/users</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| GET | `/api/users/{id}` | 获取用户信息 | ❌ |
| GET | `/api/users/username/{username}` | 通过用户名获取用户 | ❌ |
| GET | `/api/users/{id}/posts` | 获取用户的帖子列表（分页） | ❌ |
| PUT | `/api/users/profile` | 更新个人资料 | ✅ |

</details>

<details>
<summary><b>📤 文件上传 /api/upload</b></summary>

| 方法 | 路径 | 说明 | 认证 |
|:-----|:-----|:-----|:-----|
| POST | `/api/upload` | 上传图片（最大 10MB） | ✅ |

**响应示例：**
```json
{
  "url": "/uploads/550e8400-e29b-41d4-a716-446655440000.png"
}
```

</details>

---

## 🚀 快速开始

### 环境要求

> - **Java 17+**
> - **Maven 3.6+**
> - **MySQL 8.0+** (生产环境)

### 开发环境运行

```bash
# 克隆项目
git clone <repository-url>
cd server

# 运行应用（使用 H2 内存数据库）
./mvnw spring-boot:run
```

应用启动后访问：
- 🌐 API 地址: http://localhost:8080/api
- 🔧 H2 控制台: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:synapse`
  - 用户名: `sa`
  - 密码: (留空)

### 生产环境配置

#### 1. 创建 MySQL 数据库

```sql
CREATE DATABASE synapse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. 配置环境变量（推荐）

编辑 `src/main/resources/application-prod.properties` 或通过环境变量传入：

```bash
# MySQL 数据库配置
export DB_URL="jdbc:mysql://localhost:3306/synapse?useSSL=true&serverTimezone=UTC"
export DB_USERNAME="your_username"
export DB_PASSWORD="your_password"

# JWT 密钥（必须修改）
export JWT_SECRET="your-256-bit-secret-key-change-in-production"

# CORS 允许的前端地址
export CORS_ALLOWED_ORIGINS="https://your-domain.com"
```

#### 3. 运行方式

**方式一：Maven 运行（开发测试）**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

**方式二：JAR 运行（生产环境）**
```bash
./mvnw clean package
java -jar target/synapse-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**方式三：直接传入参数**
```bash
java -jar target/synapse-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:mysql://host:3306/synapse \
  --spring.datasource.username=user \
  --spring.datasource.password=pass \
  --jwt.secret=your-secret-key
```

#### Profile 说明

| Profile | 数据库 | SQL 日志 | DDL 模式 | H2 控制台 | 数据初始化 |
|:-------|:-------|:--------|:--------|:--------|:---------|
| `dev` (默认) | H2 内存 | ✅ 开启 | update | ✅ 启用 | ✅ 加载测试数据 |
| `prod` | MySQL | ❌ 关闭 | validate | ❌ 禁用 | ❌ 不加载 |

---

## 📜 常用命令

```bash
# 清理构建
./mvnw clean

# 打包
./mvnw package

# 运行测试
./mvnw test

# 代码规范检查
./mvnw checkstyle:check

# 跳过测试打包
./mvnw package -DskipTests
```

---

## ⚙️ 配置说明

### JWT 配置

| 配置项 | 值 |
|:-------|:-----|
| 密钥长度 | 256-bit |
| 过期时间 | 24 小时 |
| Header 格式 | `Authorization: Bearer <token>` |

### 文件上传配置

| 配置项 | 值 |
|:-------|:-----|
| 存储位置 | `./uploads/` (项目根目录) |
| 访问路径 | `http://localhost:8080/uploads/{uuid}.png` |
| 文件命名 | UUID 自动生成 |
| 大小限制 | 10MB |

### CORS 配置

| 配置项 | 值 |
|:-------|:-----|
| 允许的源 | `http://localhost:3000` |
| 允许的方法 | `*` (所有) |
| 允许的 Headers | `*` (所有) |
| 凭据支持 | ✅ |

---

## 📋 帖子类型说明

| 类型 | 图标 | 说明 | 特点 |
|:-----|:-----|:-----|:-----|
| **SNIPPET** | 💻 | 代码片段 | 指定编程语言，语法高亮 |
| **ARTICLE** | 📰 | 文章 | 支持 Markdown，可有封面图 |
| **MOMENT** | 💭 | 动态 | 简短文字，无标题 |

---

## ⚠️ 开发注意事项

> [!WARNING]
> 1. **密码安全**: 当前密码为明文存储（MVP 演示），生产环境应使用 BCrypt 加密
> 2. **密钥配置**: JWT 密钥应使用环境变量配置，不应硬编码
> 3. **文件存储**: 当前为本地存储，生产环境建议使用 OSS（如阿里云 OSS、MinIO）

---

## 📄 许可证

[MIT](LICENSE)
