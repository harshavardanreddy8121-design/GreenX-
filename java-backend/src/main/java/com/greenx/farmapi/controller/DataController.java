package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.service.DataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/data")
@RequiredArgsConstructor
public class DataController {
    
    private final DataService dataService;
    
    /**
     * GET all records from a table with optional filters
     * Query params: field=value, field__gte=value, order=field, sort=asc|desc
     */
    @GetMapping("/{tableName}")
    public ApiResponse<List<Map<String, Object>>> select(
            @PathVariable String tableName,
            @RequestParam(required = false) Map<String, String> params) {
        try {
            List<Map<String, Object>> results = dataService.select(tableName, params);
            return ApiResponse.success(results);
        } catch (Exception e) {
            return ApiResponse.error("Failed to select from " + tableName + ": " + e.getMessage());
        }
    }
    
    /**
     * POST - Insert a new record
     */
    @PostMapping("/{tableName}")
    public ApiResponse<Map<String, Object>> insert(
            @PathVariable String tableName,
            @RequestBody Map<String, Object> data) {
        try {
            Map<String, Object> result = dataService.insert(tableName, data);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to insert into " + tableName + ": " + e.getMessage());
        }
    }
    
    /**
     * PUT - Update a record by ID
     */
    @PutMapping("/{tableName}/{id}")
    public ApiResponse<Map<String, Object>> update(
            @PathVariable String tableName,
            @PathVariable String id,
            @RequestBody Map<String, Object> data) {
        try {
            Map<String, Object> result = dataService.update(tableName, id, data);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to update " + tableName + ": " + e.getMessage());
        }
    }
    
    /**
     * DELETE - Delete a record by ID
     */
    @DeleteMapping("/{tableName}/{id}")
    public ApiResponse<Void> delete(
            @PathVariable String tableName,
            @PathVariable String id) {
        try {
            dataService.delete(tableName, id);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete from " + tableName + ": " + e.getMessage());
        }
    }
}
