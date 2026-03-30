# AI Agent & Crop Health Analysis System

## Overview

A comprehensive AI-powered farm management system that analyzes crop health, generates intelligent alerts, provides recommendations, and visualizes real-time farm data with interactive charts.

## Architecture

### Backend Services (Java Spring Boot)

#### 1. **AIAgentService** (`com.greenx.farmapi.service.AIAgentService`)
- **Purpose**: Main orchestrator for farm data analysis
- **Key Methods**:
  - `analyzeFarm()` - Comprehensive farm analysis with health score, alerts, and recommendations
  - `getCropHealthStatus()` - Real-time crop health assessment
  - `getFarmAlerts()` - Current active alerts for a farm
- **Features**:
  - Weighted health scoring across 5 dimensions
  - Intelligent recommendation generation
  - Risk level calculation (low, medium, high, critical)

#### 2. **CropHealthAnalyzer** (`com.greenx.farmapi.service.CropHealthAnalyzer`)
- **Purpose**: Detailed health scoring based on soil and environmental data
- **Analysis Dimensions** (weighted):
  - **Soil Score** (20%) - pH level and organic content analysis
  - **Nutrient Score** (25%) - N, P, K balance assessment
  - **Moisture Score** (20%) - Soil water content analysis
  - **Stem & Root Health** (20%) - Growth potential assessment
  - **Disease Resistance** (15%) - Disease/pest risk evaluation
- **Scoring Logic**:
  - Each dimension scored 0-100
  - Weighted average produces 0-100 overall score
  - Categorized as: Excellent (80+), Good (60-80), Fair (40-60), Poor (20-40), Critical (<20)

#### 3. **AlertService** (`com.greenx.farmapi.service.AlertService`)
- **Purpose**: Generate contextual alerts based on data analysis
- **Alert Types**:
  - `soil` - pH and organic carbon issues
  - `nutrient` - N, P, K deficiencies or excesses
  - `moisture` - Drought stress or waterlogging
  - `disease` - Pest and disease risk warnings
  - `health` - Overall crop health warnings
- **Severity Levels**:
  - `HIGH` - Critical action required (red)
  - `MEDIUM` - Attention needed (yellow)
  - `LOW` - Informational (blue)
- **Example Alerts**:
  ```
  🔴 Severe Nitrogen Deficiency (102 ppm)
  ⚠️ High Soil Moisture (57%) - Waterlogging Risk
  💧 Soil pH 5.2 - Very Acidic
  🚨 Critical Crop Health - Immediate Intervention Required
  ```

#### 4. **AiAnalysisController** (`com.greenx.farmapi.controller.AiAnalysisController`)
- **API Endpoints**:
  - `POST /api/ai/analyze` - Full farm analysis
  - `POST /api/ai/health` - Health score only
  - `POST /api/ai/alerts` - Alerts only
  - `GET /api/ai/health` - Service health check

### Frontend Components (React)

#### 1. **AIAnalysisPanel** (`src/components/ai/AIAnalysisPanel.tsx`)
- **Purpose**: Main orchestrator component for dashboards
- **Features**:
  - Real-time data fetching with React Query
  - Auto-refresh every 15 minutes
  - Tabbed interface (Overview, Analytics, Alerts, Recommendations)
  - Error handling and retry logic
- **Props**:
  ```typescript
  {
    farmId: string;
    farmData?: Record<string, any>;
    onDataLoaded?: (data: any) => void;
  }
  ```

#### 2. **CropHealthCard** (`src/components/ai/CropHealthCard.tsx`)
- **Display**:
  - Large health score (0-100) with color coding
  - Circular progress indicator
  - 5 metric breakdown cards
  - Status badge with color
  - Last analysis timestamp
- **Colors**: Green (excellent), Blue (good), Yellow (fair), Orange (poor), Red (critical)

#### 3. **HealthCharts** (`src/components/ai/HealthCharts.tsx`)
- **Visualizations** (using Recharts):
  - **Radar Chart**: 5-dimensional health metrics visualization
  - **Bar Chart**: Soil metrics (pH, N, P, K, Moisture, Organic Carbon)
  - **Line Chart**: Historical health trends with multiple data series
  - **Score Cards**: Summary of all 5 dimensions
