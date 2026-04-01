package com.greenx.farmapi.service.impl;

import com.greenx.farmapi.service.DataService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DataServiceImpl implements DataService {

    private final JdbcTemplate jdbcTemplate;

    // Whitelist of allowed tables for security
    private static final Set<String> ALLOWED_TABLES = Set.of(
            "USERS", "FARMS", "ATTENDANCE", "TASKS", "FARM_ASSIGNMENTS",
            "EQUIPMENT_REQUESTS", "USER_ROLES", "PROFILES", "DIAGNOSTICS",
            "WEATHER", "FARM_DETAILS", "LAND_DOCUMENTS", "FARM_PHOTOS",
            "COSTS", "CROP_PLANS", "HARVESTS", "FARM_TIMELINE", "INVENTORY",
            "INVENTORY_TRANSACTIONS", "LAB_SAMPLES", "LAB_REPORTS", "WORKFLOW_EVENTS");

    @Override
    public List<Map<String, Object>> select(String tableName, Map<String, String> params) {
        if (!isTableAllowed(tableName)) {
            throw new IllegalArgumentException("Table not allowed: " + tableName);
        }

        StringBuilder sql = new StringBuilder("SELECT * FROM " + tableName.toUpperCase());
        List<Object> args = new ArrayList<>();

        // Build WHERE clause from params
        List<String> whereConditions = new ArrayList<>();

        // Handle null params
        if (params != null) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();

                if (key.equals("order") || key.equals("sort")) {
                    continue; // Handle these separately
                }

                if (key.endsWith("__gte")) {
                    String columnName = key.replace("__gte", "");
                    whereConditions.add(columnName.toUpperCase() + " >= ?");
                    args.add(value);
                } else if (key.endsWith("__lte")) {
                    String columnName = key.replace("__lte", "");
                    whereConditions.add(columnName.toUpperCase() + " <= ?");
                    args.add(value);
                } else {
                    whereConditions.add(key.toUpperCase() + " = ?");
                    args.add(value);
                }
            }

            if (!whereConditions.isEmpty()) {
                sql.append(" WHERE ").append(String.join(" AND ", whereConditions));
            }

            // Handle ORDER BY
            if (params.containsKey("order")) {
                String orderField = params.get("order").toUpperCase();
                String sortDirection = params.getOrDefault("sort", "asc").equalsIgnoreCase("desc") ? "DESC" : "ASC";
                sql.append(" ORDER BY ").append(orderField).append(" ").append(sortDirection);
            }
        }

        return jdbcTemplate.queryForList(sql.toString(), args.toArray());
    }

    @Override
    public Map<String, Object> insert(String tableName, Map<String, Object> data) {
        if (!isTableAllowed(tableName)) {
            throw new IllegalArgumentException("Table not allowed: " + tableName);
        }

        // Generate unique 10-digit FARM_CODE for FARMS table
        if (tableName.equalsIgnoreCase("FARMS") && !data.containsKey("farm_code")) {
            data.put("farm_code", generateFarmCode());
        }

        // Build INSERT statement
        Set<String> columns = data.keySet();
        String columnNames = columns.stream()
                .map(String::toUpperCase)
                .collect(Collectors.joining(", "));

        String placeholders = columns.stream()
                .map(c -> "?")
                .collect(Collectors.joining(", "));

        String sql = String.format("INSERT INTO %s (%s) VALUES (%s)",
                tableName.toUpperCase(), columnNames, placeholders);

        List<Object> args = new ArrayList<>(data.values());

        int result = jdbcTemplate.update(sql, args.toArray());

        if (result > 0) {
            return data; // Return the inserted data
        }

        throw new RuntimeException("Failed to insert into " + tableName);
    }

    /**
     * Generate a unique 10-digit farm code
     * Format: Uses timestamp in seconds + random component to ensure uniqueness
     */
    private String generateFarmCode() {
        // Use current time in seconds (last 8 digits) + 2 random digits
        long timestamp = System.currentTimeMillis() / 1000;
        int random = (int) (Math.random() * 100); // 00-99

        // Create 10-digit code: 8 digits from timestamp + 2 random digits
        String code = String.format("%08d%02d", timestamp % 100000000, random);

        // Ensure it's exactly 10 digits
        return code.substring(code.length() - 10);
    }

    @Override
    public Map<String, Object> update(String tableName, String id, Map<String, Object> data) {
        if (!isTableAllowed(tableName)) {
            throw new IllegalArgumentException("Table not allowed: " + tableName);
        }

        // Build UPDATE statement
        List<String> setClauses = new ArrayList<>();
        List<Object> args = new ArrayList<>();

        for (Map.Entry<String, Object> entry : data.entrySet()) {
            setClauses.add(entry.getKey().toUpperCase() + " = ?");
            args.add(entry.getValue());
        }

        args.add(id); // ID parameter for WHERE clause

        String sql = String.format("UPDATE %s SET %s WHERE ID = ?",
                tableName.toUpperCase(), String.join(", ", setClauses));

        int result = jdbcTemplate.update(sql, args.toArray());

        if (result > 0) {
            data.put("id", id);
            return data;
        }

        throw new RuntimeException("Failed to update " + tableName + " with ID: " + id);
    }

    @Override
    public void delete(String tableName, String id) {
        if (!isTableAllowed(tableName)) {
            throw new IllegalArgumentException("Table not allowed: " + tableName);
        }

        String sql = "DELETE FROM " + tableName.toUpperCase() + " WHERE ID = ?";

        int result = jdbcTemplate.update(sql, id);

        if (result == 0) {
            throw new RuntimeException("No record found with ID: " + id);
        }
    }

    private boolean isTableAllowed(String tableName) {
        return ALLOWED_TABLES.contains(tableName.toUpperCase());
    }
}
