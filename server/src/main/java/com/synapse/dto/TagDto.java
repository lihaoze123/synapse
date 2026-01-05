package com.synapse.dto;

import com.synapse.entity.Tag;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Topic tag data")
public class TagDto {

    @Schema(description = "Tag ID", example = "1")
    private Long id;

    @Schema(description = "Tag name", example = "javascript")
    private String name;

    @Schema(description = "Tag icon emoji", example = "💻")
    private String icon;

    public static TagDto fromEntity(Tag tag) {
        return TagDto.builder()
                .id(tag.getId())
                .name(tag.getName())
                .icon(tag.getIcon())
                .build();
    }
}
