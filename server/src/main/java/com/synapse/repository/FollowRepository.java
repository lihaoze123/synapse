package com.synapse.repository;

import com.synapse.entity.Follow;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    @EntityGraph(attributePaths = {"following"})
    Page<Follow> findByFollowerIdOrderByCreatedAtDesc(Long followerId, Pageable pageable);

    @EntityGraph(attributePaths = {"follower"})
    Page<Follow> findByFollowingIdOrderByCreatedAtDesc(Long followingId, Pageable pageable);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    long countByFollowerId(Long followerId);

    long countByFollowingId(Long followingId);
}
