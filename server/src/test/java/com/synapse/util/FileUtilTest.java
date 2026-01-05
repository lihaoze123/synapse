package com.synapse.util;

import io.minio.MinioClient;
import io.minio.ObjectWriteResponse;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("FileUtil Tests")
class FileUtilTest {

    @Mock
    private MinioClient minioClient;

    private FileUtil fileUtil;

    private static final String TEST_BUCKET = "test-bucket";
    private static final String TEST_PUBLIC_URL = "http://localhost:9000";

    @BeforeEach
    void setUp() {
        fileUtil = new FileUtil(minioClient);
        ReflectionTestUtils.setField(fileUtil, "bucket", TEST_BUCKET);
        ReflectionTestUtils.setField(fileUtil, "publicUrl", TEST_PUBLIC_URL);
    }

    @Test
    @DisplayName("saveFile should save valid JPEG image")
    void saveFile_shouldSaveValidJpeg() throws Exception {
        byte[] content = "test image content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveFile(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".jpg"));
        verify(minioClient).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("saveFile should save valid PNG image")
    void saveFile_shouldSaveValidPng() throws Exception {
        byte[] content = "test png content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveFile(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".png"));
    }

    @Test
    @DisplayName("saveFile should save valid GIF image")
    void saveFile_shouldSaveValidGif() throws Exception {
        byte[] content = "test gif content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.gif",
                "image/gif",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveFile(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".gif"));
    }

