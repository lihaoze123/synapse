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
-- Comments Mock Data (支持 Markdown 格式)
-- ============================================

-- 一级评论 (parent_id = NULL)
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('这个实现很清晰！`partition` 函数的逻辑**一目了然**。', 2, 1, NULL, 1, TIMESTAMP '2024-01-01 10:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('建议在 `sort` 方法开头加上空数组检查。', 3, 1, NULL, 2, TIMESTAMP '2024-01-01 10:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@bob 好建议！已更新。', 1, 1, NULL, 3, TIMESTAMP '2024-01-01 10:10:00', TRUE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('为什么选择最右边的元素作为 `pivot`？这样对已排序数组性能会退化到 `O(n²)`。', 4, 1, NULL, 4, TIMESTAMP '2024-01-01 10:15:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@charlie 可以随机选择 `pivot` 或者用*三数取中法*优化。', 2, 1, NULL, 5, TIMESTAMP '2024-01-01 10:20:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('Python 装饰器那个也很赞！👍', 3, 1, NULL, 6, TIMESTAMP '2024-01-01 11:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('这个算法是**面试必考题**，收藏了。', 2, 1, NULL, 7, TIMESTAMP '2024-01-01 12:30:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('代码缩进用 4 个空格还是 `tab`？', 3, 1, NULL, 8, TIMESTAMP '2024-01-01 13:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('Google Java Style Guide 用 2 个空格，但这个项目用 4 个也没问题。', 4, 1, NULL, 9, TIMESTAMP '2024-01-01 13:05:00', TRUE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('楼上缩进警察哈哈哈 😂', 1, 1, NULL, 10, TIMESTAMP '2024-01-01 13:10:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('有人试过用栈把递归改成迭代吗？', 2, 1, NULL, 11, TIMESTAMP '2024-01-01 14:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('写过，但可读性差了很多。', 3, 1, NULL, 12, TIMESTAMP '2024-01-01 14:15:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('这段代码的时间复杂度是 `O(n log n)` 吧？', 4, 1, NULL, 13, TIMESTAMP '2024-01-01 15:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('对的，平均 `O(n log n)`，最坏 `O(n²)`', 1, 1, NULL, 14, TIMESTAMP '2024-01-01 15:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('学到了！🎓', 2, 1, NULL, 15, TIMESTAMP '2024-01-01 16:00:00', FALSE);

-- 二级回复 (parent_id 指向一级评论的 id，假设一级评论 id 为 1-15)
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('确实，比教科书上写的容易理解多了。', 3, 1, 1, 16, TIMESTAMP '2024-01-01 10:02:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('同意，加上：

```java
if (arr == null || arr.length == 0) return;
```', 1, 1, 2, 17, TIMESTAMP '2024-01-01 10:07:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('或者直接抛 `IllegalArgumentException`', 4, 1, 2, 18, TIMESTAMP '2024-01-01 10:08:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('随机选择 `pivot` 需要额外的随机数生成，*三数取中*更实用。', 1, 1, 4, 19, TIMESTAMP '2024-01-01 10:17:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('是的，很多库都用三数取中。比如 `Arrays.sort()`。', 3, 1, 4, 20, TIMESTAMP '2024-01-01 10:18:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('三数取中确实是个好方案！✨', 4, 1, 5, 21, TIMESTAMP '2024-01-01 10:22:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('确实，必考题，上次面试就问了快速排序和归并排序的区别。', 3, 1, 7, 22, TIMESTAMP '2024-01-01 12:35:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('[Java 官方推荐](https://google.github.io/styleguide/javaguide.html)用 4 个空格。', 4, 1, 8, 23, TIMESTAMP '2024-01-01 13:02:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('递归转迭代可以避免**栈溢出**，但代码确实难读。', 1, 1, 11, 24, TIMESTAMP '2024-01-01 14:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('空间换时间嘛 🤔', 4, 1, 12, 25, TIMESTAMP '2024-01-01 14:20:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('没错，还要区分*平均情况*和*最坏情况*。', 2, 1, 13, 26, TIMESTAMP '2024-01-01 15:02:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('最坏情况可以通过**随机化**避免。', 3, 1, 14, 27, TIMESTAMP '2024-01-01 15:10:00', FALSE);

-- ============================================
-- Comments for Post ID = 2: Python Decorator
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('装饰器是 Python 最优雅的特性之一！🐍', 1, 2, NULL, 1, TIMESTAMP '2024-01-02 09:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('可以叠加多个装饰器吗？', 3, 2, NULL, 2, TIMESTAMP '2024-01-02 09:10:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@bob 可以的，像这样：

```python
@timer
@logger
def my_function():
    pass
```', 2, 2, 2, 3, TIMESTAMP '2024-01-02 09:15:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('带参数的装饰器怎么写？', 4, 2, NULL, 4, TIMESTAMP '2024-01-02 09:20:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@charlie 需要再加一层函数：

```python
def repeat(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")
```', 1, 2, 4, 5, TIMESTAMP '2024-01-02 09:25:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('学到了！感谢 @admin 👏', 4, 2, 4, 6, TIMESTAMP '2024-01-02 09:30:00', FALSE);

-- ============================================
-- Comments for Post ID = 3: React Counter
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('React Hooks 真的很方便，不用写 `class` 了！⚛️', 2, 3, NULL, 1, TIMESTAMP '2024-01-03 10:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('`useState` 是最常用的 Hook 之一', 1, 3, NULL, 2, TIMESTAMP '2024-01-03 10:10:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('建议加个 `useEffect` 来监听 count 变化', 4, 3, NULL, 3, TIMESTAMP '2024-01-03 10:15:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@charlie 好主意！可以这样：

```jsx
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```', 2, 3, 3, 4, TIMESTAMP '2024-01-03 10:20:00', FALSE);

-- ============================================
-- Comments for Post ID = 4: Spring Boot Guide
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('Spring Boot 的**自动配置**真的很强大 🍃', 3, 4, NULL, 1, TIMESTAMP '2024-01-04 11:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('`@SpringBootApplication` 注解其实是三个注解的组合', 2, 4, NULL, 2, TIMESTAMP '2024-01-04 11:10:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@alice 哪三个？', 3, 4, 2, 3, TIMESTAMP '2024-01-04 11:15:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@bob
- `@Configuration`
- `@EnableAutoConfiguration`
- `@ComponentScan`', 2, 4, 2, 4, TIMESTAMP '2024-01-04 11:20:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('涨知识了！📚', 4, 4, 2, 5, TIMESTAMP '2024-01-04 11:25:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('推荐搭配 [Spring Initializr](https://start.spring.io/) 使用', 1, 4, NULL, 6, TIMESTAMP '2024-01-04 11:30:00', FALSE);

-- ============================================
-- Comments for Post ID = 5: JS Async
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('`async/await` 是**语法糖**，本质还是 Promise', 3, 5, NULL, 1, TIMESTAMP '2024-01-05 14:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('错误处理用 `try/catch` 比`.catch()` 更直观', 1, 5, NULL, 2, TIMESTAMP '2024-01-05 14:10:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('并行执行可以用 `Promise.all()`：

```javascript
const [a, b] = await Promise.all([
  getData1(),
  getData2()
]);
```', 4, 5, NULL, 3, TIMESTAMP '2024-01-05 14:15:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@charline 好技巧！可以节省很多时间 ⏱️', 2, 5, 3, 4, TIMESTAMP '2024-01-05 14:20:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('还有 `Promise.race()` 用于竞速场景', 3, 5, 3, 5, TIMESTAMP '2024-01-05 14:25:00', FALSE);

-- ============================================
-- Comments for Post ID = 6: Moment (Spring Boot)
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('加油！Spring Boot 生态很丰富 🚀', 2, 6, NULL, 1, TIMESTAMP '2024-01-06 09:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('推荐看看 [Spring 官方文档](https://spring.io/guides)', 1, 6, NULL, 2, TIMESTAMP '2024-01-06 09:05:00', FALSE);

-- ============================================
-- Comments for Post ID = 7: Moment (Bug Fix)
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('NPE 是 Java 程序员的噩梦 😱', 3, 7, NULL, 1, TIMESTAMP '2024-01-07 10:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('可以用 `Optional` 来避免', 1, 7, NULL, 2, TIMESTAMP '2024-01-07 10:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@admin 但 `Optional` 也有性能开销...', 4, 7, 2, 3, TIMESTAMP '2024-01-07 10:10:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@charlie 看场景，业务代码可读性更重要', 2, 7, 2, 4, TIMESTAMP '2024-01-07 10:15:00', FALSE);

-- ============================================
-- Comments for Post ID = 8: Moment (React 19)
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('React 19 的 Server Components 确实强大！', 2, 8, NULL, 1, TIMESTAMP '2024-01-08 11:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('还有 `use()` Hook 也不错', 4, 8, NULL, 2, TIMESTAMP '2024-01-08 11:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('期待 `useTransition()` 和 `useDeferredValue()`', 3, 8, NULL, 3, TIMESTAMP '2024-01-08 11:10:00', FALSE);

-- ============================================
-- Comments for Post ID = 9: Moment (H2 Database)
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('H2 非常适合**单元测试** 🗄️', 1, 9, NULL, 1, TIMESTAMP '2024-01-09 15:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('测试完数据就清空，很干净', 3, 9, NULL, 2, TIMESTAMP '2024-01-09 15:05:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('配合 `@DataJpaTest` 使用更佳 ✨', 2, 9, NULL, 3, TIMESTAMP '2024-01-09 15:10:00', FALSE);

-- ============================================
-- KaTeX Math Demo Comments (for Post ID = 1: QuickSort)
-- ============================================
INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('快速排序的**时间复杂度**分析：

- 平均情况：$T(n) = 2T(n/2) + O(n) = O(n \log n)$
- 最坏情况：$T(n) = T(n-1) + O(n) = O(n^2)$

用主定理证明的话：$a=2, b=2, f(n)=O(n)$', 1, 1, NULL, 28, TIMESTAMP '2024-01-01 17:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('也可以用**递归树**来理解，每层递归的复杂度是 $O(n)$，共有 $\log n$ 层', 2, 1, NULL, 29, TIMESTAMP '2024-01-01 17:10:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('随机化快速排序的期望时间复杂度证明：

设 $T(n)$ 为期望比较次数，则：
$$T(n) = \frac{1}{n}\sum_{k=1}^{n}[T(k-1) + T(n-k) + O(n)]$$

可以证明 $T(n) = O(n \log n)$', 3, 1, NULL, 30, TIMESTAMP '2024-01-01 17:20:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@alice 这个公式好！但我觉得用**概率分析**更直观。每次划分产生好枢轴的概率至少是 $1/2$', 4, 1, 30, 31, TIMESTAMP '2024-01-01 17:25:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('空间复杂度方面，递归栈的深度是 $O(\log n)$（平均情况）', 1, 1, 30, 32, TIMESTAMP '2024-01-01 17:30:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('顺便说一下，**排序算法的下界**是 $\Omega(n \log n)$，基于比较的排序算法无法突破这个极限', 2, 1, NULL, 33, TIMESTAMP '2024-01-01 17:40:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@bob 除非用非比较排序，比如计数排序的时间复杂度是 $O(n + k)$，其中 $k$ 是数据范围', 3, 1, 33, 34, TIMESTAMP '2024-01-01 17:45:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('还有**基数排序**，复杂度是 $O(d \cdot n)$，$d$ 是数字位数', 4, 1, 33, 35, TIMESTAMP '2024-01-01 17:50:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('数学符号测试：
- 希腊字母：$\alpha, \beta, \gamma, \Delta, \Sigma, \Pi$
- 集合：$\forall x \in S, \exists y$ 使得 $x < y$
- 极限：$\lim_{n \to \infty} \frac{1}{n} = 0$
- 积分：$\int_{0}^{\infty} e^{-x} dx = 1$', 1, 1, NULL, 36, TIMESTAMP '2024-01-01 18:00:00', FALSE);

INSERT INTO comments (content, user_id, post_id, parent_id, floor, created_at, is_deleted) VALUES
('@admin KaTeX 渲染效果很棒！🎨', 2, 1, 36, 37, TIMESTAMP '2024-01-01 18:05:00', FALSE);

-- ============================================
-- Follows Mock Data
-- ============================================

-- Follow relationships between users
-- alice (id=2) follows admin (id=1)
INSERT INTO follows (follower_id, following_id, created_at) VALUES
(2, 1, TIMESTAMP '2024-01-02 09:00:00');

-- bob (id=3) follows admin (id=1) and alice (id=2)
INSERT INTO follows (follower_id, following_id, created_at) VALUES
(3, 1, TIMESTAMP '2024-01-03 10:00:00'),
(3, 2, TIMESTAMP '2024-01-03 10:05:00');

-- charlie (id=4) follows admin (id=1), alice (id=2), and bob (id=3)
INSERT INTO follows (follower_id, following_id, created_at) VALUES
(4, 1, TIMESTAMP '2024-01-04 11:00:00'),
(4, 2, TIMESTAMP '2024-01-04 11:05:00'),
(4, 3, TIMESTAMP '2024-01-04 11:10:00');

-- admin (id=1) follows bob (id=3) and charlie (id=4)
INSERT INTO follows (follower_id, following_id, created_at) VALUES
(1, 3, TIMESTAMP '2024-01-05 14:00:00'),
(1, 4, TIMESTAMP '2024-01-05 14:05:00');

-- alice (id=2) also follows charlie (id=4)
INSERT INTO follows (follower_id, following_id, created_at) VALUES
(2, 4, TIMESTAMP '2024-01-06 16:00:00');
