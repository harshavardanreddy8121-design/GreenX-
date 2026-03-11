-- =========================================
-- SAMPLE DATA FOR FARM MANAGEMENT SYSTEM
-- Total: 5 Farms (100 acres = 20 acres each)
-- 1 Field Manager, 10 Workers, 3 Experts
-- 5 Different Crops (1 per farm)
-- Real soil analysis data
-- =========================================

-- ========== USERS ==========
-- Passwords are all: pass123 (hashed with BCrypt)

-- Field Manager
INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('FM001', 'manager@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'fieldmanager', 'Rajesh Kumar', NOW());

INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) 
VALUES ('FM001', 'Rajesh Kumar', '+91-9876543210', NOW());

INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) 
VALUES ('UR_FM001', 'FM001', 'fieldmanager', NOW());

-- Workers (10 workers)
INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W001', 'worker1@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Suresh Reddy', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W001', 'Suresh Reddy', '+91-9876543211', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W001', 'W001', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W002', 'worker2@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Ramesh Patil', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W002', 'Ramesh Patil', '+91-9876543212', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W002', 'W002', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W003', 'worker3@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Ganesh Naik', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W003', 'Ganesh Naik', '+91-9876543213', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W003', 'W003', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W004', 'worker4@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Prakash Yadav', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W004', 'Prakash Yadav', '+91-9876543214', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W004', 'W004', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W005', 'worker5@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Mahesh Gowda', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W005', 'Mahesh Gowda', '+91-9876543215', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W005', 'W005', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W006', 'worker6@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Vijay Singh', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W006', 'Vijay Singh', '+91-9876543216', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W006', 'W006', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W007', 'worker7@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Santosh Kumar', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W007', 'Santosh Kumar', '+91-9876543217', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W007', 'W007', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W008', 'worker8@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Anil Sharma', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W008', 'Anil Sharma', '+91-9876543218', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W008', 'W008', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W009', 'worker9@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Deepak Verma', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W009', 'Deepak Verma', '+91-9876543219', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W009', 'W009', 'worker', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('W010', 'worker10@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'worker', 'Naveen Reddy', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('W010', 'Naveen Reddy', '+91-9876543220', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_W010', 'W010', 'worker', NOW());

-- Experts (3 experts - Soil, Crop, Pest & Disease)
INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('EX001', 'soil.expert@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'expert', 'Dr. Priya Sharma (Soil Expert)', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('EX001', 'Dr. Priya Sharma', '+91-9876543300', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_EX001', 'EX001', 'expert', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('EX002', 'crop.expert@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'expert', 'Dr. Arvind Patel (Crop Expert)', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('EX002', 'Dr. Arvind Patel', '+91-9876543301', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_EX002', 'EX002', 'expert', NOW());

INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT) 
VALUES ('EX003', 'pest.expert@greenx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'expert', 'Dr. Meena Reddy (Pest & Disease Expert)', NOW());
INSERT INTO PROFILES (ID, FULL_NAME, PHONE, CREATED_AT) VALUES ('EX003', 'Dr. Meena Reddy', '+91-9876543302', NOW());
INSERT INTO USER_ROLES (ID, USER_ID, ROLE, ASSIGNED_DATE) VALUES ('UR_EX003', 'EX003', 'expert', NOW());

-- ========== FARMS (5 farms, 20 acres each) ==========
-- Soil data based on Indian agricultural research and Soil Health Card data

-- Farm 1: Rice Paddy (Telangana - Warangal District)
INSERT INTO FARMS (ID, NAME, LOCATION, VILLAGE, PINCODE, AREA_SQM, TOTAL_LAND, CROP, GROWTH_STAGE, CROP_HEALTH_SCORE, EXPECTED_REVENUE, PROFIT_SHARE, OWNER_ID, CREATED_BY, CONTRACT_SUMMARY, CREATED_AT) 
VALUES ('FARM001', 'Green Valley Rice Farm', 'Warangal District, Telangana', 'Hanamkonda Village', '506001', 80937, 20.0, 'Rice (Paddy)', 'flowering', 85, 450000, 70.0, 'FM001', 'FM001', 'Contract farming for premium Basmati rice. 70% profit to landowner, 30% to GreenX. Expected yield: 5 tons/acre', NOW());

INSERT INTO FARM_DETAILS (ID, FARM_ID, SOIL_PH, SOIL_NITROGEN, SOIL_PHOSPHORUS, SOIL_POTASSIUM, SOIL_ORGANIC_CARBON, SOIL_MOISTURE, CREATED_AT) 
VALUES ('FD001', 'FARM001', 6.5, 280, 22, 210, 0.75, 45, NOW());

-- Farm 2: Wheat (Punjab - Ludhiana District)
INSERT INTO FARMS (ID, NAME, LOCATION, VILLAGE, PINCODE, AREA_SQM, TOTAL_LAND, CROP, GROWTH_STAGE, CROP_HEALTH_SCORE, EXPECTED_REVENUE, PROFIT_SHARE, OWNER_ID, CREATED_BY, CONTRACT_SUMMARY, CREATED_AT) 
VALUES ('FARM002', 'Golden Fields Wheat Farm', 'Ludhiana District, Punjab', 'Samrala Village', '141114', 80937, 20.0, 'Wheat', 'grain_filling', 90, 380000, 70.0, 'FM001', 'FM001', 'Contract farming for high-quality wheat. 70% profit to landowner, 30% to GreenX. Expected yield: 4.5 tons/acre', NOW());

INSERT INTO FARM_DETAILS (ID, FARM_ID, SOIL_PH, SOIL_NITROGEN, SOIL_PHOSPHORUS, SOIL_POTASSIUM, SOIL_ORGANIC_CARBON, SOIL_MOISTURE, CREATED_AT) 
VALUES ('FD002', 'FARM002', 7.2, 320, 28, 250, 0.85, 38, NOW());

-- Farm 3: Tomato (Karnataka - Kolar District)
INSERT INTO FARMS (ID, NAME, LOCATION, VILLAGE, PINCODE, AREA_SQM, TOTAL_LAND, CROP, GROWTH_STAGE, CROP_HEALTH_SCORE, EXPECTED_REVENUE, PROFIT_SHARE, OWNER_ID, CREATED_BY, CONTRACT_SUMMARY, CREATED_AT) 
VALUES ('FARM003', 'Red Harvest Tomato Farm', 'Kolar District, Karnataka', 'Mulbagal Village', '563131', 80937, 20.0, 'Tomato', 'fruiting', 78, 650000, 70.0, 'FM001', 'FM001', 'Contract farming for hybrid tomato varieties. 70% profit to landowner, 30% to GreenX. Expected yield: 25 tons/acre', NOW());

INSERT INTO FARM_DETAILS (ID, FARM_ID, SOIL_PH, SOIL_NITROGEN, SOIL_PHOSPHORUS, SOIL_POTASSIUM, SOIL_ORGANIC_CARBON, SOIL_MOISTURE, CREATED_AT) 
VALUES ('FD003', 'FARM003', 6.8, 180, 35, 280, 1.2, 42, NOW());

-- Farm 4: Cotton (Gujarat - Bharuch District)
INSERT INTO FARMS (ID, NAME, LOCATION, VILLAGE, PINCODE, AREA_SQM, TOTAL_LAND, CROP, GROWTH_STAGE, CROP_HEALTH_SCORE, EXPECTED_REVENUE, PROFIT_SHARE, OWNER_ID, CREATED_BY, CONTRACT_SUMMARY, CREATED_AT) 
VALUES ('FARM004', 'White Gold Cotton Farm', 'Bharuch District, Gujarat', 'Ankleshwar Village', '393001', 80937, 20.0, 'Cotton (Bt Hybrid)', 'boll_formation', 82, 520000, 70.0, 'FM001', 'FM001', 'Contract farming for Bt cotton. 70% profit to landowner, 30% to GreenX. Expected yield: 10 quintals/acre', NOW());

INSERT INTO FARM_DETAILS (ID, FARM_ID, SOIL_PH, SOIL_NITROGEN, SOIL_PHOSPHORUS, SOIL_POTASSIUM, SOIL_ORGANIC_CARBON, SOIL_MOISTURE, CREATED_AT) 
VALUES ('FD004', 'FARM004', 7.5, 240, 18, 320, 0.68, 35, NOW());

-- Farm 5: Chickpea (Madhya Pradesh - Indore District)
INSERT INTO FARMS (ID, NAME, LOCATION, VILLAGE, PINCODE, AREA_SQM, TOTAL_LAND, CROP, GROWTH_STAGE, CROP_HEALTH_SCORE, EXPECTED_REVENUE, PROFIT_SHARE, OWNER_ID, CREATED_BY, CONTRACT_SUMMARY, CREATED_AT) 
VALUES ('FARM005', 'Pulse Power Chickpea Farm', 'Indore District, Madhya Pradesh', 'Mhow Village', '453441', 80937, 20.0, 'Chickpea (Chana)', 'pod_development', 88, 420000, 70.0, 'FM001', 'FM001', 'Contract farming for premium chickpea. 70% profit to landowner, 30% to GreenX. Expected yield: 12 quintals/acre', NOW());

INSERT INTO FARM_DETAILS (ID, FARM_ID, SOIL_PH, SOIL_NITROGEN, SOIL_PHOSPHORUS, SOIL_POTASSIUM, SOIL_ORGANIC_CARBON, SOIL_MOISTURE, CREATED_AT) 
VALUES ('FD005', 'FARM005', 7.8, 120, 42, 280, 0.92, 30, NOW());

-- ========== FARM ASSIGNMENTS ==========
-- Field Manager assigned to all farms
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_FM001_F001', 'FM001', 'FARM001', 'fieldmanager', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_FM001_F002', 'FM001', 'FARM002', 'fieldmanager', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_FM001_F003', 'FM001', 'FARM003', 'fieldmanager', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_FM001_F004', 'FM001', 'FARM004', 'fieldmanager', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_FM001_F005', 'FM001', 'FARM005', 'fieldmanager', NOW());

-- Workers assigned to farms (2 workers per farm)
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W001_F001', 'W001', 'FARM001', 'worker', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W002_F001', 'W002', 'FARM001', 'worker', NOW());

INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W003_F002', 'W003', 'FARM002', 'worker', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W004_F002', 'W004', 'FARM002', 'worker', NOW());

INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W005_F003', 'W005', 'FARM003', 'worker', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W006_F003', 'W006', 'FARM003', 'worker', NOW());

INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W007_F004', 'W007', 'FARM004', 'worker', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W008_F004', 'W008', 'FARM004', 'worker', NOW());

INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W009_F005', 'W009', 'FARM005', 'worker', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_W010_F005', 'W010', 'FARM005', 'worker', NOW());

-- Experts assigned to all farms
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX001_F001', 'EX001', 'FARM001', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX001_F002', 'EX001', 'FARM002', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX001_F003', 'EX001', 'FARM003', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX001_F004', 'EX001', 'FARM004', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX001_F005', 'EX001', 'FARM005', 'expert', NOW());

INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX002_F001', 'EX002', 'FARM001', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX002_F002', 'EX002', 'FARM002', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX002_F003', 'EX002', 'FARM003', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX002_F004', 'EX002', 'FARM004', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX002_F005', 'EX002', 'FARM005', 'expert', NOW());

INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX003_F001', 'EX003', 'FARM001', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX003_F002', 'EX003', 'FARM002', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX003_F003', 'EX003', 'FARM003', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX003_F004', 'EX003', 'FARM004', 'expert', NOW());
INSERT INTO FARM_ASSIGNMENTS (ID, USER_ID, FARM_ID, ROLE, ASSIGNED_DATE) VALUES ('FA_EX003_F005', 'EX003', 'FARM005', 'expert', NOW());

-- ========== CROP PLANS ==========
-- Approved crop plans for all 5 farms

