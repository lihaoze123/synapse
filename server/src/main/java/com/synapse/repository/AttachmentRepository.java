package com.synapse.repository;

import com.synapse.entity.Attachment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByPostId(Long postId);
    void deleteByPostId(Long postId);
}
