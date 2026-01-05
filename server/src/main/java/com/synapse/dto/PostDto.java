package com.synapse.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Post data with user and tag information")
public class PostDto {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Schema(description = "Post ID", example = "1")
    private Long id;

    @Schema(description = "Post type", example = "SNIPPET")
    private PostType type;

    @Schema(description = "Post title", example = "My First Post")
    private String title;

    @Schema(description = "Post content", example = "This is my post content")
    private String content;

    @Schema(description = "Programming language (for SNIPPET)", example = "javascript")
    private String language;

    @Schema(description = "Post summary", example = "A brief summary")
    private String summary;

    @Schema(description = "Cover image URL", example = "https://example.com/cover.png")
    private String coverImage;

    @Schema(description = "Image URLs")
    private List<String> images;

    @Schema(description = "Post author")
    private UserDto user;

    @Schema(description = "Post tags")
    private List<TagDto> tags;

    @Schema(description = "Creation timestamp", example = "2024-01-01T00:00:00Z")
    private Instant createdAt;

    @Schema(description = "Number of likes", example = "42")
    private int likeCount;

    @Schema(description = "Whether post is private", example = "false")
    @JsonProperty("isPrivate")
    private boolean isPrivate;

    @Schema(description = "Current user's state (liked, bookmarked)")
    private UserStateDto userState;

    @Schema(description = "File attachments")
    private List<AttachmentDto> attachments;

    public static PostDto fromEntity(Post post) {
        List<String> imageList = Collections.emptyList();
        String imagesJson = post.getImages();

        if (imagesJson != null && !imagesJson.isBlank()) {
            try {
                String toParse = imagesJson;
                if (imagesJson.startsWith("\"") && imagesJson.endsWith("\"")) {
                    toParse = OBJECT_MAPPER.readValue(imagesJson, String.class);
                }
                imageList = OBJECT_MAPPER.readValue(toParse, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                imageList = Collections.emptyList();
            }
        }

        return PostDto.builder()
                .id(post.getId())
                .type(post.getType())
                .title(post.getTitle())
                .content(post.getContent())
                .language(post.getLanguage())
                .summary(post.getSummary())
                .coverImage(post.getCoverImage())
                .images(imageList)
                .user(UserDto.fromEntity(post.getUser()))
                .tags(post.getTags().stream()
                        .map(TagDto::fromEntity)
                        .toList())
                .createdAt(post.getCreatedAt())
                .likeCount(post.getLikeCount())
                .isPrivate(post.isPrivate())
                .userState(new UserStateDto(false))
                .attachments(post.getAttachments() != null
                        ? post.getAttachments().stream()
                                .map(AttachmentDto::fromEntity)
                                .toList()
                        : Collections.emptyList())
                .build();
    }
}