INSERT INTO CROP_PLANS (ID, FARM_ID, EXPERT_ID, CROP_NAME, SEASON, PLANTING_DATE, EXPECTED_HARVEST_DATE, EXPECTED_YIELD, EXPECTED_REVENUE, 
    FERTILIZER_PLAN, PESTICIDE_PLAN, IRRIGATION_PLAN, RATIONALE, STATUS, APPROVED_BY, APPROVED_AT, CREATED_AT) 
VALUES ('CP001', 'FARM001', 'EX002', 'Rice (Paddy) - Basmati', 'kharif', TO_DATE('2026-06-15', 'YYYY-MM-DD'), TO_DATE('2026-10-30', 'YYYY-MM-DD'), 100.0, 450000,
    'Urea 120 kg/acre, DAP 60 kg/acre, Potash 40 kg/acre. Split application: 50% basal, 25% tillering, 25% panicle initiation',
    'Pre-emergence herbicide. Stem borer control at tillering. Blast fungicide at boot leaf stage',
    'Flood irrigation: maintain 2-3 inches water during vegetative stage. Drain 10 days before harvest',
    'Suitable soil pH (6.5) and organic carbon for rice cultivation. Good monsoon forecast. Premium Basmati commands high market price',
    'approved', 'FM001', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');

INSERT INTO CROP_PLANS (ID, FARM_ID, EXPERT_ID, CROP_NAME, SEASON, PLANTING_DATE, EXPECTED_HARVEST_DATE, EXPECTED_YIELD, EXPECTED_REVENUE,
    FERTILIZER_PLAN, PESTICIDE_PLAN, IRRIGATION_PLAN, RATIONALE, STATUS, APPROVED_BY, APPROVED_AT, CREATED_AT)
VALUES ('CP002', 'FARM002', 'EX002', 'Wheat - HD 2967', 'rabi', TO_DATE('2025-11-10', 'YYYY-MM-DD'), TO_DATE('2026-04-15', 'YYYY-MM-DD'), 90.0, 380000,
    'Urea 140 kg/acre, DAP 80 kg/acre, Potash 50 kg/acre. Split: 50% at sowing, 25% CRI stage, 25% jointing',
    'Pre-emergence herbicide. Aphid control at boot stage. Rust fungicide if needed',
    'Pre-sowing irrigation. Crown Root Initiation (21 DAS), Late tillering (40 DAS), Flowering (60 DAS), Milk stage (80 DAS), Dough stage (90 DAS)',
    'Excellent soil fertility (pH 7.2, high nitrogen). Punjab climate ideal for wheat. Good market demand',
    'approved', 'FM001', NOW() - INTERVAL '120 days', NOW() - INTERVAL '120 days');

INSERT INTO CROP_PLANS (ID, FARM_ID, EXPERT_ID, CROP_NAME, SEASON, PLANTING_DATE, EXPECTED_HARVEST_DATE, EXPECTED_YIELD, EXPECTED_REVENUE,
    FERTILIZER_PLAN, PESTICIDE_PLAN, IRRIGATION_PLAN, RATIONALE, STATUS, APPROVED_BY, APPROVED_AT, CREATED_AT)
VALUES ('CP003', 'FARM003', 'EX002', 'Tomato - Hybrid Arka Rakshak', 'kharif', TO_DATE('2026-07-01', 'YYYY-MM-DD'), TO_DATE('2026-10-15', 'YYYY-MM-DD'), 500.0, 650000,
    'Urea 150 kg/acre, DAP 100 kg/acre, Potash 100 kg/acre. Weekly fertigation after transplanting',
    'Whitefly control with yellow sticky traps. Late blight fungicide spray every 10 days. Neem oil for mites',
    'Drip irrigation daily. 2-3 liters per plant per day. Reduce during fruiting to prevent cracking',
    'High organic carbon (1.2) suitable for tomato. Profitable vegetable crop. Good processing unit demand in Kolar',
    'approved', 'FM001', NOW() - INTERVAL '75 days', NOW() - INTERVAL '75 days');

INSERT INTO CROP_PLANS (ID, FARM_ID, EXPERT_ID, CROP_NAME, SEASON, PLANTING_DATE, EXPECTED_HARVEST_DATE, EXPECTED_YIELD, EXPECTED_REVENUE,
    FERTILIZER_PLAN, PESTICIDE_PLAN, IRRIGATION_PLAN, RATIONALE, STATUS, APPROVED_BY, APPROVED_AT, CREATED_AT)
VALUES ('CP004', 'FARM004', 'EX002', 'Cotton - Bt Hybrid Bioseed 6588', 'kharif', TO_DATE('2026-06-01', 'YYYY-MM-DD'), TO_DATE('2026-12-15', 'YYYY-MM-DD'), 200.0, 520000,
    'Urea 100 kg/acre, DAP 80 kg/acre, Potash 80 kg/acre. Split: basal 50%, squaring 25%, flowering 25%',
    'Bollworm monitoring with pheromone traps. Emamectin spray if needed. Whitefly control at squaring',
    'Pre-sowing irrigation. Square formation, Flowering, Boll formation stages. Avoid water stress during boll development',
    'Gujarat climate perfect for Bt cotton. High potassium soil (320) good for fiber quality. Strong textile industry demand',
    'approved', 'FM001', NOW() - INTERVAL '95 days', NOW() - INTERVAL '95 days');

INSERT INTO CROP_PLANS (ID, FARM_ID, EXPERT_ID, CROP_NAME, SEASON, PLANTING_DATE, EXPECTED_HARVEST_DATE, EXPECTED_YIELD, EXPECTED_REVENUE,
    FERTILIZER_PLAN, PESTICIDE_PLAN, IRRIGATION_PLAN, RATIONALE, STATUS, APPROVED_BY, APPROVED_AT, CREATED_AT)
VALUES ('CP005', 'FARM005', 'EX002', 'Chickpea - JG 315', 'rabi', TO_DATE('2025-10-15', 'YYYY-MM-DD'), TO_DATE('2026-03-10', 'YYYY-MM-DD'), 240.0, 420000,
    'DAP 100 kg/acre, Potash 40 kg/acre at sowing. Urea 20 kg/acre at flowering. Rhizobium seed treatment',
    'Pre-emergence herbicide. Pod borer control with NPV. Wilt resistance variety',
    'Pre-sowing irrigation. Flowering irrigation (45 DAS). Pod filling irrigation (70 DAS). Avoid water at maturity',
    'Legume crop for soil nitrogen fixation. MP region has good chickpea tradition. High market rate for dal',
    'approved', 'FM001', NOW() - INTERVAL '140 days', NOW() - INTERVAL '140 days');

-- ========== INVENTORY ==========
-- Agricultural inputs inventory

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV001', 'fertilizer', 'Urea (46% N)', 'FERT-UREA', 'IFFCO', 'kg', 5000, 1000, 8.50, 'Warehouse A - Bay 1', 'Nitrogen fertilizer - most common', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV002', 'fertilizer', 'DAP (Diammonium Phosphate)', 'FERT-DAP', 'IFFCO', 'kg', 3500, 800, 32.00, 'Warehouse A - Bay 2', 'Phosphorus fertilizer', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV003', 'fertilizer', 'MOP (Muriate of Potash)', 'FERT-MOP', 'IPL', 'kg', 2800, 600, 18.00, 'Warehouse A - Bay 3', 'Potassium fertilizer', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV004', 'pesticide', 'Chlorantraniliprole 18.5% SC', 'PEST-CORAGEN', 'Corteva', 'liter', 120, 30, 1850.00, 'Secure Storage - Cabinet 1', 'Stem borer, bollworm control', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV005', 'pesticide', 'Imidacloprid 17.8% SL', 'PEST-IMIDA', 'Bayer', 'liter', 85, 25, 680.00, 'Secure Storage - Cabinet 2', 'Aphid, whitefly control', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV006', 'pesticide', 'Mancozeb 64% + Metalaxyl 8% WP', 'FUNG-RIDOMIL', 'Syngenta', 'kg', 250, 50, 450.00, 'Secure Storage - Cabinet 2', 'Late blight fungicide', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV007', 'seed', 'Rice - Basmati Seeds', 'SEED-RICE-BAS', 'Mahindra Seeds', 'kg', 450, 100, 180.00, 'Cold Storage Room', 'Premium Basmati variety', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV008', 'seed', 'Wheat - HD 2967 Seeds', 'SEED-WHEAT-HD', 'NSC', 'kg', 620, 120, 35.00, 'Cold Storage Room', 'High yielding wheat variety', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV009', 'seed', 'Tomato - Hybrid Seeds', 'SEED-TOM-HYB', 'Syngenta', 'gram', 2500, 500, 12.00, 'Cold Storage Room', 'Arka Rakshak hybrid', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV010', 'seed', 'Cotton - Bt Seeds', 'SEED-COT-BT', 'Bioseed', 'packet', 180, 40, 850.00, 'Cold Storage Room', 'Bt hybrid 6588', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV011', 'seed', 'Chickpea - JG 315 Seeds', 'SEED-CHICK-JG', 'JNKVV', 'kg', 350, 80, 95.00, 'Cold Storage Room', 'Wilt resistant variety', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV012', 'equipment', 'Sprayer - Knapsack', 'EQUIP-SPRAY-16L', 'Aspee', 'units', 25, 5, 1250.00, 'Equipment Shed', '16-liter manual sprayer', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV013', 'equipment', 'Drip Irrigation Kit', 'EQUIP-DRIP-1AC', 'Jain Irrigation', 'sets', 8, 2, 35000.00, 'Equipment Shed', 'Complete drip system for 1 acre', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV014', 'equipment', 'Soil Testing Kit', 'EQUIP-SOIL-KIT', 'Himedia', 'units', 6, 2, 8500.00, 'Laboratory', 'NPK testing kit', NOW());

