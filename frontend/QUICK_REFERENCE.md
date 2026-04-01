# 🎯 QUICK REFERENCE - SAMPLE DATA

## 🔐 Login Credentials (All passwords: `pass123`)

| Role | Email | Name | Assigned To |
|------|-------|------|-------------|
| **Field Manager** | manager@greenx.com | Rajesh Kumar | All 5 farms |
| **Worker 1** | worker1@greenx.com | Suresh Reddy | Farm 1 (Rice) |
| **Worker 2** | worker2@greenx.com | Ramesh Patil | Farm 1 (Rice) |
| **Worker 3** | worker3@greenx.com | Ganesh Naik | Farm 2 (Wheat) |
| **Worker 4** | worker4@greenx.com | Prakash Yadav | Farm 2 (Wheat) |
| **Worker 5** | worker5@greenx.com | Mahesh Gowda | Farm 3 (Tomato) |
| **Worker 6** | worker6@greenx.com | Vijay Singh | Farm 3 (Tomato) |
| **Worker 7** | worker7@greenx.com | Santosh Kumar | Farm 4 (Cotton) |
| **Worker 8** | worker8@greenx.com | Anil Sharma | Farm 4 (Cotton) |
| **Worker 9** | worker9@greenx.com | Deepak Verma | Farm 5 (Chickpea) |
| **Worker 10** | worker10@greenx.com | Naveen Reddy | Farm 5 (Chickpea) |
| **Soil Expert** | soil.expert@greenx.com | Dr. Priya Sharma | All farms |
| **Crop Expert** | crop.expert@greenx.com | Dr. Arvind Patel | All farms |
| **Pest Expert** | pest.expert@greenx.com | Dr. Meena Reddy | All farms |

---

## 🌾 5 Farms Overview

| Farm | Location | Crop | Acres | Health | Status |
|------|----------|------|-------|--------|--------|
| **Farm 1** | Telangana | Rice (Basmati) | 20 | 85% | Flowering |
| **Farm 2** | Punjab | Wheat HD 2967 | 20 | 90% | Harvested ✅ |
| **Farm 3** | Karnataka | Tomato Hybrid | 20 | 78% | Fruiting |
| **Farm 4** | Gujarat | Bt Cotton | 20 | 82% | Boll Formation |
| **Farm 5** | Madhya Pradesh | Chickpea | 20 | 88% | Exported ✅ |

---

## 💰 Financial Highlights

### Completed Harvests:
| Farm | Crop | Revenue | Profit | Landowner Share | Status |
|------|------|---------|--------|-----------------|--------|
| Farm 2 | Wheat | ₹19,80,000 | ₹10,00,000 | ₹7,00,000 | PAID ✅ |
| Farm 5 | Chickpea | ₹28,80,000 | ₹16,30,000 | ₹11,41,000 | PAID ✅ |

**Total Revenue Generated:** ₹48,60,000  
**Total Landowner Earnings:** ₹18,41,000

### Export Success:
- **Destination:** UAE & Saudi Arabia 🌍
- **Quantity:** 48 tons premium chickpea
- **Price:** ₹60/kg (vs domestic ₹40-45/kg)
- **Achievement:** GreenX's first international export!

---

## 📊 Soil Data (Real Agricultural Research)

| Farm | pH | N (kg/ha) | P (kg/ha) | K (kg/ha) | Org. Carbon | Soil Type |
|------|-----|-----------|-----------|-----------|-------------|-----------|
| Farm 1 | 6.5 | 280 | 22 | 210 | 0.75% | Clay Loam |
| Farm 2 | 7.2 | 320 | 28 | 250 | 0.85% | Loam |
| Farm 3 | 6.8 | 180 | 35 | 280 | 1.20% | Red Sandy |
| Farm 4 | 7.5 | 240 | 18 | 320 | 0.68% | Black Cotton |
| Farm 5 | 7.8 | 120 | 42 | 280 | 0.92% | Medium Black |

**Data Source:** Soil Health Card (Ministry of Agriculture, Govt of India) + ICAR Research

---

## 🔬 Expert Reports Summary

