package com.synapse.repository;

import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByTypeOrderByCreatedAtDesc(PostType type);

    List<Post> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT p FROM Post p JOIN p.tags t WHERE t.name = :tagName ORDER BY p.createdAt DESC")
    List<Post> findByTagName(@Param("tagName") String tagName);

    @Query(
        "SELECT DISTINCT p FROM Post p JOIN p.tags t WHERE t.name = :tagName AND p.type = :type "
            + "ORDER BY p.createdAt DESC"
    )
    List<Post> findByTagNameAndType(@Param("tagName") String tagName, @Param("type") PostType type);

    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "tags"})
    Page<Post> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tags"})
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tags"})
    Page<Post> findByTypeOrderByCreatedAtDesc(PostType type, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query("SELECT DISTINCT p FROM Post p JOIN p.tags t WHERE t.name = :tagName ORDER BY p.createdAt DESC")
    Page<Post> findByTagName(@Param("tagName") String tagName, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT DISTINCT p FROM Post p JOIN p.tags t WHERE t.name = :tagName AND p.type = :type "
            + "ORDER BY p.createdAt DESC"
    )
    Page<Post> findByTagNameAndType(@Param("tagName") String tagName, @Param("type") PostType type, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tags"})
    Optional<Post> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT p FROM Post p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.createdAt DESC"
    )
    Page<Post> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT p FROM Post p WHERE p.type = :type AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "ORDER BY p.createdAt DESC"
    )
    Page<Post> searchByKeywordAndType(
        @Param("keyword") String keyword,
        @Param("type") PostType type,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT DISTINCT p FROM Post p JOIN p.tags t "
            + "WHERE t.name = :tagName AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "ORDER BY p.createdAt DESC"
    )
    Page<Post> searchByKeywordAndTag(
        @Param("keyword") String keyword,
        @Param("tagName") String tagName,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT DISTINCT p FROM Post p JOIN p.tags t "
            + "WHERE t.name = :tagName AND p.type = :type AND "
            + "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "ORDER BY p.createdAt DESC"
    )
    Page<Post> searchByKeywordTagAndType(
        @Param("keyword") String keyword,
        @Param("tagName") String tagName,
        @Param("type") PostType type,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT DISTINCT p FROM Post p JOIN p.tags t "
            + "WHERE t.name IN :tagNames AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "ORDER BY p.createdAt DESC"
    )
    Page<Post> searchByKeywordAndAnyTags(
        @Param("keyword") String keyword,
        @Param("tagNames") java.util.List<String> tagNames,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT DISTINCT p FROM Post p JOIN p.tags t "
            + "WHERE t.name IN :tagNames AND p.type = :type AND "
            + "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "ORDER BY p.createdAt DESC"
    )
    Page<Post> searchByKeywordAnyTagsAndType(
        @Param("keyword") String keyword,
        @Param("tagNames") java.util.List<String> tagNames,
        @Param("type") PostType type,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT DISTINCT p FROM Post p JOIN p.tags t "
            + "WHERE t.name IN :tagNames "
            + "ORDER BY p.createdAt DESC"
    )
    Page<Post> findByAnyTags(
        @Param("tagNames") java.util.List<String> tagNames,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "tags"})
    @Query(
        "SELECT DISTINCT p FROM Post p JOIN p.tags t "
            + "WHERE t.name IN :tagNames AND p.type = :type "
            + "ORDER BY p.createdAt DESC"
    )
    Page<Post> findByAnyTagsAndType(
        @Param("tagNames") java.util.List<String> tagNames,
        @Param("type") PostType type,
        Pageable pageable
    );
}
