package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.TagDto;
import com.synapse.service.TagService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagDto>>> getTags(
            @RequestParam(defaultValue = "10") int limit) {
        List<TagDto> tags = tagService.getPopularTags(limit);
        return ResponseEntity.ok(ApiResponse.success(tags));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<TagDto>>> getAllTags() {
        List<TagDto> tags = tagService.getAllTags();
        return ResponseEntity.ok(ApiResponse.success(tags));
    }
}
