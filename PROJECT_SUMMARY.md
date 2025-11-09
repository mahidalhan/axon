# Brain Score - Mobile App MVP

## Overview
A comprehensive mobile neuroplasticity app that analyzes EEG data from Muse headbands, integrates Apple Health data (sleep & workouts), and provides science-based insights to optimize learning and cognitive performance.

## Tech Stack

### Backend (FastAPI)
- **Framework**: FastAPI 0.115.5
- **Data Processing**: Pandas, PyArrow for parquet files
- **Data Source**: Processed JSON/Parquet files (20 Muse participants + Apple Health)
- **API Endpoints**: 10 RESTful endpoints

### Frontend (Expo/React Native)
- **Framework**: Expo with TypeScript
- **Navigation**: Bottom tabs (@react-navigation/bottom-tabs)
- **Charts**: react-native-gifted-charts (chosen for simplicity & beauty - "Steve Jobs would approve")
- **State**: Zustand (lightweight)
- **Storage**: AsyncStorage
- **UI**: Custom components with clean, health-app-inspired design

## Features Implemented

### 1. Home Dashboard ✅
- **Brain Score Rings**: Circular progress indicators showing Neural State, Brain Score, and Sleep Quality
- **Optimal Window Status**: Real-time detection of peak learning periods
- **Today's Session Summary**: Peak LRI, optimal minutes, session score
- **Current State Metrics**: Alertness, Focus, Arousal Balance with animated bars
- **Daily Insights**: AI-generated recommendations

### 2. Session Analysis ✅
- **Session Overview**: Duration, peak LRI, overall score
- **LRI Timeline Chart**: Beautiful gradient line chart showing cognitive performance
- **Time Distribution**: Visual breakdown of optimal/moderate/low states
- **Optimal Windows List**: Quality-coded windows with duration
- **Component Scores**: Alertness, Focus, Balance metrics
- **Insights & Recommendations**: Actionable advice based on data

### 3. Health Data ✅
- **Sleep Records**: Last 7 days with scores, efficiency, HRV
- **Workout History**: Exercise tracking with intensity levels
- **Post-Exercise Windows**: Information on optimal learning periods

### 4. Educational Content ✅
- **Three-Phase Neuroplasticity Model**: Trigger, Signal, Consolidation
- **8 Sleep Metrics Explained**: Why each metric matters
- **Actionable Tips**: Science-based sleep and learning optimization
- **Research References**: Huberman Lab, Matthew Walker

### 5. Settings ✅
- **Participant Selection**: Choose from 20 demo participants
- **Preferences**: Notifications, threshold settings
- **App Information**: Version, privacy policy links

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/session/analyze` | POST | Analyze Muse EEG session |
| `/api/session/optimal-window-status` | GET | Current optimal window status |
| `/api/session/today-summary` | GET | Daily session summary |
| `/api/session/current-metrics` | GET | Live alertness/focus/balance |
| `/api/brain-score/today` | GET | Composite brain score |
| `/api/sleep/last20` | GET | Last 20 days sleep data |
| `/api/sleep/recent` | GET | Recent sleep records |
| `/api/workouts/last20` | GET | Last 20 days workouts |
| `/api/workouts/recent` | GET | Recent workouts |

## Data Sources

### Muse EEG Data (20 participants)
- **Location**: `/app/data/processed/muse/`
- **Files**: 
  - `participant_museData{0-19}_session.json` - Session metadata
  - `participant_museData{0-19}_windows.parquet` - Window-level EEG metrics
- **Metrics**: LRI, alertness, focus, arousal_balance, theta/alpha/beta/gamma bands

### Apple Health Data
- **Location**: `/app/data/processed/apple_health/`
- **Files**:
  - `sleep_last_20_days.json` - Demo sleep data
  - `workouts_last_20_days.json` - Demo workout data
- **Metrics**: Sleep score, HRV, efficiency, workout intensity

## Design Philosophy

### UI Inspiration
Modeled after premium health tracking apps with:
- Clean white cards with rounded corners
- Circular progress rings for at-a-glance metrics
- Color-coded status indicators (green=excellent, yellow=good, orange=moderate)
- Generous padding and breathable layouts
- Subtle shadows and depth

### Color Palette
- **Primary**: Indigo (#4F46E5)
- **Success/Optimal**: Green (#10B981)
- **Warning/Moderate**: Amber (#F59E0B)
- **Error/Low**: Red (#EF4444)
- **Neutral**: Gray scale (#F9FAFB to #1F2937)

### Chart Library Selection
**Winner: react-native-gifted-charts**
- Beautiful gradients out of the box
- Simple API: `<LineChart data={data} />` just works
- Native performance (60fps)
- Perfect for health/fitness visualizations
- "Simplicity is the ultimate sophistication" - Steve Jobs

## Key Implementation Details

### Backend Fixes
- ✅ Proper timestamp serialization (pandas Timestamp → ISO strings)
- ✅ NaN value handling for all float metrics
- ✅ Safe mean calculations with fallbacks
- ✅ JSON-compliant data formatting

### Frontend Architecture
- **Bottom Tab Navigation**: 5 main sections
- **Reusable Components**: Card, CircularProgress
- **Type-Safe API**: TypeScript interfaces
- **Error Handling**: Try-catch with fallbacks
- **Pull-to-Refresh**: On home dashboard

### Mobile-First Considerations
- ✅ Touch-optimized tap targets (44x44 pts minimum)
- ✅ Safe area insets for notched devices
- ✅ Platform-specific code (iOS/Android)
- ✅ ScrollView with keyboard handling
- ✅ Responsive layouts

## Testing Recommendations

### Backend Testing
```bash
# Health check
curl http://localhost:8001/api/health

