package com.synapse.dto;

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

    @Size(max = 5, message = "Maximum 5 tags allowed")
    private List<String> tags;
}
