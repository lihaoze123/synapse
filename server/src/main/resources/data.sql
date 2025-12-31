-- ============================================
-- Synapse Mock Data
-- ============================================

-- Tags (话题标签)
INSERT INTO tags (name, icon) VALUES ('Java', '☕');
INSERT INTO tags (name, icon) VALUES ('Python', '🐍');
INSERT INTO tags (name, icon) VALUES ('JavaScript', '📜');
INSERT INTO tags (name, icon) VALUES ('React', '⚛️');
INSERT INTO tags (name, icon) VALUES ('Spring Boot', '🍃');
INSERT INTO tags (name, icon) VALUES ('算法', '🧮');
INSERT INTO tags (name, icon) VALUES ('数据库', '🗄️');
INSERT INTO tags (name, icon) VALUES ('前端', '🎨');

-- Users (测试用户) - 使用 DiceBear API 生成 Notion 风格头像
INSERT INTO users (username, password, avatar_url) VALUES ('admin', 'admin123', 'https://api.dicebear.com/7.x/notionists/svg?seed=Admin');
INSERT INTO users (username, password, avatar_url) VALUES ('alice', 'alice123', 'https://api.dicebear.com/7.x/notionists/svg?seed=Alice');
INSERT INTO users (username, password, avatar_url) VALUES ('bob', 'bob123', 'https://api.dicebear.com/7.x/notionists/svg?seed=Bob');
INSERT INTO users (username, password, avatar_url) VALUES ('charlie', 'charlie123', 'https://api.dicebear.com/7.x/notionists/svg?seed=Charlie');

-- Posts (文章/代码片段/动态)