    @Test
    @DisplayName("saveFile should save valid WebP image")
    void saveFile_shouldSaveValidWebP() throws Exception {
        byte[] content = "test webp content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.webp",
                "image/webp",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveFile(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".webp"));
    }

    @Test
    @DisplayName("saveFile should generate unique filename using UUID")
    void saveFile_shouldGenerateUniqueFilename() throws Exception {
        byte[] content = "test content".getBytes();
        MockMultipartFile file1 = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                content
        );
        MockMultipartFile file2 = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename1 = fileUtil.saveFile(file1);
        String filename2 = fileUtil.saveFile(file2);

        assertNotNull(filename1);
        assertNotNull(filename2);
        assertFalse(filename1.equals(filename2));
    }

    @Test
    @DisplayName("saveFile should throw exception for null file")
    void saveFile_shouldThrowForNullFile() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> fileUtil.saveFile(null));
        assertEquals("File is empty", ex.getMessage());
    }

    @Test
    @DisplayName("saveFile should throw exception for empty file")
    void saveFile_shouldThrowForEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                new byte[0]
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> fileUtil.saveFile(file));
        assertEquals("File is empty", ex.getMessage());
    }

    @Test
    @DisplayName("saveFile should throw exception for file exceeding size limit")
    void saveFile_shouldThrowForOversizedFile() {
        byte[] largeContent = new byte[11 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                largeContent
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> fileUtil.saveFile(file));
        assertEquals("File size exceeds 10MB limit", ex.getMessage());
    }

    @Test
    @DisplayName("saveFile should throw exception for unsupported file type")
    void saveFile_shouldThrowForUnsupportedFileType() {
        byte[] content = "test content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.bmp",
                "image/bmp",
                content
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> fileUtil.saveFile(file));
        assertEquals("Only JPEG, PNG, GIF, and WebP images are allowed", ex.getMessage());
    }

    @Test
    @DisplayName("saveFile should default to .png for files without extension")
    void saveFile_shouldDefaultToPngForNoExtension() throws Exception {
        byte[] content = "test content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "noextension",
                "image/jpeg",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveFile(file);

        assertTrue(filename.endsWith(".png"));
    }

    @Test
    @DisplayName("deleteFile should delete existing file")
    void deleteFile_shouldDeleteExistingFile() throws Exception {
        doNothing().when(minioClient).removeObject(any(RemoveObjectArgs.class));

        fileUtil.deleteFile("test-file.jpg");

        verify(minioClient).removeObject(any(RemoveObjectArgs.class));
    }

    @Test
    @DisplayName("deleteFile should not throw for null filename")
    void deleteFile_shouldNotThrowForNullFilename() {
        assertDoesNotThrow(() -> fileUtil.deleteFile(null));
    }

    @Test
    @DisplayName("deleteFile should not throw for empty filename")
    void deleteFile_shouldNotThrowForEmptyFilename() {
        assertDoesNotThrow(() -> fileUtil.deleteFile(""));
    }

    @Test
    @DisplayName("getPublicUrl should return correct URL")
    void getPublicUrl_shouldReturnCorrectUrl() {
        String objectName = "test-uuid.jpg";
        String url = fileUtil.getPublicUrl(objectName);
        assertEquals(TEST_PUBLIC_URL + "/" + TEST_BUCKET + "/" + objectName, url);
    }

    @Test
    @DisplayName("saveAttachment should save valid PDF attachment")
    void saveAttachment_shouldSaveValidPdf() throws Exception {
        byte[] content = "test pdf content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".pdf"));
    }

    @Test
    @DisplayName("saveAttachment should save valid text file")
    void saveAttachment_shouldSaveValidTextFile() throws Exception {
        byte[] content = "test text content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".txt"));
    }

    @Test
    @DisplayName("saveAttachment should save valid JSON attachment")
    void saveAttachment_shouldSaveValidJson() throws Exception {
        byte[] content = "{\"test\": \"data\"}".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.json",
                "application/json",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".json"));
    }

    @Test
    @DisplayName("saveAttachment should save valid ZIP attachment")
    void saveAttachment_shouldSaveValidZip() throws Exception {
        byte[] content = "test zip content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.zip",
                "application/zip",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".zip"));
    }

    @Test
    @DisplayName("saveAttachment should throw for oversized attachment")
    void saveAttachment_shouldThrowForOversizedAttachment() {
        byte[] largeContent = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                largeContent
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> fileUtil.saveAttachment(file));
        assertEquals("File size exceeds 5MB limit", ex.getMessage());
    }

    @Test
    @DisplayName("saveAttachment should throw for unsupported attachment type")
    void saveAttachment_shouldThrowForUnsupportedAttachmentType() {
        byte[] content = "test content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.exe",
                "application/exe",
                content
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> fileUtil.saveAttachment(file));
        assertTrue(ex.getMessage().contains("不支持的文件类型"));
    }

    @Test
    @DisplayName("saveAttachment should allow files by extension when content type is octet-stream")
    void saveAttachment_shouldAllowByExtensionWhenOctetStream() throws Exception {
        byte[] content = "test doc content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.docx",
                "application/octet-stream",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".docx"));
    }

    @Test
    @DisplayName("saveAttachment should allow text files by text/* content type")
    void saveAttachment_shouldAllowTextFilesByContentType() throws Exception {
        byte[] content = "test yaml content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.yaml",
                "text/yaml",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".yaml"));
    }

    @Test
    @DisplayName("saveAttachment should allow YAML file by yml extension")
    void saveAttachment_shouldAllowYmlExtension() throws Exception {
        byte[] content = "test yaml content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.yml",
                "application/octet-stream",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".yml"));
    }

    @Test
    @DisplayName("saveAttachment should save Word document")
    void saveAttachment_shouldSaveWordDocument() throws Exception {
        byte[] content = "test doc content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".docx"));
    }

    @Test
    @DisplayName("saveAttachment should save Excel spreadsheet")
    void saveAttachment_shouldSaveExcelSpreadsheet() throws Exception {
        byte[] content = "test excel content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                content
        );

        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(mock(ObjectWriteResponse.class));

        String filename = fileUtil.saveAttachment(file);

        assertNotNull(filename);
        assertTrue(filename.endsWith(".xlsx"));
    }

    private void assertDoesNotThrow(Runnable runnable) {
        try {
            runnable.run();
        } catch (Exception e) {
            throw new AssertionError("Expected no exception, but got: " + e.getMessage(), e);
        }
    }
}