INSERT INTO INVENTORY (ID, ITEM_TYPE, ITEM_NAME, ITEM_CODE, BRAND, UNIT, QUANTITY_IN_STOCK, REORDER_LEVEL, UNIT_COST, STORAGE_LOCATION, NOTES, CREATED_AT)
VALUES ('INV015', 'pesticide', 'Neem Oil (Organic)', 'PEST-NEEM', 'Organo Biotech', 'liter', 150, 40, 280.00, 'Organic Section', 'Organic pest control', NOW());

-- ========== COSTS (Sample expenses for farms) ==========

-- Farm 1 (Rice) Costs
INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST001', 'FARM001', 'seeds', 'Basmati rice seeds - 80 kg @ Rs 180/kg', 14400, TO_DATE('2026-06-10', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Premium seeds for 20 acres', NOW());

INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST002', 'FARM001', 'fertilizers', 'Urea 2400 kg, DAP 1200 kg, MOP 800 kg', 72800, TO_DATE('2026-06-12', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Complete fertilizer for season', NOW());

INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST003', 'FARM001', 'labor', 'Land preparation & transplanting - 15 days @ 10 workers', 45000, TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Includes ploughing, puddling, transplanting', NOW());

INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST004', 'FARM001', 'pesticides', 'Stem borer control & blast fungicide', 18500, TO_DATE('2026-07-25', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Pest and disease management', NOW());

INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST005', 'FARM001', 'equipment', 'Water pump rental for irrigation', 12000, TO_DATE('2026-08-01', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', '4 months rental', NOW());

-- Farm 3 (Tomato) Costs
INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST006', 'FARM003', 'seeds', 'Hybrid tomato seeds - 250g @ Rs 12/g', 3000, TO_DATE('2026-06-25', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Arka Rakshak hybrid', NOW());

INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST007', 'FARM003', 'equipment', 'Drip irrigation system installation', 140000, TO_DATE('2026-06-28', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Complete system for 20 acres', NOW());

INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST008', 'FARM003', 'fertilizers', 'NPK complex fertilizers for fertigation', 95000, TO_DATE('2026-07-05', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Water-soluble fertilizers', NOW());

INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST009', 'FARM003', 'pesticides', 'Late blight control + whitefly management', 35000, TO_DATE('2026-08-10', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Preventive and curative sprays', NOW());

