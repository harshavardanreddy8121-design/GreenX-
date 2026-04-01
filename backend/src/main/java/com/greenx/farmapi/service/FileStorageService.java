package com.greenx.farmapi.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf");

    public String saveFile(MultipartFile file, String category, String farmId) throws IOException {
        if (file == null || file.isEmpty())
            return null;

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;

        Path dir = Paths.get(uploadDir, category, farmId != null ? farmId : "general");
        Files.createDirectories(dir);

        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String relPath = "/" + category + "/" + (farmId != null ? farmId + "/" : "") + filename;
        log.info("Saved file to: {}", target);
        return relPath;
    }

    public List<String> saveFiles(List<MultipartFile> files, String category, String farmId) throws IOException {
        List<String> paths = new ArrayList<>();
        if (files == null)
            return paths;
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty()) {
                paths.add(saveFile(f, category, farmId));
            }
        }
        return paths;
    }

    public Path resolveFilePath(String relativePath) {
        // Strip leading slash
        String clean = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
        return Paths.get(uploadDir).resolve(clean);
    }

    private String getExtension(String filename) {
        if (filename == null)
            return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot).toLowerCase() : ".jpg";
    }
}
