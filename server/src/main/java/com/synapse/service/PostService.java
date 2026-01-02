package com.synapse.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.dto.CreatePostRequest;
import com.synapse.dto.PostDto;
import com.synapse.dto.UpdatePostRequest;
import com.synapse.entity.Attachment;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import com.synapse.entity.Tag;
import com.synapse.entity.User;
import com.synapse.repository.PostRepository;
import com.synapse.repository.TagRepository;
import com.synapse.repository.UserRepository;
import java.util.HashSet;
import java.util.List;
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
    private final ObjectMapper objectMapper;

    private String convertImagesToJson(List<String> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(images);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

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

        return posts.map(this::sanitizePrivatePost);
    }

    private PostDto sanitizePrivatePost(Post post) {
        PostDto dto = PostDto.fromEntity(post);
        if (post.isPrivate()) {
            dto.setContent(null);
            dto.setImages(null);
            dto.setAttachments(null);
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public PostDto getPost(Long id) {
        return getPost(id, null);
    }

    @Transactional(readOnly = true)
    public PostDto getPost(Long id, Long requesterId) {
        Post post = postRepository.findWithDetailsById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        PostDto dto = PostDto.fromEntity(post);

        if (post.isPrivate() && !isOwner(post, requesterId)) {
            dto.setContent(null);
            dto.setImages(null);
            dto.setAttachments(null);
        }

        return dto;
    }

    private boolean isOwner(Post post, Long userId) {
        return userId != null && post.getUser().getId().equals(userId);
    }

    @Transactional(readOnly = true)
    public PostDto verifyPassword(Long postId, String password, Long requesterId) {
        Post post = postRepository.findWithDetailsById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (!post.isPrivate()) {
            return PostDto.fromEntity(post);
        }

        if (isOwner(post, requesterId)) {
            return PostDto.fromEntity(post);
        }

        if (post.getPassword() == null || !post.getPassword().equals(password)) {
            throw new IllegalArgumentException("Incorrect password");
        }

        return PostDto.fromEntity(post);
    }

    @Transactional
    public PostDto createPost(Long userId, CreatePostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isPrivate = Boolean.TRUE.equals(request.getIsPrivate());
        if (isPrivate && (request.getPassword() == null || request.getPassword().isBlank())) {
            throw new IllegalArgumentException("Password is required for private posts");
        }

        Post post = Post.builder()
                .type(request.getType())
                .title(request.getTitle())
                .content(request.getContent())
                .language(request.getLanguage())
                .coverImage(request.getCoverImage())
                .images(convertImagesToJson(request.getImages()))
                .user(user)
                .isPrivate(isPrivate)
                .password(isPrivate ? request.getPassword() : null)
                .build();

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

        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            for (var attachmentReq : request.getAttachments()) {
                Attachment attachment = Attachment.builder()
                        .post(saved)
                        .filename(attachmentReq.getFilename())
                        .storedName(attachmentReq.getStoredName())
                        .fileSize(attachmentReq.getFileSize())
                        .contentType(attachmentReq.getContentType())
                        .build();
                saved.getAttachments().add(attachment);
            }
            saved = postRepository.save(saved);
        }

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

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());

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
        if (request.getImages() != null) {
            post.setImages(convertImagesToJson(request.getImages()));
        }

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

        if (request.getAttachments() != null) {
            post.getAttachments().clear();
            for (var attachmentReq : request.getAttachments()) {
                Attachment attachment = Attachment.builder()
                        .post(post)
                        .filename(attachmentReq.getFilename())
                        .storedName(attachmentReq.getStoredName())
                        .fileSize(attachmentReq.getFileSize())
                        .contentType(attachmentReq.getContentType())
                        .build();
                post.getAttachments().add(attachment);
            }
        }

        if (request.getIsPrivate() != null) {
            boolean isPrivate = request.getIsPrivate();
            if (isPrivate && (request.getPassword() == null || request.getPassword().isBlank())
                    && (post.getPassword() == null || post.getPassword().isBlank())) {
                throw new IllegalArgumentException("Password is required for private posts");
            }
            post.setPrivate(isPrivate);
            if (isPrivate && request.getPassword() != null && !request.getPassword().isBlank()) {
                post.setPassword(request.getPassword());
            }
            if (!isPrivate) {
                post.setPassword(null);
            }
        } else if (request.getPassword() != null && !request.getPassword().isBlank()) {
            post.setPassword(request.getPassword());
        }

        Post saved = postRepository.save(post);
        return PostDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<PostDto> searchPosts(String keyword, java.util.List<String> tags, PostType type, Pageable pageable) {
        Page<Post> posts;
        String kw = keyword == null ? "" : keyword.trim();

        java.util.List<String> normTags = null;
        if (tags != null && !tags.isEmpty()) {
            java.util.LinkedHashSet<String> set = new java.util.LinkedHashSet<>();
            for (String t : tags) {
                if (t != null) {
                    String nt = t.trim();
                    if (!nt.isEmpty()) set.add(nt);
                }
            }
            if (!set.isEmpty()) {
                normTags = new java.util.ArrayList<>(set);
            }
        }

        boolean hasKeyword = !kw.isEmpty();

        if (hasKeyword) {
            if (normTags != null && type != null) {
                posts = postRepository.searchByKeywordAnyTagsAndType(kw, normTags, type, pageable);
            } else if (normTags != null) {
                posts = postRepository.searchByKeywordAndAnyTags(kw, normTags, pageable);
            } else if (type != null) {
                posts = postRepository.searchByKeywordAndType(kw, type, pageable);
            } else {
                posts = postRepository.searchByKeyword(kw, pageable);
            }
        } else {
            if (normTags != null && type != null) {
                posts = postRepository.findByAnyTagsAndType(normTags, type, pageable);
            } else if (normTags != null) {
                posts = postRepository.findByAnyTags(normTags, pageable);
            } else if (type != null) {
                posts = postRepository.findByTypeOrderByCreatedAtDesc(type, pageable);
            } else {
                posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
            }
        }

        return posts.map(this::sanitizePrivatePost);
    }
}