INSERT INTO COSTS (ID, FARM_ID, COST_CATEGORY, DESCRIPTION, AMOUNT, DATE_INCURRED, APPROVED, APPROVED_BY, ENTERED_BY, NOTES, CREATED_AT)
VALUES ('COST010', 'FARM003', 'labor', 'Transplanting, pruning, staking - 25 days', 75000, TO_DATE('2026-07-15', 'YYYY-MM-DD'), 'Y', 'FM001', 'FM001', 'Labor-intensive crop', NOW());

-- ========== HARVESTS (Completed harvests with export data) ==========

-- Farm 2 Wheat Harvest (Completed - Previous Season)
INSERT INTO HARVESTS (ID, FARM_ID, CROP_PLAN_ID, CROP_NAME, HARVEST_DATE, YIELD_QUANTITY, YIELD_UNIT, YIELD_PER_ACRE, QUALITY_GRADE,
    SALE_PRICE, SALE_PRICE_PER_UNIT, BUYER_NAME, BUYER_TYPE, STORAGE_LOCATION, TRANSPORT_COST, 
    TOTAL_COSTS, REVENUE, PROFIT, LANDOWNER_SHARE, GREENX_SHARE, PAYMENT_STATUS, PAYMENT_DATE, RECORDED_BY, NOTES, CREATED_AT)
VALUES ('HARV001', 'FARM002', 'CP002', 'Wheat - HD 2967', TO_DATE('2026-04-15', 'YYYY-MM-DD'), 
    90000, 'kg', 4500, 'A',
    1980000, 22, 'Punjab Flour Mills Ltd', 'processing_unit', 'Farm storage - bagged', 35000,
    980000, 1980000, 1000000, 700000, 300000, 'paid', TO_DATE('2026-04-20', 'YYYY-MM-DD'), 'FM001',
    'Excellent quality wheat. Premium grade achieved. Landowner received Rs 7 lakhs', NOW() - INTERVAL '60 days');

-- Farm 5 Chickpea Harvest (Completed - Previous Season)
INSERT INTO HARVESTS (ID, FARM_ID, CROP_PLAN_ID, CROP_NAME, HARVEST_DATE, YIELD_QUANTITY, YIELD_UNIT, YIELD_PER_ACRE, QUALITY_GRADE,
    SALE_PRICE, SALE_PRICE_PER_UNIT, BUYER_NAME, BUYER_TYPE, EXPORT_COUNTRY, TRANSPORT_COST,
    TOTAL_COSTS, REVENUE, PROFIT, LANDOWNER_SHARE, GREENX_SHARE, PAYMENT_STATUS, PAYMENT_DATE, RECORDED_BY, NOTES, CREATED_AT)
VALUES ('HARV002', 'FARM005', 'CP005', 'Chickpea - JG 315', TO_DATE('2026-03-10', 'YYYY-MM-DD'),
    48000, 'kg', 2400, 'premium',
    2880000, 60, 'Global Pulses Export Pvt Ltd', 'export', 'UAE & Saudi Arabia', 45000,
    1250000, 2880000, 1630000, 1141000, 489000, 'paid', TO_DATE('2026-03-25', 'YYYY-MM-DD'), 'FM001',
    'EXPORT SUCCESS: Premium chickpea exported to Middle East. Exceptional quality. Landowner share: Rs 11.41 lakhs', NOW() - INTERVAL '90 days');

-- Farm 1 Rice - Upcoming harvest (forecasted)
INSERT INTO HARVESTS (ID, FARM_ID, CROP_PLAN_ID, CROP_NAME, HARVEST_DATE, YIELD_QUANTITY, YIELD_UNIT, YIELD_PER_ACRE, QUALITY_GRADE,
    SALE_PRICE, SALE_PRICE_PER_UNIT, BUYER_NAME, BUYER_TYPE, STORAGE_LOCATION,
    TOTAL_COSTS, REVENUE, PROFIT, LANDOWNER_SHARE, GREENX_SHARE, PAYMENT_STATUS, RECORDED_BY, NOTES, CREATED_AT)
VALUES ('HARV003', 'FARM001', 'CP001', 'Rice (Paddy) - Basmati', TO_DATE('2026-10-30', 'YYYY-MM-DD'),
    100000, 'kg', 5000, 'A',
    4500000, 45, 'Krishi Mandi (Forecasted)', 'mandi', 'To be determined', 
    1627000, 4500000, 2873000, 2011000, 862000, 'pending', 'FM001',
    'FORECAST: Expected excellent yield. Premium Basmati commands good price. Estimated landowner share: Rs 20.11 lakhs', NOW());

-- ========== DIAGNOSTICS (Expert Reports) ==========

-- Soil Expert Report - Farm 1
INSERT INTO DIAGNOSTICS (ID, FARM_ID, EXPERT_ID, PEST_RISK, DISEASE_RISK, PRESCRIPTION, NOTES, CREATED_AT)
VALUES ('DIAG001', 'FARM001', 'EX001', 'low', 'low', 
    'Soil pH 6.5 is optimal for rice. Nitrogen levels adequate (280 kg/ha). Recommend split application of nitrogen fertilizer. Organic carbon at 0.75% is good - maintain with FYM application annually.',
    'Latest soil test shows balanced nutrients. Continue current fertilization schedule. Monitor moisture carefully during reproductive stage.',
    NOW() - INTERVAL '15 days');

-- Crop Expert Report - Farm 3
INSERT INTO DIAGNOSTICS (ID, FARM_ID, EXPERT_ID, PEST_RISK, DISEASE_RISK, PRESCRIPTION, NOTES, CREATED_AT)
VALUES ('DIAG002', 'FARM003', 'EX002', 'medium', 'medium',
    'Tomato crop at fruiting stage showing good vigor. Increase potassium fertilization for better fruit quality and shelf life. Apply 40 kg MOP per acre immediately. Ensure adequate calcium to prevent blossom end rot.',
    'Fruit set is excellent. Expected yield 25-28 tons/acre. Market prices are favorable. Harvest in 3 weeks.',
    NOW() - INTERVAL '5 days');

