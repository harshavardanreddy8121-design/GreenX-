# 🚀 HOW TO LOAD SAMPLE DATA

## Quick Start Guide

Your sample data SQL file is ready at:
```
java-backend/src/main/resources/db/migration/V4__sample_data.sql
```

## 📝 What's Included

- **14 Users:** 1 Field Manager, 10 Workers, 3 Experts (Soil, Crop, Pest)
- **5 Farms:** 100 acres total (20 acres each) across 5 Indian states
- **5 Different Crops:** Rice, Wheat, Tomato, Cotton, Chickpea
- **Real Soil Data:** Based on Soil Health Card and ICAR research
- **Complete Records:** Inventory, Costs, Harvests, Expert Reports, Lab Analysis
- **Export Data:** Successful international export to UAE & Saudi Arabia

## 🔐 All Passwords: **`pass123`**

---

## Method 1: Automatic Loading (Recommended)

### Option A: Using Batch Script (Windows)

1. **Double-click** `load-sample-data.bat`
2. When prompted, enter Oracle password: `oracle`
3. Wait for completion message
4. Backend will start automatically

### Option B: Using PowerShell

```powershell
cd java-backend

# Stop backend if running
taskkill /F /IM java.exe

# Load data using SQL*Plus
sqlplus SYSTEM/oracle@localhost:1521/XE @src\main\resources\db\migration\V4__sample_data.sql

# Start backend
java -jar target\farm-management-api-1.0.0.jar --server.port=8091
```

---

## Method 2: Using Oracle SQL Developer (GUI)

1. **Open Oracle SQL Developer**
2. **Connect to your database:**
   - Username: SYSTEM
   - Password: oracle
   - Hostname: localhost
   - Port: 1521
   - SID/Service: XE

3. **Open SQL file:**
   - File → Open → Navigate to `java-backend/src/main/resources/db/migration/V4__sample_data.sql`

4. **Run the script:**
   - Press F5 (Run Script) OR
   - Click the "Run Script" icon (green play button with document)

5. **Verify completion:**
   - Look for "COMMIT complete" at the end
   - Check for any errors in output

6. **Start the backend:**
   ```powershell
   cd java-backend
   java -jar target\farm-management-api-1.0.0.jar --server.port=8091
   ```

---

## Method 3: SQL*Plus Command Line

```bash
# Navigate to project root
cd C:\Users\green\web-hug-studio-46-043df96f-70335c46-main

# Connect and run
sqlplus SYSTEM/oracle@localhost:1521/XE @java-backend\src\main\resources\db\migration\V4__sample_data.sql
```

---

## ✅ Verification

After loading data, verify with these queries:

```sql
-- Check users
SELECT COUNT(*) FROM USERS;
-- Expected: 14 users (was 7 before)

-- Check farms
SELECT NAME, CROP, TOTAL_LAND FROM FARMS;
-- Expected: 5 farms

-- Check inventory
SELECT ITEM_NAME, QUANTITY_IN_STOCK FROM INVENTORY;
-- Expected: 15+ items

-- Check harvests
SELECT CROP_NAME, HARVEST_DATE, LANDOWNER_SHARE, EXPORT_COUNTRY FROM HARVESTS;
-- Expected: 3 harvests (1 with export to UAE & Saudi Arabia)
```

---

## 🔓 Test Login Credentials

### Field Manager:
- **Email:** manager@greenx.com
- **Password:** pass123
- **Access:** All 5 farms

### Workers:
- worker1@greenx.com to worker10@greenx.com
- **Password:** pass123
- **Access:** Assigned specific farm

### Experts:
- **Soil Expert:** soil.expert@greenx.com
- **Crop Expert:** crop.expert@greenx.com
- **Pest Expert:** pest.expert@greenx.com
- **Password:** pass123
- **Access:** All farms

---

## 🌾 Farm Details

1. **Green Valley Rice Farm** (Telangana) - 20 acres Basmati Rice
2. **Golden Fields Wheat Farm** (Punjab) - 20 acres Wheat ✅ Harvested
3. **Red Harvest Tomato Farm** (Karnataka) - 20 acres Tomato
4. **White Gold Cotton Farm** (Gujarat) - 20 acres Bt Cotton
5. **Pulse Power Chickpea Farm** (MP) - 20 acres Chickpea ✅ Exported to Middle East

---

## 🎯 What to Test

After loading data, you can:

1. **Login as Field Manager:**
   - View all 5 farms
   - Check farm health scores
   - Review expert diagnostic reports
   - Approve costs and tasks

2. **Login as Worker:**
   - View assigned farm
   - Complete pending tasks
   - Mark attendance

3. **Login as Expert:**
   - Submit farm diagnostics
   - View soil analysis reports
   - Create treatment prescriptions

4. **Test AI Agent:**
   ```bash
   curl -X POST http://localhost:8091/api/ai/analyze \
     -H "Content-Type: application/json" \
     -d "{\"farm_id\":\"FARM001\", \"soil_ph\":6.5, \"nitrogen\":280}"
   ```

---

## 📊 Sample Data Highlights

### Completed Harvests:
- ✅ **Wheat:** 90 tons, ₹19.8L revenue, ₹7L to landowner
- ✅ **Chickpea Export:** 48 tons to UAE/Saudi, ₹28.8L revenue, ₹11.41L to landowner

### Active Crops:
- 🌾 Rice - Flowering stage (85% health)
- 🍅 Tomato - Fruiting stage (78% health - disease controlled)
- 🌼 Cotton - Boll formation (82% health - pest alert managed)

### Expert Reports:
- 4 detailed diagnostic reports
- 2 lab analysis reports
- Real pest/disease alerts with treatments

---

## 🚨 Troubleshooting

### "Table or view does not exist"
- Ensure V1, V2, V3 migrations ran first
- Check if USERS table exists: `SELECT * FROM USERS;`

### "Unique constraint violated"
- Data may already be loaded
- Check user count: `SELECT COUNT(*) FROM USERS;`
- If you want to reload, delete existing data

 first

### "ORA-12154: TNS:could not resolve"
- Verify Oracle service is running
- Check connection string: `localhost:1521/XE`
- Test with: `sqlplus SYSTEM/oracle@localhost:1521/XE`

### "Cannot authenticate"
- Default Oracle XE password is `oracle`
- If changed, use your custom password

---

## 📚 Complete Documentation

For detailed information about all sample data, see:
- **[SAMPLE_DATA_DOCUMENTATION.md](./SAMPLE_DATA_DOCUMENTATION.md)** - Complete guide with all details
- Includes all login credentials, farm details, soil reports, export data, etc.

---

## 🎉 Success Checklist

After loading, you should see:

- [ ] Login works with manager@greenx.com / pass123
- [ ] Dashboard shows 5 farms
- [ ] Each farm has soil analysis data
- [ ] Inventory shows 15+ items
- [ ] 2 completed harvests visible
- [ ] Expert diagnostic reports present
- [ ] Workers can view assigned farms
- [ ] Experts can access all farms
- [ ] Export record shows UAE & Saudi Arabia

---

**Ready to Load?** Run `load-sample-data.bat` or follow Method 2 above!

For questions, see [SAMPLE_DATA_DOCUMENTATION.md](./SAMPLE_DATA_DOCUMENTATION.md)
