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

### 后端

```bash
cd server
./mvnw spring-boot:run
```

访问 [server/README.md](server/README.md) 查看详细文档

### 前端

```bash
cd client
npm install
npm run dev
```

访问 [client/README.md](client/README.md) 查看详细文档

## 功能特性

### 核心功能
- 🔐 **用户认证** - JWT 登录注册，权限控制
- 📝 **多类型内容发布** - Snippet（代码片段）/ Article（文章）/ Moment（动态）
- 🏷️ **标签系统** - 话题分类，按标签筛选内容
- 🔍 **关键词搜索** - 实时搜索帖子标题和内容
- 📄 **分页加载** - 高效的数据加载和翻页

### 社交功能
- 💬 **评论系统** - 帖子评论，编辑/删除自己的评论
- 🔖 **书签收藏** - 收藏感兴趣的帖子，个人收藏列表
- 👥 **关注系统** - 关注用户，查看关注者/粉丝列表
- 👤 **用户主页** - 查看用户信息和发布的帖子

### 内容增强
- 📤 **图片上传** - 支持头像和封面图上传
- 💻 **代码高亮** - 代码片段语法高亮显示
- 📱 **响应式设计** - 移动端友好的界面

---

## 构建与部署

### 开发模式

前端和后端分别运行（热重载）：

```bash
# 后端 (端口 8080)
cd server && ./mvnw spring-boot:run

# 前端 (端口 3000，代理到后端)
cd client && npm run dev
```

### 生产部署

**1. 构建前端（使用相对路径）**
```bash
cd client
VITE_API_BASE_URL=/api VITE_STATIC_BASE_URL= npm run build
```

**2. 集成到后端**
```bash
# 复制前端构建产物到 Spring Boot static 目录
cp -r client/dist/* server/src/main/resources/static/
```

**3. 构建后端**
```bash
cd server
./mvnw clean package
```

**4. 运行**
```bash
java -jar target/synapse-0.0.1-SNAPSHOT.jar
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
