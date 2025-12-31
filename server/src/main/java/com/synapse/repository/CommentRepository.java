package com.synapse.repository;

import com.synapse.entity.Comment;
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

	@EntityGraph(attributePaths = { "user", "post", "parent", "parent.user" })
	Page<Comment> findByPostIdOrderByFloorAsc(Long postId, Pageable pageable);

	@Query("SELECT COALESCE(MAX(c.floor), 0) FROM Comment c WHERE c.post.id = :postId")
	Integer findMaxFloorByPostId(@Param("postId") Long postId);

	@EntityGraph(attributePaths = { "user", "post" })
	@Query("SELECT c FROM Comment c WHERE c.id = :id")
	Optional<Comment> findByIdWithUser(@Param("id") Long id);

	@Query("SELECT c.user.id FROM Comment c WHERE c.id = :commentId")
	Optional<Long> findUserIdById(@Param("commentId") Long commentId);
}
