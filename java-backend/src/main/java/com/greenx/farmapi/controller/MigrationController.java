package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/migration")
@RequiredArgsConstructor
public class MigrationController {

    private final JdbcTemplate jdbcTemplate;

    @PostMapping("/init-schema")
    public ApiResponse<Map<String, Object>> initializeSchema() {
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS FARMS CASCADE");
            jdbcTemplate.execute("""
                        CREATE TABLE FARMS (
                            ID VARCHAR(36) PRIMARY KEY,
                            NAME VARCHAR(255) NOT NULL,
                            LOCATION VARCHAR(500),
                            VILLAGE VARCHAR(255),
                            PINCODE VARCHAR(10),
                            AREA_SQM NUMERIC(12, 2),
                            TOTAL_LAND NUMERIC(10, 2),
                            CROP VARCHAR(255),
                            GROWTH_STAGE VARCHAR(50),
                            CROP_HEALTH_SCORE NUMERIC(3, 0),
                            EXPECTED_REVENUE NUMERIC(15, 2),
                            PROFIT_SHARE NUMERIC(5, 2),
                            CONTRACT_SUMMARY VARCHAR(1000),
                            OWNER_ID VARCHAR(36),
                            CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                            CREATED_BY VARCHAR(36)
                        )
                    """);
            jdbcTemplate.execute("CREATE INDEX IDX_FARMS_OWNER_ID ON FARMS(OWNER_ID)");
            jdbcTemplate.execute("CREATE INDEX IDX_FARMS_VILLAGE ON FARMS(VILLAGE)");

            jdbcTemplate.execute("DROP TABLE IF EXISTS FARM_DETAILS CASCADE");
            jdbcTemplate.execute("""
                        CREATE TABLE FARM_DETAILS (
                            ID VARCHAR(36) PRIMARY KEY,
                            FARM_ID VARCHAR(36) NOT NULL,
                            SOIL_PH NUMERIC(4, 2),
                            SOIL_NITROGEN NUMERIC(10, 2),
                            SOIL_PHOSPHORUS NUMERIC(10, 2),
                            SOIL_POTASSIUM NUMERIC(10, 2),
                            SOIL_ORGANIC_CARBON NUMERIC(10, 2),
                            SOIL_MOISTURE NUMERIC(5, 2),
                            CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                        )
                    """);
            jdbcTemplate.execute("CREATE INDEX IDX_FARM_DETAILS_FARM_ID ON FARM_DETAILS(FARM_ID)");

            jdbcTemplate.execute("DROP TABLE IF EXISTS PROFILES CASCADE");
            jdbcTemplate.execute("""
                        CREATE TABLE PROFILES (
                            ID VARCHAR(36) PRIMARY KEY,
                            FULL_NAME VARCHAR(255),
                            PHONE VARCHAR(20),
                            AVATAR_URL VARCHAR(500),
                            CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                        )
                    """);

            jdbcTemplate.execute("DROP TABLE IF EXISTS TASKS CASCADE");
            jdbcTemplate.execute("""
                        CREATE TABLE TASKS (
                            ID VARCHAR(36) PRIMARY KEY,
                            FARM_ID VARCHAR(36) NOT NULL,
                            ASSIGNED_TO VARCHAR(36) NOT NULL,
                            TITLE VARCHAR(255) NOT NULL,
                            DESCRIPTION VARCHAR(2000),
                            STATUS VARCHAR(50) DEFAULT 'pending' NOT NULL,
                            DUE_DATE DATE,
                            PHOTO_REQUIRED CHAR(1) DEFAULT 'N',
                            CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                            CREATED_BY VARCHAR(36)
                        )
                    """);
            jdbcTemplate.execute("CREATE INDEX IDX_TASKS_FARM_ID ON TASKS(FARM_ID)");
            jdbcTemplate.execute("CREATE INDEX IDX_TASKS_ASSIGNED_TO ON TASKS(ASSIGNED_TO)");
            jdbcTemplate.execute("CREATE INDEX IDX_TASKS_STATUS ON TASKS(STATUS)");

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Database schema initialized successfully");
            result.put("tables_created", "FARMS, FARM_DETAILS, PROFILES, TASKS");
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to initialize schema: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> checkStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("farms", tableExists("farms") ? "exists" : "missing");
        status.put("profiles", tableExists("profiles") ? "exists" : "missing");
        status.put("tasks", tableExists("tasks") ? "exists" : "missing");
        status.put("farm_details", tableExists("farm_details") ? "exists" : "missing");
        return ApiResponse.success(status);
    }

    @PostMapping("/ensure-farm-details")
    public ApiResponse<Map<String, Object>> ensureFarmDetailsTable() {
        Map<String, Object> result = new HashMap<>();
        try {
            if (tableExists("farm_details")) {
                result.put("status", "exists");
                result.put("message", "FARM_DETAILS already exists");
                return ApiResponse.success(result);
            }
            jdbcTemplate.execute("""
                        CREATE TABLE FARM_DETAILS (
                            ID VARCHAR(36) PRIMARY KEY,
                            FARM_ID VARCHAR(36) NOT NULL,
                            SOIL_PH NUMERIC(4, 2),
                            SOIL_NITROGEN NUMERIC(10, 2),
                            SOIL_PHOSPHORUS NUMERIC(10, 2),
                            SOIL_POTASSIUM NUMERIC(10, 2),
                            SOIL_ORGANIC_CARBON NUMERIC(10, 2),
                            SOIL_MOISTURE NUMERIC(5, 2),
                            CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                        )
                    """);
            jdbcTemplate.execute("CREATE INDEX IDX_FARM_DETAILS_FARM_ID ON FARM_DETAILS(FARM_ID)");
            result.put("status", "created");
            result.put("message", "FARM_DETAILS created successfully");
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed ensuring FARM_DETAILS: " + e.getMessage());
        }
    }

