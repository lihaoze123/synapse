package com.synapse.config;

import io.minio.BucketExistsArgs;
import io.minio.MinioClient;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@TestConfiguration
public class TestMinioConfig {

    @Bean
    @Primary
    public MinioClient minioClient() throws Exception {
        MinioClient mockClient = Mockito.mock(MinioClient.class);
        when(mockClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);
        return mockClient;
    }
}