-- Code Snippet 1: QuickSort
INSERT INTO posts (type, title, content, language, summary, user_id) VALUES
('SNIPPET', '快速排序实现', 'public class QuickSort {
    public static void sort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            sort(arr, low, pi - 1);
            sort(arr, pi + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
}', 'java', '经典的快速排序算法实现', 1);

-- Code Snippet 2: Python Decorator
INSERT INTO posts (type, title, content, language, summary, user_id) VALUES
('SNIPPET', 'Python 装饰器示例', 'def timer(func):
    """计时装饰器"""
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f} seconds")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(1)
    return "Done"', 'python', 'Python 装饰器示例', 2);

-- Code Snippet 3: React Counter
INSERT INTO posts (type, title, content, language, summary, user_id) VALUES
('SNIPPET', 'React Hooks 计数器', 'import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}', 'javascript', '使用 useState Hook 实现计数器', 3);

-- Article 1: Spring Boot Guide
INSERT INTO posts (type, title, content, summary, cover_image, user_id) VALUES
('ARTICLE', 'Spring Boot 入门指南', '# Spring Boot 入门指南

## 什么是 Spring Boot？

Spring Boot 是基于 Spring 框架的快速开发框架，它简化了 Spring 应用的配置和部署。

## 核心特性

1. 自动配置：根据项目依赖自动配置 Spring 应用
2. 内嵌服务器：无需部署 WAR 文件
3. 起步依赖：简化 Maven/Gradle 配置

## 快速开始

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```', 'Spring Boot 快速入门教程', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop', 1);

-- Article 2: JS Async
INSERT INTO posts (type, title, content, summary, cover_image, user_id) VALUES
('ARTICLE', 'JavaScript 异步编程详解', '# JavaScript 异步编程

## Promise

Promise 提供了链式调用，更优雅地处理异步。

```javascript
getData()
    .then(a => getMoreData(a))
    .then(b => getMoreData(b))
    .catch(err => console.error(err));
```

## async/await

ES2017 引入的语法糖，让异步代码看起来像同步代码。

```javascript
async function fetchData() {
    try {
        const a = await getData();
        const b = await getMoreData(a);
        return b;
    } catch (err) {
        console.error(err);
    }
}
```', '深入理解 JS 异步编程', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop', 2);

-- Moment 1
INSERT INTO posts (type, content, user_id) VALUES
('MOMENT', '今天开始学习 Spring Boot，感觉自动配置真的太方便了！', 3);

-- Moment 2
INSERT INTO posts (type, content, user_id) VALUES
('MOMENT', '解决了一个困扰两天的 bug！原来是 NPE，加了个 null check 就好了。', 4);

-- Moment 3
INSERT INTO posts (type, content, user_id) VALUES
('MOMENT', 'React 19 的新特性太棒了！Server Components 真的能提升不少性能。', 1);

-- Moment 4
INSERT INTO posts (type, content, user_id) VALUES
('MOMENT', '有人用过 H2 数据库吗？内存模式下数据重启就没了，适合开发测试用。', 2);

-- Post_Tags (文章-标签关联)
INSERT INTO post_tags (post_id, tag_id) VALUES (1, 1);  -- QuickSort - Java
INSERT INTO post_tags (post_id, tag_id) VALUES (1, 6);  -- QuickSort - 算法
INSERT INTO post_tags (post_id, tag_id) VALUES (2, 2);  -- Python - Python
INSERT INTO post_tags (post_id, tag_id) VALUES (2, 6);  -- Python - 算法
INSERT INTO post_tags (post_id, tag_id) VALUES (3, 3);  -- React - JavaScript
INSERT INTO post_tags (post_id, tag_id) VALUES (3, 4);  -- React - React
INSERT INTO post_tags (post_id, tag_id) VALUES (4, 1);  -- Spring Guide - Java
INSERT INTO post_tags (post_id, tag_id) VALUES (4, 5);  -- Spring Guide - Spring Boot
INSERT INTO post_tags (post_id, tag_id) VALUES (5, 3);  -- JS Async - JavaScript
INSERT INTO post_tags (post_id, tag_id) VALUES (5, 4);  -- JS Async - React
INSERT INTO post_tags (post_id, tag_id) VALUES (6, 1);  -- Moment - Java
INSERT INTO post_tags (post_id, tag_id) VALUES (6, 5);  -- Moment - Spring Boot
INSERT INTO post_tags (post_id, tag_id) VALUES (7, 2);  -- Moment - Python
INSERT INTO post_tags (post_id, tag_id) VALUES (8, 4);  -- Moment - React
INSERT INTO post_tags (post_id, tag_id) VALUES (9, 7);  -- Moment - 数据库

-- ============================================
-- Comments Mock Data (针对 Post ID = 1: QuickSort)
-- ============================================

-- 一级评论 (parent_id = NULL)
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('这个实现很清晰！partition 函数的逻辑一目了然。', 2, 1, NULL, 1, TIMESTAMP '2024-01-01 10:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('建议在 sort 方法开头加上空数组检查。', 3, 1, NULL, 2, TIMESTAMP '2024-01-01 10:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@bob 好建议！已更新。', 1, 1, NULL, 3, TIMESTAMP '2024-01-01 10:10:00', TRUE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('为什么选择最右边的元素作为 pivot？这样对已排序数组性能会退化到 O(n²)。', 4, 1, NULL, 4, TIMESTAMP '2024-01-01 10:15:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@charlie 可以随机选择 pivot 或者用三数取中法优化。', 2, 1, NULL, 5, TIMESTAMP '2024-01-01 10:20:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('Python 装饰器那个也很赞！', 3, 1, NULL, 6, TIMESTAMP '2024-01-01 11:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('这个算法是面试必考题，收藏了。', 2, 1, NULL, 7, TIMESTAMP '2024-01-01 12:30:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('代码缩进用 4 个空格还是 tab？', 3, 1, NULL, 8, TIMESTAMP '2024-01-01 13:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('Google Java Style Guide 用 2 个空格，但这个项目用 4 个也没问题。', 4, 1, NULL, 9, TIMESTAMP '2024-01-01 13:05:00', TRUE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('楼上缩进警察哈哈哈', 1, 1, NULL, 10, TIMESTAMP '2024-01-01 13:10:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('有人试过用栈把递归改成迭代吗？', 2, 1, NULL, 11, TIMESTAMP '2024-01-01 14:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('写过，但可读性差了很多。', 3, 1, NULL, 12, TIMESTAMP '2024-01-01 14:15:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('这段代码的时间复杂度是 O(n log n) 吧？', 4, 1, NULL, 13, TIMESTAMP '2024-01-01 15:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('对的，平均 O(n log n)，最坏 O(n²)', 1, 1, NULL, 14, TIMESTAMP '2024-01-01 15:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('学到了！', 2, 1, NULL, 15, TIMESTAMP '2024-01-01 16:00:00', FALSE);

-- 二级回复 (parent_id 指向一级评论的 id，假设一级评论 id 为 1-15)
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('确实，比教科书上写的容易理解多了。', 3, 1, 1, 16, TIMESTAMP '2024-01-01 10:02:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('同意，加上 if (arr == null || arr.length == 0) return;', 1, 1, 2, 17, TIMESTAMP '2024-01-01 10:07:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('或者直接抛 IllegalArgumentException', 4, 1, 2, 18, TIMESTAMP '2024-01-01 10:08:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('随机选择 pivot 需要额外的随机数生成，三数取中更实用。', 1, 1, 4, 19, TIMESTAMP '2024-01-01 10:17:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('是的，很多库都用三数取中。', 3, 1, 4, 20, TIMESTAMP '2024-01-01 10:18:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('三数取中确实是个好方案！', 4, 1, 5, 21, TIMESTAMP '2024-01-01 10:22:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('确实，必考题，上次面试就问了。', 3, 1, 7, 22, TIMESTAMP '2024-01-01 12:35:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('Java 官方推荐用 4 个空格。', 4, 1, 8, 23, TIMESTAMP '2024-01-01 13:02:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('递归转迭代可以避免栈溢出，但代码确实难读。', 1, 1, 11, 24, TIMESTAMP '2024-01-01 14:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('空间换时间嘛。', 4, 1, 12, 25, TIMESTAMP '2024-01-01 14:20:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('没错，还要区分平均情况和最坏情况。', 2, 1, 13, 26, TIMESTAMP '2024-01-01 15:02:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('最坏情况可以通过随机化避免。', 3, 1, 14, 27, TIMESTAMP '2024-01-01 15:10:00', FALSE);
