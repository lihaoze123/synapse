package com.synapse.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.synapse.entity.PostType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new post")
public class CreatePostRequest {

    @Schema(description = "Post type", example = "SNIPPET", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Post type is required")
    private PostType type;

    @Schema(description = "Post title (max 200 characters)", example = "My First Post")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    @Schema(description = "Post content",
            example = "This is my post content",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Content is required")
    private String content;

    @Schema(description = "Programming language (for SNIPPET type)", example = "javascript")
    private String language;

    @Schema(description = "Cover image URL (for ARTICLE type)", example = "https://example.com/cover.png")
    private String coverImage;

    @Schema(description = "Image URLs (max 9)", example = "[\"https://example.com/img1.png\"]")
    @Size(max = 9, message = "Maximum 9 images allowed")
    private List<String> images;

    @Schema(description = "Tag names (max 5)", example = "[\"javascript\", \"react\"]")
    @Size(max = 5, message = "Maximum 5 tags allowed")
    private List<String> tags;

    @Schema(description = "File attachments (max 3)")
    @Size(max = 3, message = "Maximum 3 attachments allowed")
    private List<AttachmentRequest> attachments;

    @Schema(description = "Whether post is private", example = "false")
    @JsonProperty("isPrivate")
    private Boolean isPrivate;

    @Schema(description = "Password for private post", example = "secret123")
    private String password;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "File attachment metadata")
    public static class AttachmentRequest {
        @Schema(description = "Original filename", example = "document.pdf")
        private String filename;

        @Schema(description = "Storage name", example = "uuid-filename.pdf")
        private String storedName;

        @Schema(description = "File size in bytes", example = "102400")
        private Long fileSize;

        @Schema(description = "Content type", example = "application/pdf")
        private String contentType;
    }
}