-- Pest & Disease Expert Report - Farm 4
INSERT INTO DIAGNOSTICS (ID, FARM_ID, EXPERT_ID, PEST_RISK, DISEASE_RISK, PRESCRIPTION, NOTES, CREATED_AT)
VALUES ('DIAG003', 'FARM004', 'EX003', 'high', 'low',
    'ALERT: Bollworm larvae detected on 3% plants. Immediate action required. Spray Emamectin benzoate 5% SG @ 200 g/ha immediately. Repeat after 10 days. Install pheromone traps @ 15/ha. Monitor daily for next 2 weeks.',
    'Early detection prevented major outbreak. Continue weekly monitoring. Whitefly population under control. No viral symptoms observed.',
    NOW() - INTERVAL '2 days');

-- Soil Expert Report - Farm 5
INSERT INTO DIAGNOSTICS (ID, FARM_ID, EXPERT_ID, PEST_RISK, DISEASE_RISK, PRESCRIPTION, NOTES, CREATED_AT)
VALUES ('DIAG004', 'FARM005', 'EX001', 'low', 'low',
    'Soil pH 7.8 is slightly alkaline but acceptable for chickpea. High phosphorus (42 kg/ha) is excellent for pod development. Potassium adequate. No deficiency symptoms observed. Rhizobium nodulation is good.',
    'Chickpea responding well to reduced irrigation. Avoid waterlogging. Crop health excellent. Harvest readiness in 15-20 days.',
    NOW() - INTERVAL '8 days');

-- ========== LAB SAMPLES & REPORTS ==========

-- Lab Sample 1 - Soil Analysis Farm 1
INSERT INTO LAB_SAMPLES (ID, SAMPLE_CODE, FARM_ID, SAMPLE_TYPE, COLLECTION_DATE, COLLECTED_BY, SUBMITTED_DATE, 
    LOCATION_DESCRIPTION, TEST_REQUESTED, PRIORITY, STATUS, ACTUAL_COMPLETION_DATE, NOTES, CREATED_AT)
VALUES ('SAMP001', 'SHC-WRG-2026-001', 'FARM001', 'soil', TO_DATE('2026-06-05', 'YYYY-MM-DD'), 'EX001', TO_DATE('2026-06-06', 'YYYY-MM-DD'),
    'Composite sample from 5 points across 20 acres', 'Complete soil health analysis: pH, NPK, OC, micronutrients', 'normal', 'completed',
    TO_DATE('2026-06-08', 'YYYY-MM-DD'), 'Pre-season soil test before rice planting', NOW() - INTERVAL '95 days');

INSERT INTO LAB_REPORTS (ID, SAMPLE_ID, FARM_ID, REPORT_DATE, NPK_NITROGEN, NPK_PHOSPHORUS, NPK_POTASSIUM, SOIL_PH, ORGANIC_CARBON,
    SOIL_TEXTURE, RECOMMENDATIONS, FERTILIZER_PRESCRIPTION, GENERATED_BY, REVIEWED_BY, CREATED_AT)
VALUES ('REP001', 'SAMP001', 'FARM001', TO_DATE('2026-06-08', 'YYYY-MM-DD'), 280, 22, 210, 6.5, 0.75,
    'Clay Loam',
    'Soil is suitable for rice cultivation. pH in optimal range (6.0-7.0). Nitrogen medium - apply 120 kg N/acre. Phosphorus low - apply 60 kg P2O5/acre. Potassium medium - apply 40 kg K2O/acre. Organic carbon good - maintain with FYM application.',
    'Basal: DAP 130 kg/acre + MOP 65 kg/acre. Tillering (25 DAS): Urea 65 kg/acre. Panicle initiation (50 DAS): Urea 65 kg/acre',
    'Lab Technician - Ramesh Kumar', 'EX001', NOW() - INTERVAL '95 days');

-- Lab Sample 2 - Disease Diagnosis Farm 3
INSERT INTO LAB_SAMPLES (ID, SAMPLE_CODE, FARM_ID, SAMPLE_TYPE, COLLECTION_DATE, COLLECTED_BY, SUBMITTED_DATE,
    LOCATION_DESCRIPTION, TEST_REQUESTED, PRIORITY, STATUS, ACTUAL_COMPLETION_DATE, NOTES, CREATED_AT)
VALUES ('SAMP002', 'PATH-KLR-2026-028', 'FARM003', 'plant_tissue', TO_DATE('2026-08-15', 'YYYY-MM-DD'), 'EX003', TO_DATE('2026-08-15', 'YYYY-MM-DD'),
    'Tomato leaves showing yellowing and spots - 3 samples from different plants', 'Pathogen identification - fungal/bacterial/viral', 'high', 'completed',
    TO_DATE('2026-08-17', 'YYYY-MM-DD'), 'Suspected disease outbreak', NOW() - INTERVAL '25 days');

INSERT INTO LAB_REPORTS (ID, SAMPLE_ID, FARM_ID, REPORT_DATE, PATHOGEN_DETECTED, DISEASE_NAME, SEVERITY,
    RECOMMENDATIONS, TREATMENT_PRESCRIPTION, GENERATED_BY, REVIEWED_BY, CREATED_AT)
VALUES ('REP002', 'SAMP002', 'FARM003', TO_DATE('2026-08-17', 'YYYY-MM-DD'),
    'Phytophthora infestans detected', 'Late Blight of Tomato', 'moderate',
    'IMMEDIATE ACTION REQUIRED: Late blight confirmed. This is a CRITICAL disease that can destroy entire crop in 7-10 days if not controlled. Start fungicide spray immediately. Remove and burn severely infected plants. Improve air circulation. Reduce overhead irrigation.',
    'Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5 kg/ha immediately. Repeat every 7 days for 3 weeks. Alternate with Cymoxanil 8% + Mancozeb 64% WP. Use sticker for better coverage. Spray in evening.',
    'Plant Pathologist - Dr. Suresh Reddy', 'EX003', NOW() - INTERVAL '25 days');

-- ========== TASKS (Sample tasks for workers) ==========