- **Color Coding**: Green, Blue, Yellow, Orange, Red for visual distinction

#### 4. **AlertsPanel** (`src/components/ai/AlertsPanel.tsx`)
- **Features**:
  - Severity-based sorting (HIGH → MEDIUM → LOW)
  - Dismiss individual alerts
  - Alert count display
  - "No Active Alerts" state
  - Color-coded by severity
- **Display Format**:
  ```
  🔴 [TITLE] [Severity Badge]
  Message with detailed information
  Timestamp
  ```

#### 5. **RecommendationsPanel** (`src/components/ai/RecommendationsPanel.tsx`)
- **Features**:
  - AI-generated actionable recommendations
  - Emoji-coded by type (soil, nutrients, moisture, disease, etc.)
  - Contextual based on farm data and health analysis
- **Examples**:
  - 🔴 Acidic soil correction
  - ⚠️ Nutrient supplementation
  - 💧 Irrigation adjustment
  - 🌾 Organic matter improvement
  - 🐛 Pest management

## Integration Points

### Field Manager Dashboard
- **Tab**: "Field Data" (new)
- **Features**:
  - Farm selection dropdown
  - Full AI Analysis Panel
  - Report incident button
  - Real-time health monitoring

### Landowner Dashboard  
- **Tab**: "Health" (new)
- **Features**:
  - Farm-specific AI analysis
  - Complete health visualization
  - Profit impact insights
  - Historical trends

### Expert Dashboard
- **Expanded Farm View**:
  - AI Analysis integrated before diagnostic form
  - Health context for expert decisions
  - Soil data reference below AI panel
  - Better informed prescriptions

## Data Flow

```
Farm Data (Soil, Weather, Crops)
        ↓
[AIAgentService]
        ↓
    ├─→ [CropHealthAnalyzer] → Health Scores
    ├─→ [AlertService] → Alerts
    └─→ Recommendations Engine
        ↓
[AiAnalysisController]
        ↓
Backend Response JSON
        ↓
[AIAnalysisPanel] (React)
        ↓
    ├─→ [CropHealthCard]
    ├─→ [HealthCharts]  
    ├─→ [AlertsPanel]
    └─→ [RecommendationsPanel]
```

## Key Features

### 1. Real-Time Health Scoring
- Multi-dimensional analysis of crop health
- Dynamic scoring based on current farm conditions
- Color-coded status indicators
- Visual progress indicators

### 2. Intelligent Alerts
- Threshold-based monitoring
- Contextual alert messages
- Severity classification
- Actionable information

### 3. AI Recommendations
- Generated based on analysis gaps
- Specific, actionable advice
- Prioritized by urgency
- Covers soil, nutrients, moisture, disease, pest

### 4. Visual Analytics
- Radar charts for multi-dimensional comparison
- Bar charts for individual metrics
- Line charts for historical trends  
- Color-coded by health status
- Interactive and responsive

### 5. Auto-Refresh
- 15-minute refresh interval for background updates
- Manual refresh button
- Real-time data synchronization
- Stale time management (5 minutes)

## Thresholds & Scoring Logic

### Soil pH Analysis
- Optimal: 6.0-7.5
- Acceptable: 5.5-8.0
- Marginal: 5.0-8.5
- Critical: <5.0 or >8.5

### Nutrient Levels (PPM)
- **Nitrogen**: Optimal 150-250
- **Phosphorus**: Optimal 20-30
- **Potassium**: Optimal 200-300

### Moisture Content
- Optimal: 25-40%
- Acceptable: 20-45%
- Critical Low: <15%
- Critical High: >55%

### Organic Carbon
- Good: >1.0%
- Acceptable: 0.7-1.0%
- Poor: <0.5%

## API Response Format

