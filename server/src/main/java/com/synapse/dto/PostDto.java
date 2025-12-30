package com.synapse.dto;

import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import java.time.LocalDateTime;
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

    private Long id;
    private PostType type;
    private String title;
    private String content;
    private String language;
    private String summary;
    private String coverImage;
    private UserDto user;
    private List<TagDto> tags;
    private LocalDateTime createdAt;

    public static PostDto fromEntity(Post post) {
        return PostDto.builder()
                .id(post.getId())
                .type(post.getType())
                .title(post.getTitle())
                .content(post.getContent())
                .language(post.getLanguage())
                .summary(post.getSummary())
                .coverImage(post.getCoverImage())
                .user(UserDto.fromEntity(post.getUser()))
                .tags(post.getTags().stream()
                        .map(TagDto::fromEntity)
                        .toList())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