-- Farm 1 Tasks
INSERT INTO TASKS (ID, FARM_ID, ASSIGNED_TO, TITLE, DESCRIPTION, STATUS, DUE_DATE, PHOTO_REQUIRED, CREATED_BY, CREATED_AT)
VALUES ('TASK001', 'FARM001', 'W001', 'Apply Urea Fertilizer', 'Apply 65 kg Urea per acre at tillering stage. Broadcast evenly after irrigation', 'completed', 
    TO_DATE('2026-07-15', 'YYYY-MM-DD'), 'Y', 'FM001', NOW() - INTERVAL '60 days');

INSERT INTO TASKS (ID, FARM_ID, ASSIGNED_TO, TITLE, DESCRIPTION, STATUS, DUE_DATE, PHOTO_REQUIRED, CREATED_BY, CREATED_AT)
VALUES ('TASK002', 'FARM001', 'W002', 'Spray Stem Borer Pesticide', 'Mix Chlorantraniliprole 150ml in 200L water. Spray on 20 acres. Use PPE equipment', 'completed',
    TO_DATE('2026-07-25', 'YYYY-MM-DD'), 'Y', 'FM001', NOW() - INTERVAL '50 days');

INSERT INTO TASKS (ID, FARM_ID, ASSIGNED_TO, TITLE, DESCRIPTION, STATUS, DUE_DATE, PHOTO_REQUIRED, CREATED_BY, CREATED_AT)
VALUES ('TASK003', 'FARM001', 'W001', 'Check Irrigation Channels', 'Ensure all channels are clear. Maintain 2-3 inches water depth. Report any leaks', 'pending',
    TO_DATE('2026-09-25', 'YYYY-MM-DD'), 'N', 'FM001', NOW() - INTERVAL '5 days');

-- Farm 3 Tasks
INSERT INTO TASKS (ID, FARM_ID, ASSIGNED_TO, TITLE, DESCRIPTION, STATUS, DUE_DATE, PHOTO_REQUIRED, CREATED_BY, CREATED_AT)
VALUES ('TASK004', 'FARM003', 'W005', 'Prune Tomato Plants', 'Remove all lower leaves up to first fruit cluster. Remove suckers. Improves air circulation', 'completed',
    TO_DATE('2026-08-05', 'YYYY-MM-DD'), 'Y', 'FM001', NOW() - INTERVAL '40 days');

INSERT INTO TASKS (ID, FARM_ID, ASSIGNED_TO, TITLE, DESCRIPTION, STATUS, DUE_DATE, PHOTO_REQUIRED, CREATED_BY, CREATED_AT)
VALUES ('TASK005', 'FARM003', 'W006', 'Late Blight Spray - URGENT', 'Mix Metalaxyl + Mancozeb 2.5 kg/ha. Complete spray on all 20 acres today. Use protective gear', 'completed',
    TO_DATE('2026-08-18', 'YYYY-MM-DD'), 'Y', 'FM001', NOW() - INTERVAL '25 days');

INSERT INTO TASKS (ID, FARM_ID, ASSIGNED_TO, TITLE, DESCRIPTION, STATUS, DUE_DATE, PHOTO_REQUIRED, CREATED_BY, CREATED_AT)
VALUES ('TASK006', 'FARM003', 'W005', 'Harvest Ripe Tomatoes', 'Pick all red/pink tomatoes. Sort by size and quality. Pack in plastic crates. Deliver to collection center', 'pending',
    TO_DATE('2026-10-12', 'YYYY-MM-DD'), 'Y', 'FM001', NOW() - INTERVAL '2 days');

-- Farm 4 Tasks
INSERT INTO TASKS (ID, FARM_ID, ASSIGNED_TO, TITLE, DESCRIPTION, STATUS, DUE_DATE, PHOTO_REQUIRED, CREATED_BY, CREATED_AT)
VALUES ('TASK007', 'FARM004', 'W007', 'Install Pheromone Traps', 'Install 15 bollworm pheromone traps across 20 acres. Space evenly. Check traps every 3 days', 'completed',
    TO_DATE('2026-08-10', 'YYYY-MM-DD'), 'Y', 'FM001', NOW() - INTERVAL '35 days');

INSERT INTO TASKS (ID, FARM_ID, ASSIGNED_TO, TITLE, DESCRIPTION, STATUS, DUE_DATE, PHOTO_REQUIRED, CREATED_BY, CREATED_AT)
VALUES ('TASK008', 'FARM004', 'W008', 'Bollworm Spray - CRITICAL', 'Spray Emamectin benzoate 200g/ha immediately. Cover all plants thoroughly. Repeat in 10 days', 'completed',
    TO_DATE('2026-09-07', 'YYYY-MM-DD'), 'Y', 'FM001', NOW() - INTERVAL '5 days');

-- ========== ATTENDANCE (Sample attendance records) ==========

-- Recent attendance
INSERT INTO ATTENDANCE (ID, USER_ID, FARM_ID, CHECK_IN, CHECK_OUT, NOTE)
VALUES ('ATT001', 'W001', 'FARM001', NOW() - INTERVAL '1 day' + INTERVAL '7 hours', NOW() - INTERVAL '1 day' + INTERVAL '17 hours', 'Regular work day - irrigation monitoring');

INSERT INTO ATTENDANCE (ID, USER_ID, FARM_ID, CHECK_IN, CHECK_OUT, NOTE)
VALUES ('ATT002', 'W002', 'FARM001', NOW() - INTERVAL '1 day' + INTERVAL '7 hours', NOW() - INTERVAL '1 day' + INTERVAL '17 hours', 'Regular work day - weed removal');

INSERT INTO ATTENDANCE (ID, USER_ID, FARM_ID, CHECK_IN, CHECK_OUT, NOTE)
VALUES ('ATT003', 'W005', 'FARM003', NOW() - INTERVAL '1 day' + INTERVAL '7 hours', NOW() - INTERVAL '1 day' + INTERVAL '17 hours', 'Pruning and staking');

INSERT INTO ATTENDANCE (ID, USER_ID, FARM_ID, CHECK_IN, CHECK_OUT, NOTE)
VALUES ('ATT004', 'W007', 'FARM004', NOW() - INTERVAL '1 day' + INTERVAL '7 hours', NOW() - INTERVAL '1 day' + INTERVAL '17 hours', 'Pest monitoring - bollworm check');

