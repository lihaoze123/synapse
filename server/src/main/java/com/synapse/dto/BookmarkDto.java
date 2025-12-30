package com.synapse.dto;

import com.synapse.entity.Bookmark;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkDto {

    private Long id;
    private PostDto post;
    private LocalDateTime createdAt;

    public static BookmarkDto fromEntity(Bookmark bookmark) {
        return BookmarkDto.builder()
                .id(bookmark.getId())
                .post(PostDto.fromEntity(bookmark.getPost()))
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
}
