package com.synapse.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePostRequest {

    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    private String content;

    private String language;

    private String coverImage;

    @Size(max = 9, message = "Maximum 9 images allowed")
    private List<String> images;

    @Size(max = 5, message = "Maximum 5 tags allowed")
    private List<String> tags;

    @Size(max = 3, message = "Maximum 3 attachments allowed")
    private List<AttachmentRequest> attachments;

    @JsonProperty("isPrivate")
    private Boolean isPrivate;

    private String password;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachmentRequest {
        private String filename;
        private String storedName;
        private Long fileSize;
        private String contentType;
    }
}
