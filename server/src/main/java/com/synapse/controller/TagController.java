package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.TagDto;
import com.synapse.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags", description = "Topic/tag management")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Get popular tags", description = "Returns popular tags by post count")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Tags retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<TagDto>>> getTags(
            @Parameter(description = "Maximum number of tags to return") @RequestParam(defaultValue = "10") int limit) {
        List<TagDto> tags = tagService.getPopularTags(limit);
        return ResponseEntity.ok(ApiResponse.success(tags));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all tags", description = "Returns all available tags")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Tags retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<TagDto>>> getAllTags() {
        List<TagDto> tags = tagService.getAllTags();
        return ResponseEntity.ok(ApiResponse.success(tags));
    }
}
