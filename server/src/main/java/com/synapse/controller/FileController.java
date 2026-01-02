package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.util.FileUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FileController {

    private final FileUtil fileUtil;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authentication required"));
        }

        try {
            String filename = fileUtil.saveFile(file);
            // 返回相对路径，前端再统一补全前缀，避免重复前缀导致 404
            String url = "/uploads/" + filename;

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "filename", filename,
                    "url", url
            )));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload file"));
        }
    }

    @PostMapping("/upload/attachment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authentication required"));
        }

        try {
            String storedName = fileUtil.saveAttachment(file);
            String url = "/uploads/" + storedName;

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "filename", file.getOriginalFilename(),
                    "storedName", storedName,
                    "url", url,
                    "fileSize", file.getSize(),
                    "contentType", file.getContentType()
            )));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload file"));
        }
    }

    @GetMapping("/download/{storedName}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String storedName,
            @RequestParam(required = false) String filename) {

        try {
            Path filePath = Paths.get("uploads", storedName);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            String downloadName = (filename != null && !filename.isEmpty())
                    ? filename
                    : storedName;
            String encodedFilename = URLEncoder.encode(downloadName, StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + encodedFilename + "\"; filename*=UTF-8''" + encodedFilename)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
