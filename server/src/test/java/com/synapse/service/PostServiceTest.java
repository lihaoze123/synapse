package com.synapse.service;

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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PostService Tests")
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private PostService postService;

    @Test
    @DisplayName("getPosts should return all posts when no filters")
    void getPosts_shouldReturnAllPosts() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Test Post")
                .content("Content")
                .user(user)
                .tags(new HashSet<>())
                .build();

        when(postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(post)));

        Page<PostDto> result = postService.getPosts(null, null, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals("Test Post", result.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("getPosts should filter by type")
    void getPosts_shouldFilterByType() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.SNIPPET)
                .title("Test Snippet")
                .content("code")
                .user(user)
                .tags(new HashSet<>())
                .build();

        when(postRepository.findByTypeOrderByCreatedAtDesc(PostType.SNIPPET, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(post)));

        Page<PostDto> result = postService.getPosts(null, PostType.SNIPPET, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals(PostType.SNIPPET, result.getContent().get(0).getType());
    }

    @Test
    @DisplayName("getPost should return post with content for owner")
    void getPost_shouldReturnPostWithContentForOwner() {
        User user = User.builder().id(1L).username("user").build();
        Set<Tag> tags = new HashSet<>();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Private Post")
                .content("Secret content")
                .user(user)
                .tags(tags)
                .isPrivate(true)
                .build();

        when(postRepository.findWithDetailsById(1L)).thenReturn(Optional.of(post));

        PostDto result = postService.getPost(1L, 1L);

        assertNotNull(result);
        assertEquals("Secret content", result.getContent());
    }

    @Test
    @DisplayName("getPost should hide content for private post when not owner")
    void getPost_shouldHideContentForPrivatePost() {
        User owner = User.builder().id(1L).username("owner").build();
        Set<Tag> tags = new HashSet<>();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Private Post")
                .content("Secret content")
                .user(owner)
                .tags(tags)
                .isPrivate(true)
                .build();

        when(postRepository.findWithDetailsById(1L)).thenReturn(Optional.of(post));

        PostDto result = postService.getPost(1L, 2L);

        assertNotNull(result);
        assertNull(result.getContent());
    }

    @Test
    @DisplayName("getPost should throw for non-existent post")
    void getPost_shouldThrowForNonExistentPost() {
        when(postRepository.findWithDetailsById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> postService.getPost(999L, 1L));
    }

    @Test
    @DisplayName("verifyPassword should return post for correct password")
    void verifyPassword_shouldReturnPostForCorrectPassword() {
        User owner = User.builder().id(1L).username("owner").build();
        Set<Tag> tags = new HashSet<>();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Private Post")
                .content("Secret content")
                .user(owner)
                .tags(tags)
                .isPrivate(true)
                .password("secret123")
                .build();

        when(postRepository.findWithDetailsById(1L)).thenReturn(Optional.of(post));

        PostDto result = postService.verifyPassword(1L, "secret123", 2L);

        assertNotNull(result);
        assertEquals("Secret content", result.getContent());
    }

    @Test
    @DisplayName("verifyPassword should throw for incorrect password")
    void verifyPassword_shouldThrowForIncorrectPassword() {
        User owner = User.builder().id(1L).username("owner").build();
        Set<Tag> tags = new HashSet<>();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Private Post")
                .content("Secret content")
                .user(owner)
                .tags(tags)
                .isPrivate(true)
                .password("secret123")
                .build();

        when(postRepository.findWithDetailsById(1L)).thenReturn(Optional.of(post));

        assertThrows(IllegalArgumentException.class, () -> postService.verifyPassword(1L, "wrong", 2L));
    }

    @Test
    @DisplayName("createPost should create article with summary")
    void createPost_shouldCreateArticleWithSummary() {
        User user = User.builder().id(1L).username("user").build();
        Tag javaTag = Tag.builder().id(1L).name("java").build();

        CreatePostRequest request = new CreatePostRequest();
        request.setType(PostType.ARTICLE);
        request.setTitle("Java Tutorial");
        request.setContent("This is a very long content that exceeds two hundred characters and should be truncated when creating the summary field for the article post type in the system.");
        request.setLanguage("java");
        request.setTags(List.of("java"));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tagRepository.findByName("java")).thenReturn(Optional.of(javaTag));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        PostDto result = postService.createPost(1L, request);

        assertNotNull(result);
        assertEquals("Java Tutorial", result.getTitle());
        assertNotNull(result.getSummary());
    }

    @Test
    @DisplayName("createPost should throw when private post missing password")
    void createPost_shouldThrowWhenPrivatePostMissingPassword() {
        User user = User.builder().id(1L).username("user").build();

        CreatePostRequest request = new CreatePostRequest();
        request.setType(PostType.ARTICLE);
        request.setTitle("Private Post");
        request.setIsPrivate(true);
        request.setPassword(null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> postService.createPost(1L, request));
    }

    @Test
    @DisplayName("createPost should throw when private post has blank password")
    void createPost_shouldThrowWhenPrivatePostHasBlankPassword() {
        User user = User.builder().id(1L).username("user").build();

        CreatePostRequest request = new CreatePostRequest();
        request.setType(PostType.ARTICLE);
        request.setTitle("Private Post");
        request.setIsPrivate(true);
        request.setPassword("   ");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> postService.createPost(1L, request));
    }

    @Test
    @DisplayName("deletePost should delete post when owner")
    void deletePost_shouldDeleteWhenOwner() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Test")
                .user(user)
                .build();

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        postService.deletePost(1L, 1L);

        verify(postRepository).delete(post);
    }

    @Test
    @DisplayName("deletePost should throw when not owner")
    void deletePost_shouldThrowWhenNotOwner() {
        User owner = User.builder().id(1L).username("owner").build();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Test")
                .user(owner)
                .build();

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        assertThrows(IllegalArgumentException.class, () -> postService.deletePost(1L, 2L));
    }

    @Test
    @DisplayName("updatePost should update title")
    void updatePost_shouldUpdateTitle() {
        User user = User.builder().id(1L).username("user").build();
        Set<Tag> tags = new HashSet<>();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Old Title")
                .content("Content")
                .user(user)
                .tags(tags)
                .build();

        UpdatePostRequest request = new UpdatePostRequest();
        request.setTitle("New Title");

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenReturn(post);

        PostDto result = postService.updatePost(1L, 1L, request);

        assertEquals("New Title", result.getTitle());
    }

    @Test
    @DisplayName("updatePost should throw when not owner")
    void updatePost_shouldThrowWhenNotOwner() {
        User owner = User.builder().id(1L).username("owner").build();
        Set<Tag> tags = new HashSet<>();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Test")
                .user(owner)
                .tags(tags)
                .build();

        UpdatePostRequest request = new UpdatePostRequest();
        request.setTitle("New Title");

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        assertThrows(IllegalArgumentException.class, () -> postService.updatePost(1L, 2L, request));
    }

    @Test
    @DisplayName("searchPosts should search by keyword")
    void searchPosts_shouldSearchByKeyword() {
        User user = User.builder().id(1L).username("user").build();
        Set<Tag> tags = new HashSet<>();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Java Tutorial")
                .content("Learn Java programming")
                .user(user)
                .tags(tags)
                .build();

        when(postRepository.searchByKeyword("java", PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(post)));

        Page<PostDto> result = postService.searchPosts("java", null, null, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }

    @Test
    @DisplayName("searchPosts should handle empty keyword")
    void searchPosts_shouldHandleEmptyKeyword() {
        User user = User.builder().id(1L).username("user").build();
        Set<Tag> tags = new HashSet<>();
        Post post = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Test")
                .content("Content")
                .user(user)
                .tags(tags)
                .build();

        when(postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(post)));

        Page<PostDto> result = postService.searchPosts("", null, null, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }

    @Test
    @DisplayName("createPost should create new tags when not exist")
    void createPost_shouldCreateNewTags() {
        User user = User.builder().id(1L).username("user").build();
        Tag newTag = Tag.builder().id(1L).name("python").build();

        CreatePostRequest request = new CreatePostRequest();
        request.setType(PostType.ARTICLE);
        request.setTitle("Python Tutorial");
        request.setContent("Content");
        request.setTags(List.of("python"));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tagRepository.findByName("python")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenReturn(newTag);
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        PostDto result = postService.createPost(1L, request);

        assertNotNull(result);
        verify(tagRepository).save(any(Tag.class));
    }
}
