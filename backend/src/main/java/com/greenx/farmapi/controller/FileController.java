package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.service.FileStorageService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ApiResponse<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "uploads") String category,
            @RequestParam(value = "farmId", required = false) String farmId) {
        try {
            String path = fileStorageService.saveFile(file, category, farmId);
            Map<String, String> result = new HashMap<>();
            result.put("path", path);
            result.put("url", "/api/files" + path);
            return ApiResponse.success(result);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Invalid file type: " + e.getMessage());
        } catch (IOException e) {
            return ApiResponse.error("File upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/**")
    public void serveFile(HttpServletResponse response,
            jakarta.servlet.http.HttpServletRequest request) throws IOException {
        // Extract the path after /files/
        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String filePath = requestUri.replace(contextPath + "/files", "");

        Path path = fileStorageService.resolveFilePath(filePath);
        if (!Files.exists(path) || !Files.isReadable(path)) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        String contentType = Files.probeContentType(path);
        response.setContentType(contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE);
        Files.copy(path, response.getOutputStream());
    }
}