INSERT INTO ATTENDANCE (ID, USER_ID, FARM_ID, CHECK_IN, CHECK_OUT, NOTE)
VALUES ('ATT005', 'FM001', 'FARM001', NOW() + INTERVAL '8 hours', NULL, 'Currently at farm - supervisory rounds');

-- ========== EQUIPMENT REQUESTS ==========

INSERT INTO EQUIPMENT_REQUESTS (ID, REQUESTED_BY, FARM_ID, CATEGORY, ITEM_NAME, QUANTITY, URGENCY, NOTE, STATUS, CREATED_AT)
VALUES ('EQR001', 'W005', 'FARM003', 'tools', 'Pruning Shears', '5', 'high', 'Needed for tomato pruning operations', 'approved', NOW() - INTERVAL '12 days');

INSERT INTO EQUIPMENT_REQUESTS (ID, REQUESTED_BY, FARM_ID, CATEGORY, ITEM_NAME, QUANTITY, URGENCY, NOTE, STATUS, CREATED_AT)
VALUES ('EQR002', 'W007', 'FARM004', 'pesticide', 'Additional Sprayers', '3', 'high', 'For bollworm emergency spray', 'delivered', NOW() - INTERVAL '5 days');

INSERT INTO EQUIPMENT_REQUESTS (ID, REQUESTED_BY, FARM_ID, CATEGORY, ITEM_NAME, QUANTITY, URGENCY, NOTE, STATUS, CREATED_AT)
VALUES ('EQR003', 'W001', 'FARM001', 'fertilizer', 'Urea 1000 kg', '1000 kg', 'medium', 'For upcoming nitrogen split application', 'pending', NOW() - INTERVAL '3 days');

-- ========== FARM TIMELINE (Activity log) ==========

INSERT INTO FARM_TIMELINE (ID, FARM_ID, EVENT_TYPE, EVENT_TITLE, EVENT_DESCRIPTION, USER_ID, USER_NAME, USER_ROLE, CREATED_AT)
VALUES ('TL001', 'FARM001', 'crop_planned', 'Crop Plan Approved - Rice Basmati', 'Expert Dr. Arvind Patel recommended Basmati rice cultivation. Expected yield: 5 tons/acre. Revenue forecast: Rs 4.5 lakhs', 'EX002', 'Dr. Arvind Patel', 'expert', NOW() - INTERVAL '90 days');

INSERT INTO FARM_TIMELINE (ID, FARM_ID, EVENT_TYPE, EVENT_TITLE, EVENT_DESCRIPTION, USER_ID, USER_NAME, USER_ROLE, CREATED_AT)
VALUES ('TL002', 'FARM001', 'planting', 'Rice Transplanting Completed', 'Transplanting completed for all 20 acres. Seedlings healthy. Spacing: 20x15 cm', 'W001', 'Suresh Reddy', 'worker', NOW() - INTERVAL '75 days');

INSERT INTO FARM_TIMELINE (ID, FARM_ID, EVENT_TYPE, EVENT_TITLE, EVENT_DESCRIPTION, USER_ID, USER_NAME, USER_ROLE, CREATED_AT)
VALUES ('TL003', 'FARM003', 'disease_detected', 'Late Blight Detected on Tomato', 'Lab confirmed Phytophthora infestans. Severity: Moderate. Immediate fungicide spray initiated', 'EX003', 'Dr. Meena Reddy', 'expert', NOW() - INTERVAL '25 days');

INSERT INTO FARM_TIMELINE (ID, FARM_ID, EVENT_TYPE, EVENT_TITLE, EVENT_DESCRIPTION, USER_ID, USER_NAME, USER_ROLE, CREATED_AT)
VALUES ('TL004', 'FARM004', 'pest_detected', 'Bollworm Alert - Cotton Farm', 'Bollworm larvae found on 3% plants. Pheromone traps installed. Emergency spray completed', 'EX003', 'Dr. Meena Reddy', 'expert', NOW() - INTERVAL '2 days');

INSERT INTO FARM_TIMELINE (ID, FARM_ID, EVENT_TYPE, EVENT_TITLE, EVENT_DESCRIPTION, USER_ID, USER_NAME, USER_ROLE, CREATED_AT)
VALUES ('TL005', 'FARM002', 'harvest', 'Wheat Harvest Completed - Excellent Yield!', 'Harvested 90 tons of premium wheat. Grade A quality. Sold to Punjab Flour Mills @ Rs 22/kg. Total revenue: Rs 19.8 lakhs. Profit: Rs 10 lakhs. Landowner received Rs 7 lakhs', 'FM001', 'Rajesh Kumar', 'fieldmanager', NOW() - INTERVAL '60 days');

INSERT INTO FARM_TIMELINE (ID, FARM_ID, EVENT_TYPE, EVENT_TITLE, EVENT_DESCRIPTION, USER_ID, USER_NAME, USER_ROLE, CREATED_AT)
VALUES ('TL006', 'FARM005', 'harvest', 'Chickpea Export Success!', 'Premium chickpea exported to UAE & Saudi Arabia! 48 tons @ Rs 60/kg. Record profit: Rs 16.3 lakhs. Landowner share: Rs 11.41 lakhs. GreenX first international export!', 'FM001', 'Rajesh Kumar', 'fieldmanager', NOW() - INTERVAL '90 days');



-- =========================================
-- SAMPLE DATA CREATION COMPLETE
-- =========================================
-- Total Records Created:
-- Users: 14 (1 Manager + 10 Workers + 3 Experts)
-- Farms: 5 (100 acres total - 20 acres each)
-- Crops: 5 (Rice, Wheat, Tomato, Cotton, Chickpea)
-- Soil Reports: Real data from agricultural research
-- Inventory: 15 items (seeds, fertilizers, pesticides, equipment)
-- Harvests: 3 records (2 completed with export data, 1 forecasted)
-- Diagnostics: 4 expert reports
-- Lab Reports: 2 detailed reports
-- Costs: 10 expense records
-- Tasks: 8 tasks (mix of completed and pending)
-- Farm Assignments: Complete assignment structure
-- Timeline Events: 6 major activities logged
-- =========================================