### Analyze Farm Response
```json
{
  "success": true,
  "data": {
    "health": {
      "overallScore": 72,
      "status": "Good",
      "color": "blue",
      "soilScore": 75,
      "nutrientScore": 68,
      "moistureScore": 80,
      "stemAndRootScore": 70,
      "diseaseScore": 65,
      "metrics": {
        "soilHealth": {
          "name": "Soil Health",
          "score": 75,
          "status": "Good",
          "color": "blue"
        },
        ...
      }
    },
    "alerts": [
      {
        "id": "uuid",
        "title": "Low Potassium",
        "message": "Potassium level (145 ppm) is below optimal...",
        "type": "nutrient",
        "severity": "medium",
        "timestamp": "2026-03-07T...",
        "read": false
      }
    ],
    "recommendations": [
      "⚠️ Nitrogen level (156 ppm) is within optimal range.",
      "💧 Soil moisture is 32% - ideal for most crops.",
      "🌾 Low organic matter. Add compost or manure..."
    ],
    "summary": {
      "overallHealth": 72,
      "riskLevel": "medium",
      "lastAnalyzed": "2026-03-07T...",
      "actionRequired": true
    }
  }
}
```

## Performance Considerations

- **API Calls**: Cached with 5-minute stale time
- **Polling**: 15-minute auto-refresh interval
- **Bundle Impact**: ~200KB gzipped (Recharts included)
- **Database Queries**: Single pass analysis (no N+1 queries)
- **Real-time Updates**: Uses React Query for efficient data management

## Future Enhancements

1. **Machine Learning**
   - Predictive health scoring
   - Anomaly detection
   - Seasonal adjustments
   - Historical pattern learning

2. **Integration**
   - Weather API integration
   - Satellite imagery analysis
   - IoT sensor data
   - External weather forecasts

3. **Extended Analytics**
   - Yield prediction
   - Cost-benefit analysis
   - CO2 footprint tracking
   - Crop rotation recommendations

4. **Notifications**
   - Email alerts for critical issues
   - SMS notifications
   - Push notifications
   - Scheduled reports

5. **Expert System**
   - Expert recommendations based on patterns
   - Community benchmarking
   - Best practice suggestions
   - Regional adaptations

## Deployment

### Prerequisites
- Java 21+
- Spring Boot 3.2.0+
- Node.js 18+
- npm/yarn

### Build & Run

**Backend**:
```bash
cd java-backend
mvn clean package
java -jar target/farm-management-api-1.0.0.jar
```

**Frontend**:
```bash
npm install
npm run build
# or
npm run dev  # for development
```

### Environment Variables
```env
VITE_JAVA_API_URL=http://localhost:8082/api
```

## Testing

### Health Check
```bash
curl http://localhost:8082/api/ai/health
```

### Sample Analysis
```bash
curl -X POST http://localhost:8082/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "id": "farm-001",
    "soil_ph": 6.8,
    "soil_nitrogen": 180,
    "soil_phosphorus": 22,
    "soil_potassium": 210,
    "soil_organic_carbon": 0.8,
    "soil_moisture": 35,
    "pest_risk": "low",
    "disease_risk": "medium"
  }'
```

## Troubleshooting

**No data showing in charts**:
- Check that farm has soil data
- Verify API connection to backend
- Check browser console for errors

**Slow analysis**:
- May take 2-3 seconds for initial analysis
- Background refresh happens every 15 minutes
- Use manual refresh button to force immediate update

**Stale data**:
- Check "Last analyzed" timestamp
- Click "Refresh" button on Health card
- Clear browser cache if needed

## Files Modified/Created

### Backend Files Created
- `src/main/java/com/greenx/farmapi/service/AIAgentService.java`
- `src/main/java/com/greenx/farmapi/service/CropHealthAnalyzer.java`
- `src/main/java/com/greenx/farmapi/service/AlertService.java`
- `src/main/java/com/greenx/farmapi/controller/AiAnalysisController.java`

### Frontend Files Created
- `src/components/ai/AIAnalysisPanel.tsx`
- `src/components/ai/CropHealthCard.tsx`
- `src/components/ai/HealthCharts.tsx`
- `src/components/ai/AlertsPanel.tsx`
- `src/components/ai/RecommendationsPanel.tsx`

### Files Modified
- `src/pages/FieldManagerDashboard.tsx` - Added AI panel to fielddata tab
- `src/pages/LandownerDashboard.tsx` - Added health tab with AI analysis
- `src/pages/ExpertDashboard.tsx` - Added AI analysis to expanded farm view

## Support

For issues or questions about the AI Agent system:
1. Check the API health endpoint
2. Review browser console for errors
3. Verify farm data is complete
4. Check Java backend logs for service errors
