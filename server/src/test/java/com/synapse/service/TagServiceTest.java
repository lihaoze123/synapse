package com.synapse.service;

import com.synapse.dto.TagDto;
import com.synapse.entity.Tag;
import com.synapse.repository.TagRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TagService Tests")
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private TagService tagService;

    @Test
    @DisplayName("getPopularTags should return limited list of popular tags")
    void getPopularTags_shouldReturnLimitedList() {
        Tag javaTag = Tag.builder().id(1L).name("java").build();
        Tag pythonTag = Tag.builder().id(2L).name("python").build();
        Tag javascriptTag = Tag.builder().id(3L).name("javascript").build();

        when(tagRepository.findPopularTags(PageRequest.of(0, 10)))
                .thenReturn(List.of(javaTag, pythonTag, javascriptTag));

        List<TagDto> result = tagService.getPopularTags(10);

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("java", result.get(0).getName());
        assertEquals("python", result.get(1).getName());
        verify(tagRepository).findPopularTags(PageRequest.of(0, 10));
    }

    @Test
    @DisplayName("getPopularTags should clamp limit to minimum of 1")
    void getPopularTags_shouldClampLimitToMin() {
        when(tagRepository.findPopularTags(PageRequest.of(0, 1)))
                .thenReturn(List.of());

        tagService.getPopularTags(0);

        verify(tagRepository).findPopularTags(PageRequest.of(0, 1));
    }

    @Test
    @DisplayName("getPopularTags should clamp limit to maximum of 50")
    void getPopularTags_shouldClampLimitToMax() {
        when(tagRepository.findPopularTags(PageRequest.of(0, 50)))
                .thenReturn(List.of());

        tagService.getPopularTags(100);

        verify(tagRepository).findPopularTags(PageRequest.of(0, 50));
    }

    @Test
    @DisplayName("getPopularTags should handle negative limit")
    void getPopularTags_shouldHandleNegativeLimit() {
        when(tagRepository.findPopularTags(PageRequest.of(0, 1)))
                .thenReturn(List.of());

        tagService.getPopularTags(-5);

        verify(tagRepository).findPopularTags(PageRequest.of(0, 1));
    }

    @Test
    @DisplayName("getAllTags should return all tags")
    void getAllTags_shouldReturnAllTags() {
        Tag javaTag = Tag.builder().id(1L).name("java").build();
        Tag pythonTag = Tag.builder().id(2L).name("python").build();

        when(tagRepository.findAll()).thenReturn(List.of(javaTag, pythonTag));

        List<TagDto> result = tagService.getAllTags();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("java", result.get(0).getName());
        assertEquals("python", result.get(1).getName());
        verify(tagRepository).findAll();
    }

    @Test
    @DisplayName("getAllTags should return empty list when no tags exist")
    void getAllTags_shouldReturnEmptyList() {
        when(tagRepository.findAll()).thenReturn(List.of());

        List<TagDto> result = tagService.getAllTags();

        assertNotNull(result);
        assertEquals(0, result.size());
    }
}
