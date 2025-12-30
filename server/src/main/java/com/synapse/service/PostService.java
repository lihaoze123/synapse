package com.synapse.service;

import com.synapse.dto.CreatePostRequest;
import com.synapse.dto.PostDto;
import com.synapse.dto.UpdatePostRequest;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import com.synapse.entity.Tag;
import com.synapse.entity.User;
import com.synapse.repository.PostRepository;
import com.synapse.repository.TagRepository;
import com.synapse.repository.UserRepository;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<PostDto> getPosts(String tag, PostType type, Pageable pageable) {
        Page<Post> posts;

        if (tag != null && type != null) {
            posts = postRepository.findByTagNameAndType(tag, type, pageable);
        } else if (tag != null) {
            posts = postRepository.findByTagName(tag, pageable);
        } else if (type != null) {
            posts = postRepository.findByTypeOrderByCreatedAtDesc(type, pageable);
        } else {
            posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return posts.map(PostDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public PostDto getPost(Long id) {
        Post post = postRepository.findWithDetailsById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return PostDto.fromEntity(post);
    }

    @Transactional
    public PostDto createPost(Long userId, CreatePostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post post = Post.builder()
                .type(request.getType())
                .title(request.getTitle())
                .content(request.getContent())
                .language(request.getLanguage())
                .coverImage(request.getCoverImage())
                .user(user)
                .build();

        // Generate summary for articles (truncate at word boundary)
        if (request.getType() == PostType.ARTICLE && request.getContent() != null) {
            String content = request.getContent();
            String summary;
            if (content.length() <= 200) {
                summary = content;
            } else {
                int lastSpace = content.lastIndexOf(' ', 200);
                summary = (lastSpace > 0 ? content.substring(0, lastSpace) : content.substring(0, 200)) + "...";
            }
            post.setSummary(summary);
        }

        // Process tags with normalization
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : request.getTags()) {
                String normalizedName = tagName.trim();
                if (normalizedName.isEmpty()) {
                    continue;
                }
                Tag tag = tagRepository.findByName(normalizedName)
                        .orElseGet(() -> tagRepository.save(
                                Tag.builder().name(normalizedName).build()));
                tags.add(tag);
            }
            post.setTags(tags);
        }

        Post saved = postRepository.save(post);
        return PostDto.fromEntity(saved);
    }

    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    @Transactional
    public PostDto updatePost(Long postId, Long userId, UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to edit this post");
        }

        // Update fields if provided
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());

            // Regenerate summary for articles
            if (post.getType() == PostType.ARTICLE) {
                String content = request.getContent();
                String summary;
                if (content.length() <= 200) {
                    summary = content;
                } else {
                    int lastSpace = content.lastIndexOf(' ', 200);
                    summary = (lastSpace > 0 ? content.substring(0, lastSpace) : content.substring(0, 200)) + "...";
                }
                post.setSummary(summary);
            }
        }
        if (request.getLanguage() != null) {
            post.setLanguage(request.getLanguage());
        }
        if (request.getCoverImage() != null) {
            post.setCoverImage(request.getCoverImage());
        }

        // Update tags if provided
        if (request.getTags() != null) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : request.getTags()) {
                String normalizedName = tagName.trim();
                if (normalizedName.isEmpty()) {
                    continue;
                }
                Tag tag = tagRepository.findByName(normalizedName)
                        .orElseGet(() -> tagRepository.save(
                                Tag.builder().name(normalizedName).build()));
                tags.add(tag);
            }
            post.setTags(tags);
        }

        Post saved = postRepository.save(post);
        return PostDto.fromEntity(saved);
    }
}
