package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.service.DataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

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
            // Default to empty map if params is null
            Map<String, String> queryParams = params != null ? params : new HashMap<>();
            List<Map<String, Object>> results = dataService.select(tableName, queryParams);
            // Return empty list instead of null if no results found
            return ApiResponse.success(results != null ? results : Collections.emptyList());
        } catch (IllegalArgumentException e) {
            // Table not allowed or invalid parameter
            return ApiResponse.error("Invalid request: " + e.getMessage());
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            // No results found - this is not an error
            return ApiResponse.success(Collections.emptyList());
        } catch (org.springframework.jdbc.BadSqlGrammarException e) {
            // Table or column doesn't exist - return empty list instead of error
            System.err.println("SQL Error for table " + tableName + ": " + e.getMessage());
            return ApiResponse.success(Collections.emptyList());
        } catch (Exception e) {
            System.err.println("Error selecting from " + tableName + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of error for missing tables
            return ApiResponse.success(Collections.emptyList());
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
