package com.synapse.service;

import com.synapse.dto.TagDto;
import com.synapse.repository.TagRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    @Cacheable(value = "tags", key = "'popular:' + #limit", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<TagDto> getPopularTags(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        return tagRepository.findPopularTags(PageRequest.of(0, safeLimit)).stream()
                .map(TagDto::fromEntity)
                .toList();
    }

    @Cacheable(value = "tags", key = "'all'", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<TagDto> getAllTags() {
        return tagRepository.findAll().stream()
                .map(TagDto::fromEntity)
                .toList();
    }
}
