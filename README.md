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

- 🔐 JWT 用户认证
- 📝 多类型内容发布（Snippet/Article/Moment）
- 🏷️ 标签分类与筛选
- 🔍 关键词搜索
- 📤 图片上传
- 📄 分页加载
- 💻 代码语法高亮
- 📱 响应式设计

---

## 文档

- [后端文档](server/README.md) - API 接口、数据库设计、配置说明
- [前端文档](client/README.md) - 组件结构、路由配置、开发指南

---

## 许可证

[MIT](LICENSE)
