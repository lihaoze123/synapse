package com.synapse.repository;

import com.synapse.entity.Tag;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByName(String name);

    boolean existsByName(String name);

    @Query("""
        SELECT t FROM Tag t
        JOIN Post p ON t MEMBER OF p.tags
        GROUP BY t
        ORDER BY COUNT(p) DESC
        """)
    List<Tag> findPopularTags(Pageable pageable);
}
