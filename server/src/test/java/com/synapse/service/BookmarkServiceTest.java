package com.synapse.service;

import com.synapse.dto.BookmarkDto;
import com.synapse.entity.Bookmark;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import com.synapse.entity.User;
import com.synapse.repository.BookmarkRepository;
import com.synapse.repository.PostRepository;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookmarkService Tests")
class BookmarkServiceTest {

    @Mock
    private BookmarkRepository bookmarkRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookmarkService bookmarkService;

    @Test
    @DisplayName("getUserBookmarks should return paginated bookmarks")
    void getUserBookmarks_shouldReturnPaginatedBookmarks() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Bookmark bookmark = Bookmark.builder().id(1L).user(user).post(post).build();

        when(userRepository.existsById(1L)).thenReturn(true);
        when(bookmarkRepository.findByUserIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(bookmark)));

        Page<BookmarkDto> result = bookmarkService.getUserBookmarks(1L, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals(1L, result.getContent().get(0).getPost().getId());
    }

    @Test
    @DisplayName("getUserBookmarks should throw for non-existent user")
    void getUserBookmarks_shouldThrowForNonExistentUser() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> bookmarkService.getUserBookmarks(999L, PageRequest.of(0, 10)));
    }

    @Test
    @DisplayName("isBookmarked should return true when bookmarked")
    void isBookmarked_shouldReturnTrueWhenBookmarked() {
        when(bookmarkRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(true);

        boolean result = bookmarkService.isBookmarked(1L, 1L);

        assertEquals(true, result);
    }

    @Test
    @DisplayName("isBookmarked should return false when not bookmarked")
    void isBookmarked_shouldReturnFalseWhenNotBookmarked() {
        when(bookmarkRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(false);

        boolean result = bookmarkService.isBookmarked(1L, 1L);

        assertEquals(false, result);
    }

    @Test
    @DisplayName("addBookmark should create new bookmark")
    void addBookmark_shouldCreateNewBookmark() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Bookmark bookmark = Bookmark.builder().id(1L).user(user).post(post).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(bookmarkRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(false);
        when(bookmarkRepository.save(any(Bookmark.class))).thenReturn(bookmark);

        BookmarkDto result = bookmarkService.addBookmark(1L, 1L);

        assertNotNull(result);
        verify(bookmarkRepository).save(any(Bookmark.class));
    }

    @Test
    @DisplayName("addBookmark should throw when already bookmarked")
    void addBookmark_shouldThrowWhenAlreadyBookmarked() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(bookmarkRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> bookmarkService.addBookmark(1L, 1L));
        verify(bookmarkRepository, never()).save(any(Bookmark.class));
    }

    @Test
    @DisplayName("removeBookmark should delete bookmark")
    void removeBookmark_shouldDeleteBookmark() {
        when(bookmarkRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(true);

        bookmarkService.removeBookmark(1L, 1L);

        verify(bookmarkRepository).deleteByUserIdAndPostId(1L, 1L);
    }

    @Test
    @DisplayName("removeBookmark should throw when bookmark not found")
    void removeBookmark_shouldThrowWhenNotFound() {
        when(bookmarkRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> bookmarkService.removeBookmark(1L, 1L));
    }

    @Test
    @DisplayName("getBookmarkCount should return count")
    void getBookmarkCount_shouldReturnCount() {
        when(bookmarkRepository.countByPostId(1L)).thenReturn(5L);

        long result = bookmarkService.getBookmarkCount(1L);

        assertEquals(5L, result);
    }

    @Test
    @DisplayName("getPostBookmarks should return paginated bookmarks")
    void getPostBookmarks_shouldReturnPaginatedBookmarks() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Bookmark bookmark = Bookmark.builder().id(1L).user(user).post(post).build();

        when(postRepository.existsById(1L)).thenReturn(true);
        when(bookmarkRepository.findByPostIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(bookmark)));

        Page<BookmarkDto> result = bookmarkService.getPostBookmarks(1L, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals(1L, result.getContent().get(0).getPost().getId());
    }
}