    @PostMapping("/add-farm-code")
    public ApiResponse<Map<String, Object>> addFarmCodeColumn() {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean columnExists = Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                    "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='farm_code')",
                    Boolean.class));
            if (columnExists) {
                result.put("status", "exists");
                result.put("message", "FARM_CODE column already exists");
                return ApiResponse.success(result);
            }
            jdbcTemplate.execute("ALTER TABLE FARMS ADD FARM_CODE VARCHAR(10)");
            jdbcTemplate.execute("ALTER TABLE FARMS ADD CONSTRAINT UK_FARMS_FARM_CODE UNIQUE (FARM_CODE)");
            jdbcTemplate.execute("CREATE INDEX IDX_FARMS_FARM_CODE ON FARMS(FARM_CODE)");
            result.put("status", "success");
            result.put("message", "FARM_CODE column added successfully");
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to add FARM_CODE column: " + e.getMessage());
        }
    }

    @PostMapping("/apply-landowner-features")
    public ApiResponse<Map<String, Object>> applyLandownerFeatures() {
        Map<String, Object> result = new HashMap<>();
        int tablesCreated = 0;
        try {
            if (!tableExists("land_documents")) {
                jdbcTemplate.execute("""
                            CREATE TABLE LAND_DOCUMENTS (
                                ID VARCHAR(36) PRIMARY KEY,
                                FARM_ID VARCHAR(36) NOT NULL,
                                DOCUMENT_TYPE VARCHAR(100) NOT NULL,
                                DOCUMENT_NAME VARCHAR(255) NOT NULL,
                                FILE_URL VARCHAR(1000) NOT NULL,
                                FILE_SIZE NUMERIC(12),
                                MIME_TYPE VARCHAR(100),
                                UPLOADED_BY VARCHAR(36) NOT NULL,
                                VERIFIED CHAR(1) DEFAULT 'N',
                                VERIFIED_BY VARCHAR(36),
                                VERIFIED_AT TIMESTAMP,
                                NOTES VARCHAR(500),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_LAND_DOCS_FARM_ID ON LAND_DOCUMENTS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_LAND_DOCS_TYPE ON LAND_DOCUMENTS(DOCUMENT_TYPE)");
                tablesCreated++;
            }
            if (!tableExists("farm_photos")) {
                jdbcTemplate.execute("""
                            CREATE TABLE FARM_PHOTOS (
                                ID VARCHAR(36) PRIMARY KEY,
                                FARM_ID VARCHAR(36) NOT NULL,
                                PHOTO_URL VARCHAR(1000) NOT NULL,
                                PHOTO_TYPE VARCHAR(100),
                                CAPTION VARCHAR(500),
                                UPLOADED_BY VARCHAR(36) NOT NULL,
                                UPLOADER_ROLE VARCHAR(50),
                                LATITUDE NUMERIC(10, 7),
                                LONGITUDE NUMERIC(10, 7),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_FARM_PHOTOS_FARM_ID ON FARM_PHOTOS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_FARM_PHOTOS_TYPE ON FARM_PHOTOS(PHOTO_TYPE)");
                tablesCreated++;
            }
            if (!tableExists("costs")) {
                jdbcTemplate.execute("""
                            CREATE TABLE COSTS (
                                ID VARCHAR(36) PRIMARY KEY,
                                FARM_ID VARCHAR(36) NOT NULL,
                                COST_CATEGORY VARCHAR(100) NOT NULL,
                                DESCRIPTION VARCHAR(500),
                                AMOUNT NUMERIC(15, 2) NOT NULL,
                                CURRENCY VARCHAR(10) DEFAULT 'INR',
                                DATE_INCURRED DATE NOT NULL,
                                RECEIPT_URL VARCHAR(1000),
                                APPROVED CHAR(1) DEFAULT 'N',
                                APPROVED_BY VARCHAR(36),
                                APPROVED_AT TIMESTAMP,
                                ENTERED_BY VARCHAR(36) NOT NULL,
                                NOTES VARCHAR(1000),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_COSTS_FARM_ID ON COSTS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_COSTS_CATEGORY ON COSTS(COST_CATEGORY)");
                tablesCreated++;
            }
            if (!tableExists("crop_plans")) {
                jdbcTemplate.execute("""
                            CREATE TABLE CROP_PLANS (
                                ID VARCHAR(36) PRIMARY KEY,
                                FARM_ID VARCHAR(36) NOT NULL,
                                EXPERT_ID VARCHAR(36) NOT NULL,
                                CROP_NAME VARCHAR(255) NOT NULL,
                                SEASON VARCHAR(50),
                                PLANTING_DATE DATE,
                                EXPECTED_HARVEST_DATE DATE,
                                EXPECTED_YIELD NUMERIC(12, 2),
                                EXPECTED_REVENUE NUMERIC(15, 2),
                                FERTILIZER_PLAN VARCHAR(2000),
                                PESTICIDE_PLAN VARCHAR(2000),
                                IRRIGATION_PLAN VARCHAR(2000),
                                RATIONALE VARCHAR(2000),
                                STATUS VARCHAR(50) DEFAULT 'pending',
                                APPROVED_BY VARCHAR(36),
                                APPROVED_AT TIMESTAMP,
                                REJECTION_REASON VARCHAR(1000),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_CROP_PLANS_FARM_ID ON CROP_PLANS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_CROP_PLANS_STATUS ON CROP_PLANS(STATUS)");
                tablesCreated++;
            }
            if (!tableExists("harvests")) {
                jdbcTemplate.execute("""
                            CREATE TABLE HARVESTS (
                                ID VARCHAR(36) PRIMARY KEY,
                                FARM_ID VARCHAR(36) NOT NULL,
                                CROP_PLAN_ID VARCHAR(36),
                                CROP_NAME VARCHAR(255) NOT NULL,
                                HARVEST_DATE DATE NOT NULL,
                                YIELD_QUANTITY NUMERIC(12, 2) NOT NULL,
                                YIELD_UNIT VARCHAR(20) DEFAULT 'kg',
                                YIELD_PER_ACRE NUMERIC(12, 2),
                                QUALITY_GRADE VARCHAR(50),
                                SALE_PRICE NUMERIC(15, 2),
                                SALE_PRICE_PER_UNIT NUMERIC(12, 2),
                                BUYER_NAME VARCHAR(255),
                                BUYER_TYPE VARCHAR(100),
                                EXPORT_COUNTRY VARCHAR(100),
                                STORAGE_LOCATION VARCHAR(500),
                                TRANSPORT_COST NUMERIC(12, 2),
                                TOTAL_COSTS NUMERIC(15, 2),
                                REVENUE NUMERIC(15, 2),
                                PROFIT NUMERIC(15, 2),
                                LANDOWNER_SHARE NUMERIC(15, 2),
                                GREENX_SHARE NUMERIC(15, 2),
                                PAYMENT_STATUS VARCHAR(50) DEFAULT 'pending',
                                PAYMENT_DATE DATE,
                                RECORDED_BY VARCHAR(36) NOT NULL,
                                NOTES VARCHAR(2000),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_HARVESTS_FARM_ID ON HARVESTS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_HARVESTS_DATE ON HARVESTS(HARVEST_DATE)");
                tablesCreated++;
            }
            if (!tableExists("farm_timeline")) {
                jdbcTemplate.execute("""
                            CREATE TABLE FARM_TIMELINE (
                                ID VARCHAR(36) PRIMARY KEY,
                                FARM_ID VARCHAR(36) NOT NULL,
                                EVENT_TYPE VARCHAR(100) NOT NULL,
                                EVENT_TITLE VARCHAR(255) NOT NULL,
                                EVENT_DESCRIPTION VARCHAR(2000),
                                REFERENCE_ID VARCHAR(36),
                                REFERENCE_TABLE VARCHAR(100),
                                ICON VARCHAR(50),
                                USER_ID VARCHAR(36),
                                USER_NAME VARCHAR(255),
                                USER_ROLE VARCHAR(50),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_TIMELINE_FARM_ID ON FARM_TIMELINE(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_TIMELINE_EVENT_TYPE ON FARM_TIMELINE(EVENT_TYPE)");
                tablesCreated++;
            }
            if (!tableExists("inventory")) {
                jdbcTemplate.execute("""
                            CREATE TABLE INVENTORY (
                                ID VARCHAR(36) PRIMARY KEY,
                                ITEM_TYPE VARCHAR(100) NOT NULL,
                                ITEM_NAME VARCHAR(255) NOT NULL,
                                ITEM_CODE VARCHAR(50),
                                BRAND VARCHAR(255),
                                UNIT VARCHAR(50),
                                QUANTITY_IN_STOCK NUMERIC(12, 2) DEFAULT 0,
                                REORDER_LEVEL NUMERIC(12, 2),
                                UNIT_COST NUMERIC(12, 2),
                                STORAGE_LOCATION VARCHAR(255),
                                EXPIRY_DATE DATE,
                                SUPPLIER_NAME VARCHAR(255),
                                SUPPLIER_CONTACT VARCHAR(100),
                                NOTES VARCHAR(1000),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_INVENTORY_TYPE ON INVENTORY(ITEM_TYPE)");
                jdbcTemplate.execute("CREATE INDEX IDX_INVENTORY_NAME ON INVENTORY(ITEM_NAME)");
                tablesCreated++;
            }
            if (!tableExists("inventory_transactions")) {
                jdbcTemplate.execute("""
                            CREATE TABLE INVENTORY_TRANSACTIONS (
                                ID VARCHAR(36) PRIMARY KEY,
                                INVENTORY_ID VARCHAR(36) NOT NULL,
                                FARM_ID VARCHAR(36),
                                TRANSACTION_TYPE VARCHAR(20) NOT NULL,
                                QUANTITY NUMERIC(12, 2) NOT NULL,
                                UNIT VARCHAR(50),
                                COST_TOTAL NUMERIC(12, 2),
                                TRANSACTION_DATE TIMESTAMP DEFAULT NOW() NOT NULL,
                                PERFORMED_BY VARCHAR(36) NOT NULL,
                                PURPOSE VARCHAR(500),
                                REFERENCE_TASK_ID VARCHAR(36),
                                NOTES VARCHAR(1000),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_INV_TRANS_INVENTORY ON INVENTORY_TRANSACTIONS(INVENTORY_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_INV_TRANS_FARM ON INVENTORY_TRANSACTIONS(FARM_ID)");
                tablesCreated++;
            }
            if (!tableExists("lab_samples")) {
                jdbcTemplate.execute("""
                            CREATE TABLE LAB_SAMPLES (
                                ID VARCHAR(36) PRIMARY KEY,
                                SAMPLE_CODE VARCHAR(50) UNIQUE NOT NULL,
                                FARM_ID VARCHAR(36) NOT NULL,
                                SAMPLE_TYPE VARCHAR(100) NOT NULL,
                                COLLECTION_DATE DATE NOT NULL,
                                COLLECTED_BY VARCHAR(36) NOT NULL,
                                SUBMITTED_DATE DATE,
                                LOCATION_DESCRIPTION VARCHAR(500),
                                TEST_REQUESTED VARCHAR(500),
                                PRIORITY VARCHAR(50) DEFAULT 'normal',
                                STATUS VARCHAR(50) DEFAULT 'collected',
                                ASSIGNED_TECHNICIAN VARCHAR(255),
                                EXPECTED_COMPLETION_DATE DATE,
                                ACTUAL_COMPLETION_DATE DATE,
                                NOTES VARCHAR(2000),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_LAB_SAMPLES_FARM_ID ON LAB_SAMPLES(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_LAB_SAMPLES_STATUS ON LAB_SAMPLES(STATUS)");
                tablesCreated++;
            }
            if (!tableExists("lab_reports")) {
                jdbcTemplate.execute("""
                            CREATE TABLE LAB_REPORTS (
                                ID VARCHAR(36) PRIMARY KEY,
                                SAMPLE_ID VARCHAR(36) NOT NULL,
                                FARM_ID VARCHAR(36) NOT NULL,
                                REPORT_DATE DATE NOT NULL,
                                TEST_RESULTS TEXT,
                                NPK_NITROGEN NUMERIC(10, 2),
                                NPK_PHOSPHORUS NUMERIC(10, 2),
                                NPK_POTASSIUM NUMERIC(10, 2),
                                SOIL_PH NUMERIC(4, 2),
                                ORGANIC_CARBON NUMERIC(10, 2),
                                SOIL_TEXTURE VARCHAR(100),
                                PATHOGEN_DETECTED VARCHAR(500),
                                DISEASE_NAME VARCHAR(255),
                                SEVERITY VARCHAR(50),
                                RECOMMENDATIONS TEXT,
                                FERTILIZER_PRESCRIPTION VARCHAR(2000),
                                TREATMENT_PRESCRIPTION VARCHAR(2000),
                                GENERATED_BY VARCHAR(255),
                                REVIEWED_BY VARCHAR(36),
                                REPORT_URL VARCHAR(1000),
                                CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_LAB_REPORTS_SAMPLE_ID ON LAB_REPORTS(SAMPLE_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_LAB_REPORTS_FARM_ID ON LAB_REPORTS(FARM_ID)");
                tablesCreated++;
            }

            result.put("status", "success");
            result.put("tables_created", tablesCreated);
            result.put("message", "Landowner features migration applied: " + tablesCreated + " tables created");
            return ApiResponse.success(result);
        } catch (Exception e) {
            result.put("status", "error");
            result.put("tables_created", tablesCreated);
            result.put("error", e.getMessage());
            return ApiResponse.error("Migration failed after creating " + tablesCreated + " tables: " + e.getMessage());
        }
    }

    @PostMapping("/ensure-workflow-events")
    public ApiResponse<Map<String, Object>> ensureWorkflowEventsTable() {
        Map<String, Object> result = new HashMap<>();
        try {
            if (tableExists("workflow_events")) {
                result.put("status", "exists");
                result.put("message", "WORKFLOW_EVENTS already exists");
                return ApiResponse.success(result);
            }
            jdbcTemplate.execute("""
                    CREATE TABLE WORKFLOW_EVENTS (
                        ID VARCHAR(36) PRIMARY KEY,
                        FARM_ID VARCHAR(36) NOT NULL,
                        EVENT_KEY VARCHAR(100) NOT NULL,
                        STATUS VARCHAR(20) NOT NULL,
                        DONE_BY VARCHAR(50),
                        NOTE VARCHAR(2000),
                        CREATED_AT TIMESTAMP DEFAULT NOW() NOT NULL,
                        UPDATED_AT TIMESTAMP DEFAULT NOW() NOT NULL
                    )
                    """);
            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX UQ_WORKFLOW_EVENTS_FARM_EVENT ON WORKFLOW_EVENTS(FARM_ID, EVENT_KEY)");
            jdbcTemplate.execute("CREATE INDEX IDX_WORKFLOW_EVENTS_FARM_ID ON WORKFLOW_EVENTS(FARM_ID)");
            jdbcTemplate.execute("CREATE INDEX IDX_WORKFLOW_EVENTS_STATUS ON WORKFLOW_EVENTS(STATUS)");
            jdbcTemplate.execute(
                    "ALTER TABLE WORKFLOW_EVENTS ADD CONSTRAINT CK_WORKFLOW_EVENTS_STATUS CHECK (STATUS IN ('pending', 'in-progress', 'completed'))");

            result.put("status", "created");
            result.put("message", "WORKFLOW_EVENTS created successfully");
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to ensure WORKFLOW_EVENTS: " + e.getMessage());
        }
    }

    private boolean tableExists(String tableName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?",
                    Integer.class,
                    tableName.toLowerCase());
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

}

    @PostMapping("/init-schema")
    public ApiResponse<Map<String, Object>> initializeSchema() {
        try {
            // Create FARMS table
            jdbcTemplate.execute("""
                        BEGIN
                           EXECUTE IMMEDIATE 'DROP TABLE FARMS CASCADE CONSTRAINTS';
                        EXCEPTION WHEN OTHERS THEN NULL;
                        END;
                    """);

            jdbcTemplate.execute("""
                        CREATE TABLE FARMS (
                            ID VARCHAR2(36) PRIMARY KEY,
                            NAME VARCHAR2(255) NOT NULL,
                            LOCATION VARCHAR2(500),
                            VILLAGE VARCHAR2(255),
                            PINCODE VARCHAR2(10),
                            AREA_SQM NUMBER(12, 2),
                            TOTAL_LAND NUMBER(10, 2),
                            CROP VARCHAR2(255),
                            GROWTH_STAGE VARCHAR2(50),
                            CROP_HEALTH_SCORE NUMBER(3, 0),
                            EXPECTED_REVENUE NUMBER(15, 2),
                            PROFIT_SHARE NUMBER(5, 2),
                            CONTRACT_SUMMARY VARCHAR2(1000),
                            OWNER_ID VARCHAR2(36),
                            CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                            CREATED_BY VARCHAR2(36)
                        )
                    """);

            jdbcTemplate.execute("CREATE INDEX IDX_FARMS_OWNER_ID ON FARMS(OWNER_ID)");
            jdbcTemplate.execute("CREATE INDEX IDX_FARMS_VILLAGE ON FARMS(VILLAGE)");

            // Create FARM_DETAILS table
            jdbcTemplate.execute("""
                        BEGIN
                           EXECUTE IMMEDIATE 'DROP TABLE FARM_DETAILS CASCADE CONSTRAINTS';
                        EXCEPTION WHEN OTHERS THEN NULL;
                        END;
                    """);

            jdbcTemplate.execute("""
                        CREATE TABLE FARM_DETAILS (
                            ID VARCHAR2(36) PRIMARY KEY,
                            FARM_ID VARCHAR2(36) NOT NULL,
                            SOIL_PH NUMBER(4, 2),
                            SOIL_NITROGEN NUMBER(10, 2),
                            SOIL_PHOSPHORUS NUMBER(10, 2),
                            SOIL_POTASSIUM NUMBER(10, 2),
                            SOIL_ORGANIC_CARBON NUMBER(10, 2),
                            SOIL_MOISTURE NUMBER(5, 2),
                            CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                        )
                    """);

            jdbcTemplate.execute("CREATE INDEX IDX_FARM_DETAILS_FARM_ID ON FARM_DETAILS(FARM_ID)");

            // Create PROFILES table
            jdbcTemplate.execute("""
                        BEGIN
                           EXECUTE IMMEDIATE 'DROP TABLE PROFILES CASCADE CONSTRAINTS';
                        EXCEPTION WHEN OTHERS THEN NULL;
                        END;
                    """);

            jdbcTemplate.execute("""
                        CREATE TABLE PROFILES (
                            ID VARCHAR2(36) PRIMARY KEY,
                            FULL_NAME VARCHAR2(255),
                            PHONE VARCHAR2(20),
                            AVATAR_URL VARCHAR2(500),
                            CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                        )
                    """);

            // Create TASKS table
            jdbcTemplate.execute("""
                        BEGIN
                           EXECUTE IMMEDIATE 'DROP TABLE TASKS CASCADE CONSTRAINTS';
                        EXCEPTION WHEN OTHERS THEN NULL;
                        END;
                    """);

            jdbcTemplate.execute("""
                        CREATE TABLE TASKS (
                            ID VARCHAR2(36) PRIMARY KEY,
                            FARM_ID VARCHAR2(36) NOT NULL,
                            ASSIGNED_TO VARCHAR2(36) NOT NULL,
                            TITLE VARCHAR2(255) NOT NULL,
                            DESCRIPTION VARCHAR2(2000),
                            STATUS VARCHAR2(50) DEFAULT 'pending' NOT NULL,
                            DUE_DATE DATE,
                            PHOTO_REQUIRED CHAR(1) DEFAULT 'N',
                            CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                            CREATED_BY VARCHAR2(36)
                        )
                    """);

            jdbcTemplate.execute("CREATE INDEX IDX_TASKS_FARM_ID ON TASKS(FARM_ID)");
            jdbcTemplate.execute("CREATE INDEX IDX_TASKS_ASSIGNED_TO ON TASKS(ASSIGNED_TO)");
            jdbcTemplate.execute("CREATE INDEX IDX_TASKS_STATUS ON TASKS(STATUS)");

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Database schema initialized successfully");
            result.put("tables_created", "FARMS, FARM_DETAILS, PROFILES, TASKS");

            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to initialize schema: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> checkStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            jdbcTemplate.queryForList("SELECT * FROM FARMS WHERE ROWNUM <= 1");
            status.put("farms", "exists");
        } catch (Exception e) {
            status.put("farms", "missing");
        }

        try {
            jdbcTemplate.queryForList("SELECT * FROM PROFILES WHERE ROWNUM <= 1");
            status.put("profiles", "exists");
        } catch (Exception e) {
            status.put("profiles", "missing");
        }

        try {
            jdbcTemplate.queryForList("SELECT * FROM TASKS WHERE ROWNUM <= 1");
            status.put("tasks", "exists");
        } catch (Exception e) {
            status.put("tasks", "missing");
        }

        try {
            jdbcTemplate.queryForList("SELECT * FROM FARM_DETAILS WHERE ROWNUM <= 1");
            status.put("farm_details", "exists");
        } catch (Exception e) {
            status.put("farm_details", "missing");
        }

        return ApiResponse.success(status);
    }

    @PostMapping("/ensure-farm-details")
    public ApiResponse<Map<String, Object>> ensureFarmDetailsTable() {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME = 'FARM_DETAILS'",
                    Integer.class);

            if (count != null && count > 0) {
                result.put("status", "exists");
                result.put("message", "FARM_DETAILS already exists");
                return ApiResponse.success(result);
            }

            jdbcTemplate.execute("""
                        CREATE TABLE FARM_DETAILS (
                            ID VARCHAR2(36) PRIMARY KEY,
                            FARM_ID VARCHAR2(36) NOT NULL,
                            SOIL_PH NUMBER(4, 2),
                            SOIL_NITROGEN NUMBER(10, 2),
                            SOIL_PHOSPHORUS NUMBER(10, 2),
                            SOIL_POTASSIUM NUMBER(10, 2),
                            SOIL_ORGANIC_CARBON NUMBER(10, 2),
                            SOIL_MOISTURE NUMBER(5, 2),
                            CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                            UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                        )
                    """);

            jdbcTemplate.execute("CREATE INDEX IDX_FARM_DETAILS_FARM_ID ON FARM_DETAILS(FARM_ID)");

            result.put("status", "created");
            result.put("message", "FARM_DETAILS created successfully");
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed ensuring FARM_DETAILS: " + e.getMessage());
        }
    }

    @PostMapping("/add-farm-code")
    public ApiResponse<Map<String, Object>> addFarmCodeColumn() {
        Map<String, Object> result = new HashMap<>();
        try {
            // Check if FARM_CODE column already exists
            try {
                jdbcTemplate.queryForList("SELECT FARM_CODE FROM FARMS WHERE ROWNUM = 1");
                result.put("status", "exists");
                result.put("message", "FARM_CODE column already exists");
                return ApiResponse.success(result);
            } catch (Exception e) {
                // Column doesn't exist, add it
            }

            // Add FARM_CODE column
            jdbcTemplate.execute("ALTER TABLE FARMS ADD FARM_CODE VARCHAR2(10)");

            // Add unique constraint
            jdbcTemplate.execute("ALTER TABLE FARMS ADD CONSTRAINT UK_FARMS_FARM_CODE UNIQUE (FARM_CODE)");

            // Add index
            jdbcTemplate.execute("CREATE INDEX IDX_FARMS_FARM_CODE ON FARMS(FARM_CODE)");

            // Add comment
            jdbcTemplate.execute(
                    "COMMENT ON COLUMN FARMS.FARM_CODE IS 'Unique 10-digit numeric identifier for easy reference'");

            result.put("status", "success");
            result.put("message", "FARM_CODE column added successfully");
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to add FARM_CODE column: " + e.getMessage());
        }
    }

    @PostMapping("/apply-landowner-features")
    public ApiResponse<Map<String, Object>> applyLandownerFeatures() {
        Map<String, Object> result = new HashMap<>();
        int tablesCreated = 0;

        try {
            // 1. LAND_DOCUMENTS
            if (!tableExists("LAND_DOCUMENTS")) {
                jdbcTemplate.execute("""
                            CREATE TABLE LAND_DOCUMENTS (
                                ID VARCHAR2(36) PRIMARY KEY,
                                FARM_ID VARCHAR2(36) NOT NULL,
                                DOCUMENT_TYPE VARCHAR2(100) NOT NULL,
                                DOCUMENT_NAME VARCHAR2(255) NOT NULL,
                                FILE_URL VARCHAR2(1000) NOT NULL,
                                FILE_SIZE NUMBER(12),
                                MIME_TYPE VARCHAR2(100),
                                UPLOADED_BY VARCHAR2(36) NOT NULL,
                                VERIFIED CHAR(1) DEFAULT 'N',
                                VERIFIED_BY VARCHAR2(36),
                                VERIFIED_AT TIMESTAMP,
                                NOTES VARCHAR2(500),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_LAND_DOCS_FARM_ID ON LAND_DOCUMENTS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_LAND_DOCS_TYPE ON LAND_DOCUMENTS(DOCUMENT_TYPE)");
                tablesCreated++;
            }

            // 2. FARM_PHOTOS
            if (!tableExists("FARM_PHOTOS")) {
                jdbcTemplate.execute("""
                            CREATE TABLE FARM_PHOTOS (
                                ID VARCHAR2(36) PRIMARY KEY,
                                FARM_ID VARCHAR2(36) NOT NULL,
                                PHOTO_URL VARCHAR2(1000) NOT NULL,
                                PHOTO_TYPE VARCHAR2(100),
                                CAPTION VARCHAR2(500),
                                UPLOADED_BY VARCHAR2(36) NOT NULL,
                                UPLOADER_ROLE VARCHAR2(50),
                                LATITUDE NUMBER(10, 7),
                                LONGITUDE NUMBER(10, 7),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_FARM_PHOTOS_FARM_ID ON FARM_PHOTOS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_FARM_PHOTOS_TYPE ON FARM_PHOTOS(PHOTO_TYPE)");
                tablesCreated++;
            }

            // 3. COSTS
            if (!tableExists("COSTS")) {
                jdbcTemplate.execute("""
                            CREATE TABLE COSTS (
                                ID VARCHAR2(36) PRIMARY KEY,
                                FARM_ID VARCHAR2(36) NOT NULL,
                                COST_CATEGORY VARCHAR2(100) NOT NULL,
                                DESCRIPTION VARCHAR2(500),
                                AMOUNT NUMBER(15, 2) NOT NULL,
                                CURRENCY VARCHAR2(10) DEFAULT 'INR',
                                DATE_INCURRED DATE NOT NULL,
                                RECEIPT_URL VARCHAR2(1000),
                                APPROVED CHAR(1) DEFAULT 'N',
                                APPROVED_BY VARCHAR2(36),
                                APPROVED_AT TIMESTAMP,
                                ENTERED_BY VARCHAR2(36) NOT NULL,
                                NOTES VARCHAR2(1000),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_COSTS_FARM_ID ON COSTS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_COSTS_CATEGORY ON COSTS(COST_CATEGORY)");
                tablesCreated++;
            }

            // 4. CROP_PLANS
            if (!tableExists("CROP_PLANS")) {
                jdbcTemplate.execute("""
                            CREATE TABLE CROP_PLANS (
                                ID VARCHAR2(36) PRIMARY KEY,
                                FARM_ID VARCHAR2(36) NOT NULL,
                                EXPERT_ID VARCHAR2(36) NOT NULL,
                                CROP_NAME VARCHAR2(255) NOT NULL,
                                SEASON VARCHAR2(50),
                                PLANTING_DATE DATE,
                                EXPECTED_HARVEST_DATE DATE,
                                EXPECTED_YIELD NUMBER(12, 2),
                                EXPECTED_REVENUE NUMBER(15, 2),
                                FERTILIZER_PLAN VARCHAR2(2000),
                                PESTICIDE_PLAN VARCHAR2(2000),
                                IRRIGATION_PLAN VARCHAR2(2000),
                                RATIONALE VARCHAR2(2000),
                                STATUS VARCHAR2(50) DEFAULT 'pending',
                                APPROVED_BY VARCHAR2(36),
                                APPROVED_AT TIMESTAMP,
                                REJECTION_REASON VARCHAR2(1000),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_CROP_PLANS_FARM_ID ON CROP_PLANS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_CROP_PLANS_STATUS ON CROP_PLANS(STATUS)");
                tablesCreated++;
            }

            // 5. HARVESTS
            if (!tableExists("HARVESTS")) {
                jdbcTemplate.execute("""
                            CREATE TABLE HARVESTS (
                                ID VARCHAR2(36) PRIMARY KEY,
                                FARM_ID VARCHAR2(36) NOT NULL,
                                CROP_PLAN_ID VARCHAR2(36),
                                CROP_NAME VARCHAR2(255) NOT NULL,
                                HARVEST_DATE DATE NOT NULL,
                                YIELD_QUANTITY NUMBER(12, 2) NOT NULL,
                                YIELD_UNIT VARCHAR2(20) DEFAULT 'kg',
                                YIELD_PER_ACRE NUMBER(12, 2),
                                QUALITY_GRADE VARCHAR2(50),
                                SALE_PRICE NUMBER(15, 2),
                                SALE_PRICE_PER_UNIT NUMBER(12, 2),
                                BUYER_NAME VARCHAR2(255),
                                BUYER_TYPE VARCHAR2(100),
                                EXPORT_COUNTRY VARCHAR2(100),
                                STORAGE_LOCATION VARCHAR2(500),
                                TRANSPORT_COST NUMBER(12, 2),
                                TOTAL_COSTS NUMBER(15, 2),
                                REVENUE NUMBER(15, 2),
                                PROFIT NUMBER(15, 2),
                                LANDOWNER_SHARE NUMBER(15, 2),
                                GREENX_SHARE NUMBER(15, 2),
                                PAYMENT_STATUS VARCHAR2(50) DEFAULT 'pending',
                                PAYMENT_DATE DATE,
                                RECORDED_BY VARCHAR2(36) NOT NULL,
                                NOTES VARCHAR2(2000),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_HARVESTS_FARM_ID ON HARVESTS(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_HARVESTS_DATE ON HARVESTS(HARVEST_DATE)");
                tablesCreated++;
            }

            // 6. FARM_TIMELINE
            if (!tableExists("FARM_TIMELINE")) {
                jdbcTemplate.execute("""
                            CREATE TABLE FARM_TIMELINE (
                                ID VARCHAR2(36) PRIMARY KEY,
                                FARM_ID VARCHAR2(36) NOT NULL,
                                EVENT_TYPE VARCHAR2(100) NOT NULL,
                                EVENT_TITLE VARCHAR2(255) NOT NULL,
                                EVENT_DESCRIPTION VARCHAR2(2000),
                                REFERENCE_ID VARCHAR2(36),
                                REFERENCE_TABLE VARCHAR2(100),
                                ICON VARCHAR2(50),
                                USER_ID VARCHAR2(36),
                                USER_NAME VARCHAR2(255),
                                USER_ROLE VARCHAR2(50),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_TIMELINE_FARM_ID ON FARM_TIMELINE(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_TIMELINE_EVENT_TYPE ON FARM_TIMELINE(EVENT_TYPE)");
                tablesCreated++;
            }

            // 7. INVENTORY
            if (!tableExists("INVENTORY")) {
                jdbcTemplate.execute("""
                            CREATE TABLE INVENTORY (
                                ID VARCHAR2(36) PRIMARY KEY,
                                ITEM_TYPE VARCHAR2(100) NOT NULL,
                                ITEM_NAME VARCHAR2(255) NOT NULL,
                                ITEM_CODE VARCHAR2(50),
                                BRAND VARCHAR2(255),
                                UNIT VARCHAR2(50),
                                QUANTITY_IN_STOCK NUMBER(12, 2) DEFAULT 0,
                                REORDER_LEVEL NUMBER(12, 2),
                                UNIT_COST NUMBER(12, 2),
                                STORAGE_LOCATION VARCHAR2(255),
                                EXPIRY_DATE DATE,
                                SUPPLIER_NAME VARCHAR2(255),
                                SUPPLIER_CONTACT VARCHAR2(100),
                                NOTES VARCHAR2(1000),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_INVENTORY_TYPE ON INVENTORY(ITEM_TYPE)");
                jdbcTemplate.execute("CREATE INDEX IDX_INVENTORY_NAME ON INVENTORY(ITEM_NAME)");
                tablesCreated++;
            }

            // 8. INVENTORY_TRANSACTIONS
            if (!tableExists("INVENTORY_TRANSACTIONS")) {
                jdbcTemplate.execute("""
                            CREATE TABLE INVENTORY_TRANSACTIONS (
                                ID VARCHAR2(36) PRIMARY KEY,
                                INVENTORY_ID VARCHAR2(36) NOT NULL,
                                FARM_ID VARCHAR2(36),
                                TRANSACTION_TYPE VARCHAR2(20) NOT NULL,
                                QUANTITY NUMBER(12, 2) NOT NULL,
                                UNIT VARCHAR2(50),
                                COST_TOTAL NUMBER(12, 2),
                                TRANSACTION_DATE TIMESTAMP DEFAULT SYSDATE NOT NULL,
                                PERFORMED_BY VARCHAR2(36) NOT NULL,
                                PURPOSE VARCHAR2(500),
                                REFERENCE_TASK_ID VARCHAR2(36),
                                NOTES VARCHAR2(1000),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_INV_TRANS_INVENTORY ON INVENTORY_TRANSACTIONS(INVENTORY_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_INV_TRANS_FARM ON INVENTORY_TRANSACTIONS(FARM_ID)");
                tablesCreated++;
            }

            // 9. LAB_SAMPLES
            if (!tableExists("LAB_SAMPLES")) {
                jdbcTemplate.execute("""
                            CREATE TABLE LAB_SAMPLES (
                                ID VARCHAR2(36) PRIMARY KEY,
                                SAMPLE_CODE VARCHAR2(50) UNIQUE NOT NULL,
                                FARM_ID VARCHAR2(36) NOT NULL,
                                SAMPLE_TYPE VARCHAR2(100) NOT NULL,
                                COLLECTION_DATE DATE NOT NULL,
                                COLLECTED_BY VARCHAR2(36) NOT NULL,
                                SUBMITTED_DATE DATE,
                                LOCATION_DESCRIPTION VARCHAR2(500),
                                TEST_REQUESTED VARCHAR2(500),
                                PRIORITY VARCHAR2(50) DEFAULT 'normal',
                                STATUS VARCHAR2(50) DEFAULT 'collected',
                                ASSIGNED_TECHNICIAN VARCHAR2(255),
                                EXPECTED_COMPLETION_DATE DATE,
                                ACTUAL_COMPLETION_DATE DATE,
                                NOTES VARCHAR2(2000),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_LAB_SAMPLES_FARM_ID ON LAB_SAMPLES(FARM_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_LAB_SAMPLES_STATUS ON LAB_SAMPLES(STATUS)");
                tablesCreated++;
            }

            // 10. LAB_REPORTS
            if (!tableExists("LAB_REPORTS")) {
                jdbcTemplate.execute("""
                            CREATE TABLE LAB_REPORTS (
                                ID VARCHAR2(36) PRIMARY KEY,
                                SAMPLE_ID VARCHAR2(36) NOT NULL,
                                FARM_ID VARCHAR2(36) NOT NULL,
                                REPORT_DATE DATE NOT NULL,
                                TEST_RESULTS CLOB,
                                NPK_NITROGEN NUMBER(10, 2),
                                NPK_PHOSPHORUS NUMBER(10, 2),
                                NPK_POTASSIUM NUMBER(10, 2),
                                SOIL_PH NUMBER(4, 2),
                                ORGANIC_CARBON NUMBER(10, 2),
                                SOIL_TEXTURE VARCHAR2(100),
                                PATHOGEN_DETECTED VARCHAR2(500),
                                DISEASE_NAME VARCHAR2(255),
                                SEVERITY VARCHAR2(50),
                                RECOMMENDATIONS CLOB,
                                FERTILIZER_PRESCRIPTION VARCHAR2(2000),
                                TREATMENT_PRESCRIPTION VARCHAR2(2000),
                                GENERATED_BY VARCHAR2(255),
                                REVIEWED_BY VARCHAR2(36),
                                REPORT_URL VARCHAR2(1000),
                                CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                                UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                            )
                        """);
                jdbcTemplate.execute("CREATE INDEX IDX_LAB_REPORTS_SAMPLE_ID ON LAB_REPORTS(SAMPLE_ID)");
                jdbcTemplate.execute("CREATE INDEX IDX_LAB_REPORTS_FARM_ID ON LAB_REPORTS(FARM_ID)");
                tablesCreated++;
            }

            result.put("status", "success");
            result.put("tables_created", tablesCreated);
            result.put("message", "Landowner features migration applied: " + tablesCreated + " tables created");
            return ApiResponse.success(result);

        } catch (Exception e) {
            result.put("status", "error");
            result.put("tables_created", tablesCreated);
            result.put("error", e.getMessage());
            return ApiResponse.error("Migration failed after creating " + tablesCreated + " tables: " + e.getMessage());
        }
    }

    @PostMapping("/ensure-workflow-events")
    public ApiResponse<Map<String, Object>> ensureWorkflowEventsTable() {
        Map<String, Object> result = new HashMap<>();
        try {
            if (tableExists("WORKFLOW_EVENTS")) {
                result.put("status", "exists");
                result.put("message", "WORKFLOW_EVENTS already exists");
                return ApiResponse.success(result);
            }

            jdbcTemplate.execute("""
                    CREATE TABLE WORKFLOW_EVENTS (
                        ID VARCHAR2(36) PRIMARY KEY,
                        FARM_ID VARCHAR2(36) NOT NULL,
                        EVENT_KEY VARCHAR2(100) NOT NULL,
                        STATUS VARCHAR2(20) NOT NULL,
                        DONE_BY VARCHAR2(50),
                        NOTE VARCHAR2(2000),
                        CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
                        UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
                    )
                    """);

            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX UQ_WORKFLOW_EVENTS_FARM_EVENT ON WORKFLOW_EVENTS(FARM_ID, EVENT_KEY)");
            jdbcTemplate.execute("CREATE INDEX IDX_WORKFLOW_EVENTS_FARM_ID ON WORKFLOW_EVENTS(FARM_ID)");
            jdbcTemplate.execute("CREATE INDEX IDX_WORKFLOW_EVENTS_STATUS ON WORKFLOW_EVENTS(STATUS)");
            jdbcTemplate.execute(
                    "ALTER TABLE WORKFLOW_EVENTS ADD CONSTRAINT CK_WORKFLOW_EVENTS_STATUS CHECK (STATUS IN ('pending', 'in-progress', 'completed'))");

            result.put("status", "created");
            result.put("message", "WORKFLOW_EVENTS created successfully");
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to ensure WORKFLOW_EVENTS: " + e.getMessage());
        }
    }

    private boolean tableExists(String tableName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME = ?",
                    Integer.class,
                    tableName);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }
}
