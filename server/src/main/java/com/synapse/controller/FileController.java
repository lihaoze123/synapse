package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.util.FileUtil;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload and download")
public class FileController {

    private final FileUtil fileUtil;
    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @PostMapping("/upload")
    @Operation(summary = "Upload image", description = "Uploads an image file to MinIO storage")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "File uploaded successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file or upload failed")
    })
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authentication required"));
        }

        try {
            String objectName = fileUtil.saveFile(file);
            String url = fileUtil.getPublicUrl(objectName);

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "filename", objectName,
                    "url", url
            )));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload file"));
        }
    }

    @PostMapping("/upload/attachment")
    @Operation(summary = "Upload attachment", description = "Uploads an attachment file with metadata")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Attachment uploaded successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file or upload failed")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadAttachment(
            @Parameter(description = "Attachment file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authentication required"));
        }

        try {
            String objectName = fileUtil.saveAttachment(file);
            String url = fileUtil.getPublicUrl(objectName);

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "filename", file.getOriginalFilename(),
                    "storedName", objectName,
                    "url", url,
                    "fileSize", file.getSize(),
                    "contentType", file.getContentType()
            )));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload file"));
        }
    }

    @GetMapping("/download/{storedName}")
    @Operation(summary = "Download file", description = "Downloads a file from MinIO storage")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "File downloaded successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "File not found")
    })
    public ResponseEntity<Resource> downloadFile(
            @Parameter(description = "Stored file name in MinIO", required = true) @PathVariable String storedName,
            @Parameter(description = "Optional filename for download") @RequestParam(required = false) String filename) {

        try {
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(storedName)
                            .build());

            String downloadName = (filename != null && !filename.isEmpty())
                    ? filename
                    : storedName;
            String encodedFilename = URLEncoder.encode(downloadName, StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + encodedFilename
                            + "\"; filename*=UTF-8''" + encodedFilename)
                    .body(new InputStreamResource(stream));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
