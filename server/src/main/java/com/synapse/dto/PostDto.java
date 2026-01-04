package com.synapse.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
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
public class PostDto {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private Long id;
    private PostType type;
    private String title;
    private String content;
    private String language;
    private String summary;
    private String coverImage;
    private List<String> images;
    private UserDto user;
    private List<TagDto> tags;
    private Instant createdAt;
    private int likeCount;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private UserStateDto userState;
    private List<AttachmentDto> attachments;

    public static PostDto fromEntity(Post post) {
        List<String> imageList = Collections.emptyList();
        String imagesJson = post.getImages();

        if (imagesJson != null && !imagesJson.isBlank()) {
            try {
                // Check for double-serialization: "[\"...\"]" instead of ["..."]
                String toParse = imagesJson;
                if (imagesJson.startsWith("\"") && imagesJson.endsWith("\"")) {
                    // Double-serialized - unwrap outer quotes and unescape
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
                .userState(new UserStateDto(false)) // default not liked; controller/service may enrich
                .attachments(post.getAttachments() != null
                        ? post.getAttachments().stream()
                                .map(AttachmentDto::fromEntity)
                                .toList()
                        : Collections.emptyList())
                .build();
    }
}
