package com.greenx.farmapi.service;

import java.util.List;
import java.util.Map;

public interface DataService {
    List<Map<String, Object>> select(String tableName, Map<String, String> params);
    Map<String, Object> insert(String tableName, Map<String, Object> data);
    Map<String, Object> update(String tableName, String id, Map<String, Object> data);
    void delete(String tableName, String id);
}
