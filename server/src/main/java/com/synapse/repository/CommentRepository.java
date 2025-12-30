package com.synapse.repository;

import com.synapse.entity.Comment;
import com.synapse.entity.Post;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = {"user", "post"})
    Page<Comment> findByPostIdOrderByCreatedAtDesc(Long postId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "post"})
    Page<Comment> findByPostIdAndParentIsNullOrderByCreatedAtDesc(Long postId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "parent"})
    Page<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "post"})
    @Query("SELECT c FROM Comment c WHERE c.id = :id")
    Optional<Comment> findByIdWithUser(@Param("id") Long id);

    @Query("SELECT c.user.id FROM Comment c WHERE c.id = :commentId")
    Optional<Long> findUserIdById(@Param("commentId") Long commentId);

    @Query("SELECT c.isDeleted FROM Comment c WHERE c.id = :commentId")
    Optional<Boolean> findIsDeletedById(@Param("commentId") Long commentId);

    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId AND c.isDeleted = false")
    @EntityGraph(attributePaths = {"post"})
    Page<Comment> findByUserId(@Param("userId") Long userId, Pageable pageable);

    long countByPostId(Long postId);
}
