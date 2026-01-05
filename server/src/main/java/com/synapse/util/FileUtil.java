package com.synapse.util;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileUtil {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.public-url}")
    private String publicUrl;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );
    private static final long MAX_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_ATTACHMENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "application/json",
            "application/xml",
            "text/xml",
            "text/yaml",
            "text/x-yaml",
            "application/x-yaml",
            "application/zip",
            "application/x-zip-compressed",
            "application/x-rar-compressed",
            "application/x-7z-compressed",
            "application/octet-stream"
    );
    private static final Set<String> ALLOWED_ATTACHMENT_EXTENSIONS = Set.of(
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
            ".txt", ".json", ".xml", ".yaml", ".yml",
            ".zip", ".rar", ".7z"
    );
    private static final long MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

    public String saveFile(MultipartFile file) {
        validateFile(file);
        return uploadToMinio(file);
    }

    public String saveAttachment(MultipartFile file) {
        validateAttachment(file);
        return uploadToMinio(file);
    }

    private String uploadToMinio(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String objectName = UUID.randomUUID().toString() + extension;

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());
            log.debug("Uploaded file to MinIO: {}", objectName);
            return objectName;
        } catch (Exception e) {
            log.error("Failed to upload file to MinIO", e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    public String getPublicUrl(String objectName) {
        return publicUrl + "/" + bucket + "/" + objectName;
    }

    private void validateAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_ATTACHMENT_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }

        String contentType = file.getContentType();
        String extension = getExtension(file.getOriginalFilename()).toLowerCase();

        boolean allowedByType = contentType != null
                && (ALLOWED_ATTACHMENT_TYPES.contains(contentType)
                    || contentType.startsWith("text/"));
        boolean allowedByExtension = ALLOWED_ATTACHMENT_EXTENSIONS.contains(extension);

        if (!allowedByType && !allowedByExtension) {
            throw new IllegalArgumentException(
                "不支持的文件类型。支持：PDF、Word、Excel、PPT、TXT、JSON、XML、YAML、ZIP、RAR、7z");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, GIF, and WebP images are allowed");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".png";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    public void deleteFile(String objectName) {
        if (objectName == null || objectName.isEmpty()) {
            return;
        }
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build());
            log.debug("Deleted file from MinIO: {}", objectName);
        } catch (Exception e) {
            log.warn("Failed to delete file from MinIO: {}", objectName, e);
        }
    }
}
