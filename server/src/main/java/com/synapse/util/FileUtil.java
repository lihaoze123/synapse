package com.synapse.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Component
public class FileUtil {

    private static final String UPLOAD_DIR = "uploads";
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );
    private static final long MAX_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_ATTACHMENT_TYPES = Set.of(
            // Documents
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            // Code/Data
            "application/json",
            "application/xml",
            "text/xml",
            "text/yaml",
            "text/x-yaml",
            "application/x-yaml",
            // Archives
            "application/zip",
            "application/x-zip-compressed",
            "application/x-rar-compressed",
            "application/x-7z-compressed"
    );
    private static final long MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

    public FileUtil() {
        createUploadDirectory();
    }

    private void createUploadDirectory() {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            try {
                Files.createDirectories(uploadPath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to create upload directory", e);
            }
        }
    }

    public String saveFile(MultipartFile file) throws IOException {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + extension;

        Path filePath = Paths.get(UPLOAD_DIR, newFilename);
        Files.copy(file.getInputStream(), filePath);

        return newFilename;
    }

    public String saveAttachment(MultipartFile file) throws IOException {
        validateAttachment(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + extension;

        Path filePath = Paths.get(UPLOAD_DIR, newFilename);
        Files.copy(file.getInputStream(), filePath);

        return newFilename;
    }

    private void validateAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_ATTACHMENT_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("Unknown file type");
        }

        boolean allowed = ALLOWED_ATTACHMENT_TYPES.contains(contentType)
                || contentType.startsWith("text/");

        if (!allowed) {
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

    public void deleteFile(String filename) {
        if (filename == null || filename.isEmpty()) {
            return;
        }
        try {
            Path filePath = Paths.get(UPLOAD_DIR, filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
        }
    }
}