# Session analysis
curl -X POST http://localhost:8001/api/session/analyze \
  -H "Content-Type: application/json" \
  -d '{"participant_id": 0, "max_hours": 1.0}'

# Get optimal window status
curl http://localhost:8001/api/session/optimal-window-status?participant_id=0
```

### Frontend Testing
1. Open Expo Go app on mobile device
2. Scan QR code
3. Test navigation between tabs
4. Test pull-to-refresh on home
5. Verify charts render correctly
6. Check different participant data

## Future Enhancements (Post-MVP)

1. **Real Muse Integration**: Connect live Muse headbands
2. **User Authentication**: Multi-user support
3. **Data Persistence**: MongoDB user data storage
4. **Push Notifications**: Optimal window alerts
5. **Supplement Tracking**: Log and correlate supplements
6. **Apple Health Import**: Upload export.xml
7. **Social Features**: Compare scores with friends
8. **Advanced Analytics**: Long-term trends, ML predictions

## Scientific Foundation

Based on research from:
- **Huberman Lab**: Neuroplasticity protocols
- **Matthew Walker**: "Why We Sleep" - Memory consolidation
- **Peer-reviewed studies**: HRV and memory, post-exercise learning windows

## Project Structure

```
/app
├── backend/
│   ├── server.py (FastAPI endpoints)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── App.tsx (Navigation setup)
│   ├── src/
│   │   ├── screens/ (5 main screens)
│   │   ├── components/ (Card, CircularProgress)
│   │   └── services/ (API client)
│   ├── assets/ (Icons, splash)
│   └── package.json
├── data/processed/ (Muse & Apple Health data)
├── pipeline_scripts/ (Data processing - already built)
└── docs/ (Comprehensive documentation)
```

## Running the App

### Backend
```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd /app/frontend
npm start
# or
expo start
```

## Deployment Notes

- Backend runs on port 8001
- Frontend Expo metro on port 3000
- `/api/*` requests automatically proxied to port 8001
- MongoDB configured but not used in MVP (file-based data)

## Success Metrics

✅ **Backend**: All 10 endpoints working, JSON-compliant responses
✅ **Frontend**: 5 screens implemented with navigation
✅ **UI/UX**: Clean, mobile-optimized, health-app-inspired design
✅ **Charts**: Beautiful LRI timeline with react-native-gifted-charts
✅ **Data**: Successfully loading from 20 Muse participants + Apple Health
✅ **Education**: Comprehensive sleep & neuroplasticity content

## MVP Complete! 🎉

The Brain Score app is ready for user testing. All core features are implemented:
- EEG session analysis with optimal window detection
- Sleep and workout tracking
- Educational content
- Beautiful, native-feeling mobile UI
- Real data from 20 participants

Next step: User testing and feedback collection!