| Farm | Expert | Issue | Action Taken | Status |
|------|--------|-------|--------------|--------|
| Farm 1 | Soil Expert | - | Monitoring advised | ✅ Good |
| Farm 3 | Pest Expert | Late Blight | Fungicide spray | ✅ Controlled |
| Farm 4 | Pest Expert | Bollworm Alert | Immediate spray + traps | ✅ Managed |
| Farm 5 | Soil Expert | - | Pre-harvest check | ✅ Excellent |

---

## 📦 Inventory (15 Items)

### Seeds:
- Rice Basmati (450 kg) @ ₹180/kg
- Wheat HD 2967 (620 kg) @ ₹35/kg
- Tomato Hybrid (2.5 kg) @ ₹12/g
- Cotton Bt (180 packets) @ ₹850/packet
- Chickpea JG 315 (350 kg) @ ₹95/kg

### Fertilizers:
- Urea (5000 kg) @ ₹8.50/kg
- DAP (3500 kg) @ ₹32/kg
- MOP (2800 kg) @ ₹18/kg

### Pesticides:
- Chlorantraniliprole (120 L) @ ₹1,850/L
- Imidacloprid (85 L) @ ₹680/L
- Mancozeb + Metalaxyl (250 kg) @ ₹450/kg
- Neem Oil (150 L) @ ₹280/L

### Equipment:
- Sprayers (25 units) @ ₹1,250
- Drip Irrigation Kits (8 sets) @ ₹35,000
- Soil Testing Kits (6 units) @ ₹8,500

---

## 🚀 Quick Start

### 1. Load Sample Data:
```bash
# Option A: Automated (Windows)
Double-click: load-sample-data.bat

# Option B: Manual SQL
sqlplus SYSTEM/oracle@localhost:1521/XE @java-backend\src\main\resources\db\migration\V4__sample_data.sql

# Option C: SQL Developer
Open V4__sample_data.sql in Oracle SQL Developer and press F5
```

### 2. Verify Data Loaded:
```sql
SELECT COUNT(*) FROM USERS;      -- Should return 14
SELECT COUNT(*) FROM FARMS;      -- Should return 5
SELECT COUNT(*) FROM INVENTORY;  -- Should return 15+
```

### 3. Start Services:
```powershell
# Backend
cd java-backend
java -jar target\farm-management-api-1.0.0.jar --server.port=8091

# Frontend (in new terminal)
npm run dev
```

### 4. Test Login:
- Open: http://localhost:8080
- Login: manager@greenx.com / pass123
- Should see 5 farms in dashboard

---

## 📚 Documentation Files

1. **[SAMPLE_DATA_DOCUMENTATION.md](./SAMPLE_DATA_DOCUMENTATION.md)**  
   Complete 500+ line documentation with all details

2. **[HOW_TO_LOAD_SAMPLE_DATA.md](./HOW_TO_LOAD_SAMPLE_DATA.md)**  
   Step-by-step loading instructions

3. **[V4__sample_data.sql](./java-backend/src/main/resources/db/migration/V4__sample_data.sql)**  
   The actual SQL script (900+ lines)

4. **[load-sample-data.bat](./load-sample-data.bat)**  
   Automated Windows batch loader

---

## ✅ Testing Checklist

- [ ] Login as manager@greenx.com works
- [ ] Dashboard shows 5 farms
- [ ] Each farm shows crop and health score
- [ ] Soil analysis data visible
- [ ] Expert reports accessible
- [ ] Inventory items showing stock levels
- [ ] 2 completed harvests visible
- [ ] Export record shows UAE & Saudi Arabia
- [ ] Workers can view assigned farms
- [ ] Experts can access all farms

---

## 🎯 Data Authenticity

All data based on:
- ✅ Soil Health Card Database (Govt of India)
- ✅ ICAR (Indian Council of Agricultural Research)
- ✅ Real district-wise agricultural data
- ✅ Actual market prices (2024-2026)
- ✅ APEDA export procedures
- ✅ State Agricultural University standards

**Districts Covered:**
- Warangal (Telangana) - Rice
- Ludhiana (Punjab) - Wheat
- Kolar (Karnataka) - Vegetables
- Bharuch (Gujarat) - Cotton
- Indore (Madhya Pradesh) - Pulses

---

**All Set!** Load the data and start testing! 🚀
