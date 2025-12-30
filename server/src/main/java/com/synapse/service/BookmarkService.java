package com.synapse.service;

import com.synapse.dto.BookmarkDto;
import com.synapse.entity.Bookmark;
import com.synapse.entity.Post;
import com.synapse.entity.User;
import com.synapse.repository.BookmarkRepository;
import com.synapse.repository.PostRepository;
import com.synapse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<BookmarkDto> getUserBookmarks(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(BookmarkDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<BookmarkDto> getPostBookmarks(Long postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("Post not found");
        }
        return bookmarkRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable)
                .map(BookmarkDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(Long userId, Long postId) {
        return bookmarkRepository.existsByUserIdAndPostId(userId, postId);
    }

    @Transactional
    public BookmarkDto addBookmark(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (bookmarkRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new IllegalArgumentException("Already bookmarked");
        }

        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .post(post)
                .build();

        Bookmark saved = bookmarkRepository.save(bookmark);
        return BookmarkDto.fromEntity(saved);
    }

    @Transactional
    public void removeBookmark(Long userId, Long postId) {
        if (!bookmarkRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new IllegalArgumentException("Bookmark not found");
        }
        bookmarkRepository.deleteByUserIdAndPostId(userId, postId);
    }

    @Transactional(readOnly = true)
    public long getBookmarkCount(Long postId) {
        return bookmarkRepository.countByPostId(postId);
    }
}
