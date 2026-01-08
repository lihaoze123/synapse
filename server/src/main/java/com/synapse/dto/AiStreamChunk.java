package com.synapse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiStreamChunk {
    private String type;
    private String delta;
    private String content;
    private String role;
    private String id;
    private String model;
    private Long timestamp;
}
