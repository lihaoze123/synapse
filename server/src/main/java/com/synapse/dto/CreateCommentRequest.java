package com.synapse.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to create a new comment")
public class CreateCommentRequest {

    @Schema(description = "Comment content (1-2000 characters)", example = "Great post!", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Comment content is required")
    @Size(min = 1, max = 2000, message = "Comment content must be between 1 and 2000 characters")
    private String content;

    @Schema(description = "Parent comment ID (for replies)", example = "5")
    private Long parentId;
}
