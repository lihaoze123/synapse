package com.synapse.dto;

import com.synapse.entity.Attachment;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDto {

    private Long id;
    private String filename;
    private String url;
    private Long fileSize;
    private String contentType;
    private Instant createdAt;

    public static AttachmentDto fromEntity(Attachment attachment) {
        return AttachmentDto.builder()
                .id(attachment.getId())
                .filename(attachment.getFilename())
                .url("/uploads/" + attachment.getStoredName())
                .fileSize(attachment.getFileSize())
                .contentType(attachment.getContentType())
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
