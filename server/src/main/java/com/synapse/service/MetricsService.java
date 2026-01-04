package com.synapse.service;

import com.synapse.entity.NotificationType;
import com.synapse.entity.PostType;
import com.synapse.repository.BookmarkRepository;
import com.synapse.repository.CommentLikeRepository;
import com.synapse.repository.CommentRepository;
import com.synapse.repository.FollowRepository;
import com.synapse.repository.LikeRepository;
import com.synapse.repository.NotificationRepository;
import com.synapse.repository.PostRepository;
import com.synapse.repository.TagRepository;
import com.synapse.repository.UserRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

@Service
public class MetricsService {

    public MetricsService(
            MeterRegistry registry,
            UserRepository userRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            LikeRepository likeRepository,
            NotificationRepository notificationRepository,
            FollowRepository followRepository,
            BookmarkRepository bookmarkRepository,
            CommentLikeRepository commentLikeRepository,
            TagRepository tagRepository) {

        // ========== User Metrics ==========
        Gauge.builder("synapse.users.total", userRepository::count)
                .description("Total number of registered users")
                .register(registry);

        // ========== Post Metrics ==========
        Gauge.builder("synapse.posts.total", postRepository::count)
                .description("Total number of posts")
                .register(registry);

        for (PostType type : PostType.values()) {
            Gauge.builder("synapse.posts.by_type", () -> postRepository.countByType(type))
                    .tag("type", type.name().toLowerCase())
                    .description("Number of posts by type")
                    .register(registry);
        }

        Gauge.builder("synapse.posts.private", postRepository::countByIsPrivateTrue)
                .description("Number of private posts")
                .register(registry);

        // ========== Engagement Metrics ==========
        Gauge.builder("synapse.comments.total", commentRepository::count)
                .description("Total number of comments")
                .register(registry);

        Gauge.builder("synapse.likes.total", likeRepository::count)
                .description("Total number of post likes")
                .register(registry);

        Gauge.builder("synapse.comment_likes.total", commentLikeRepository::count)
                .description("Total number of comment likes")
                .register(registry);

        Gauge.builder("synapse.bookmarks.total", bookmarkRepository::count)
                .description("Total number of bookmarks")
                .register(registry);

        // ========== Social Metrics ==========
        Gauge.builder("synapse.follows.total", followRepository::count)
                .description("Total number of follow relationships")
                .register(registry);

        // ========== Notification Metrics ==========
        Gauge.builder("synapse.notifications.total", notificationRepository::count)
                .description("Total number of notifications")
                .register(registry);

        Gauge.builder("synapse.notifications.unread", notificationRepository::countByIsReadFalse)
                .description("Total number of unread notifications")
                .register(registry);

        for (NotificationType type : NotificationType.values()) {
            Gauge.builder("synapse.notifications.by_type",
                    () -> notificationRepository.countByType(type))
                    .tag("type", type.name().toLowerCase())
                    .description("Number of notifications by type")
                    .register(registry);
        }

        // ========== Content Metrics ==========
        Gauge.builder("synapse.tags.total", tagRepository::count)
                .description("Total number of tags")
                .register(registry);
    }
}
