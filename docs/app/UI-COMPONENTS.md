# Mobile App UI Components Specification

**Version:** 1.0 (Hackathon MVP - Session-Focused)
**Date:** November 8, 2025

---

## Design Philosophy

**Core Value Proposition:**
> "Know WHEN your brain is ready to learn, not just HOW MUCH you studied"

**UI Principles:**
- Real-time feedback (live LRI updates)
- Actionable insights (specific time recommendations)
- Science-backed (show Huberman framework connections)
- Minimal friction (auto-import Apple Health data)

---

## Screen Architecture

```
App Flow:
┌─────────────────────────────────────────────┐
│ 1. Home Screen (Dashboard)                  │
│    └─→ Current Optimal Window Status        │
├─────────────────────────────────────────────┤
│ 2. Session Analysis Screen                  │
│    └─→ EEG Timeline + Optimal Windows       │
├─────────────────────────────────────────────┤
│ 3. Apple Health Import Screen               │
│    ├─→ Workout Import                       │
│    └─→ Sleep Import                         │
├─────────────────────────────────────────────┤
│ 4. Supplement Tracker Screen                │
│    └─→ Log Intake (UI only, no algo)        │
├─────────────────────────────────────────────┤
│ 5. Settings Screen                          │
│    └─→ Notification preferences             │
└─────────────────────────────────────────────┘
```

---

## Screen 1: Home Dashboard

### Purpose
Show real-time optimal learning window status and today's session summary.

### Layout Components

#### A. Hero Section - Optimal Window Status Card
```
┌─────────────────────────────────────────────┐
│  🔥 OPTIMAL WINDOW ACTIVE                   │
│                                             │
│  ┌─────────────┐                           │
│  │             │  2h 45m remaining          │
│  │    LRI      │                           │
│  │    78       │  Your brain is in peak    │
│  │   /100      │  learning state           │
│  │             │                           │
│  └─────────────┘                           │
│                                             │
│  Post-Exercise Boost: 1.3x                 │
│  Workout: 30 min run at 7:00 AM            │
│                                             │
│  [Start Focus Session →]                   │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
GET /api/session/optimal-window-status
{
  "in_optimal_window": true,
  "current_lri": 78,
  "hours_since_workout": 1.25,
  "hours_remaining": 2.75,
  "post_exercise_multiplier": 1.3,
  "workout_type": "Running",
  "workout_start": "2025-11-08T07:00:00",
  "window_end": "2025-11-08T11:00:00",
  "message": "Peak neuroplasticity window - optimal time for deep learning"
}
```

**States:**
- **Active Window (LRI 70+):** Green background, "Start Focus Session" CTA
- **Active Window (LRI 40-69):** Yellow background, "Moderate readiness"
- **No Window:** Gray background, "Next window: After your next workout"
- **Missed Window:** Orange background, "Window closed. Review today's session."

---

#### B. Today's Session Summary
```
┌─────────────────────────────────────────────┐
│  Today's Learning Readiness                 │
│                                             │
│  Peak LRI: 84  (at 9:15 AM)                │
│  Optimal Minutes: 32 min (45%)             │
│  Session Score: 72/100                     │
│                                             │
│  [View Full Session Analysis →]            │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
GET /api/session/today-summary
{
  "date": "2025-11-08",
  "peak_lri": 84,
  "peak_time": "09:15:00",
  "optimal_minutes": 32,
  "optimal_percentage": 45,
  "session_score": 72,
  "has_session_data": true
}
```

---

#### C. Quick Stats Cards (3-column grid)
```
┌───────────────┬───────────────┬───────────────┐
│  Alertness    │  Focus        │  Arousal      │
│     65        │     58        │     42        │
│   /100        │   /100        │   /100        │
│                                               │
│  ▆▆▆▆▆▆▅      │  ▆▆▆▆▆▅▅      │  ▆▆▄▄▅▅▆      │
└───────────────┴───────────────┴───────────────┘
```

**Data from Backend:**
```json
GET /api/session/current-metrics
{
  "alertness": 65,
  "focus": 58,
  "arousal_balance": 42,
  "sparkline_data": {
    "alertness": [62, 65, 66, 67, 65, 63, 60],
    "focus": [55, 58, 60, 59, 61, 58, 57],
    "arousal": [40, 42, 38, 40, 45, 43, 42]
  }
}
```

---

#### D. Recent Workouts List
```
┌─────────────────────────────────────────────┐
│  Recent Workouts                            │
│                                             │
│  🏃 Morning Run        ✅ Window Used       │
│  7:00 AM - 30 min     LRI Peak: 84         │
│                                             │
│  🚴 Evening Bike       ⚠️ Window Missed    │
│  Yesterday 6:00 PM    No high LRI          │
│                                             │
│  [Import More Workouts →]                  │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
GET /api/workouts/recent?days=7
{
  "workouts": [
    {
      "id": "w123",
      "workout_type": "Running",
      "start_time": "2025-11-08T07:00:00",
      "duration_minutes": 30.5,
      "avg_heart_rate": 145,
      "window_utilized": true,
      "peak_lri_during_window": 84
    },
    {
      "id": "w122",
      "workout_type": "Cycling",
      "start_time": "2025-11-07T18:00:00",
      "duration_minutes": 45,
      "window_utilized": false,
      "peak_lri_during_window": 52
    }
  ]
}
```

---

## Screen 2: Session Analysis

### Purpose
Detailed visualization of EEG session showing moment-to-moment LRI changes and optimal learning windows.

### Layout Components

#### A. Session Header
```
┌─────────────────────────────────────────────┐
│  ← Back                    Session Analysis │
│                                             │
│  Today, 9:00 AM - 9:40 AM                  │
│  Duration: 40 minutes                       │
│  Peak LRI: 84/100 at 9:15 AM               │
└─────────────────────────────────────────────┘
```

---

#### B. LRI Timeline Chart (Primary Visualization)
```
┌─────────────────────────────────────────────┐
│  Learning Readiness Over Time               │
│                                             │
│ 100│                                        │
│    │         ╭──────╮                       │
│ 80 │        │🟢 84  │                       │
│    │       ╱         ╲                      │
│ 60 │      │           ╲                     │
│    │     ╱             ╲___                 │
│ 40 │____╱                  ╲___             │
│    │                           ╲____        │
│ 20 │                                ╲___    │
│    │                                    ╲__ │
│  0 └────────────────────────────────────────│
│     9:00  9:10  9:20  9:30  9:40           │
│                                             │
│  Legend:                                    │
│  🟢 Optimal (70-100)                        │
│  🟡 Moderate (40-69)                        │
│  🔴 Low (0-39)                              │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
GET /api/session/analyze?participant_id=0&max_hours=1.0
{
  "session_analysis": {
    "duration_minutes": 40.2,
    "peak_lri": 84.3,
    "peak_timestamp": "2025-11-08T09:15:30",
    "lri_timeline": [
      {"timestamp": "09:00:00", "lri": 42},
      {"timestamp": "09:00:30", "lri": 43},
      {"timestamp": "09:01:00", "lri": 45},
      // ... 97 data points total (30-sec intervals)
      {"timestamp": "09:40:00", "lri": 38}
    ]
  }
}
```

**Chart Library:** Use Recharts, Victory Native, or similar
**Interactions:**
- Tap any point to see exact LRI + timestamp
- Pinch to zoom into specific time range
- Highlight optimal windows in green overlay

---

#### C. Optimal Windows List
```
┌─────────────────────────────────────────────┐
│  Optimal Learning Windows                   │
│                                             │
│  1. 9:15 AM - 9:27 AM  (12.5 min)          │
│     Average LRI: 76                         │
│     Quality: Excellent ⭐⭐⭐                │
│                                             │
│  2. 9:35 AM - 9:38 AM  (3 min)             │
│     Average LRI: 72                         │
│     Quality: Good ⭐⭐                       │
│                                             │
│  Total Optimal Time: 15.5 min (39%)        │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
{
  "optimal_windows": [
    {
      "start": "09:15:00",
      "end": "09:27:30",
      "duration_minutes": 12.5,
      "avg_lri": 76.2,
      "quality": "excellent"
    },
    {
      "start": "09:35:00",
      "end": "09:38:00",
      "duration_minutes": 3.0,
      "avg_lri": 72.1,
      "quality": "good"
    }
  ]
}
```

---

#### D. Component Breakdown (Alertness/Focus/Arousal)
```
┌─────────────────────────────────────────────┐
│  Session Averages                           │
│                                             │
│  Alertness          ████████░░  65/100     │
│  High beta, low theta/beta ratio           │
│                                             │
│  Focus              ███████░░░  58/100     │
│  Moderate frontal theta                     │
│                                             │
│  Arousal Balance    █████░░░░░  42/100     │
│  Slightly under-aroused                     │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
{
  "component_scores": {
    "alertness": 65.3,
    "alertness_interpretation": "High beta, low theta/beta ratio",
    "focus": 58.2,
    "focus_interpretation": "Moderate frontal theta",
    "arousal_balance": 42.1,
    "arousal_interpretation": "Slightly under-aroused"
  }
}
```

---

#### E. Insights & Recommendations
```
┌─────────────────────────────────────────────┐
│  💡 Insights                                │
│                                             │
│  • Peak occurred 15 minutes into session    │
│  • You maintained optimal state for 39%     │
│    of the session (above average)           │
│  • Post-exercise boost detected (1.3x)      │
│                                             │
│  📌 Recommendations                         │
│                                             │
│  • Schedule deep work at 9:15 AM daily      │
│  • Your optimal window appears 1-2h after   │
│    morning workout                          │
│  • Consider light cardio before 7:00 AM     │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
{
  "insights": [
    "Peak occurred 15 minutes into session",
    "You maintained optimal state for 39% of session (above average)",
    "Post-exercise boost detected (1.3x multiplier)"
  ],
  "recommendations": [
    "Schedule deep work at 9:15 AM daily",
    "Your optimal window appears 1-2h after morning workout",
    "Consider light cardio before 7:00 AM to enhance effect"
  ]
}
```

---

#### F. Post-Exercise Context (if workout detected)
```
┌─────────────────────────────────────────────┐
│  🏃 Workout Context                         │
│                                             │
│  Morning Run - 7:00 AM                      │
│  Duration: 30 min | Heart Rate: 145 avg    │
│                                             │
│  Time since workout: 2h 15m                 │
│  Post-exercise multiplier: 1.3x             │
│                                             │
│  ✅ Peak LRI occurred during optimal        │
│     window (1-4h post-exercise)             │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
{
  "workout_context": {
    "workout_detected": true,
    "workout_type": "Running",
    "workout_start": "2025-11-08T07:00:00",
    "duration_minutes": 30.5,
    "avg_heart_rate": 145,
    "hours_between_workout_and_peak": 2.25,
    "peak_in_optimal_window": true,
    "post_exercise_multiplier": 1.3
  }
}
```

---

## Screen 3: Apple Health Import

### Purpose
Upload Apple Health export.xml to automatically import workouts and sleep data.

### Layout Components

#### A. Import Instructions Card
```
┌─────────────────────────────────────────────┐
│  Import Apple Health Data                   │
│                                             │
│  📱 How to Export:                          │
│  1. Open Health app on iPhone               │
│  2. Tap your profile (top right)            │
│  3. Tap "Export All Health Data"            │
│  4. Share the export.zip to this device     │
│  5. Unzip and select export.xml below       │
│                                             │
│  [Select export.xml File]                   │
└─────────────────────────────────────────────┘
```

---

#### B. File Upload Component
```
┌─────────────────────────────────────────────┐
│  📄 export.xml                              │
│  Size: 127 MB                               │
│  Last Modified: Nov 8, 2025                 │
│                                             │
│  [Upload & Process]                         │
│                                             │
│  Processing...  ▰▰▰▰▰▱▱▱▱▱ 45%             │
│  Parsing workouts... 237 found              │
└─────────────────────────────────────────────┘
```

**API Call:**
```javascript
POST /api/health/import
Content-Type: multipart/form-data

file: export.xml
```

**Response:**
```json
{
  "success": true,
  "workouts_imported": 237,
  "sleep_records_imported": 342,
  "date_range": {
    "start": "2024-01-01",
    "end": "2025-11-08"
  },
  "workout_types": {
    "Running": 45,
    "Cycling": 32,
    "HIIT": 18,
    "Strength": 67,
    "Other": 75
  }
}
```

---

#### C. Import Summary
```
┌─────────────────────────────────────────────┐
│  ✅ Import Complete                         │
│                                             │
│  Workouts: 237 imported                     │
│  Sleep Records: 342 imported                │
│  Date Range: Jan 2024 - Nov 2025           │
│                                             │
│  Recent Workouts:                           │
│  • Running - Today 7:00 AM                  │
│  • Cycling - Yesterday 6:00 PM              │
│  • HIIT - Nov 6, 7:30 AM                   │
│                                             │
│  Recent Sleep:                              │
│  • Last Night: 7h 32m (Score: 82/100)      │
│  • Nov 6: 6h 45m (Score: 71/100)           │
│                                             │
│  [Done]                                     │
└─────────────────────────────────────────────┘
```

---

## Screen 4: Supplement Tracker

### Purpose
Log cognitive supplement intake (creatine, nootropics). **UI only - not used in algorithm.**

### Layout Components

#### A. Log Supplement Form
```
┌─────────────────────────────────────────────┐
│  Log Supplement Intake                      │
│                                             │
│  Supplement Type:                           │
│  [Dropdown: Creatine ▼]                     │
│  - Creatine                                 │
│  - Alpha-GPC                                │
│  - Huperzine-A                              │
│  - Other                                    │
│                                             │
│  Dosage:                                    │
│  [5g ___________]                           │
│                                             │
│  Time Taken:                                │
│  [Today, 6:45 AM]  [Change]                 │
│                                             │
│  Notes (optional):                          │
│  [Before morning workout]                   │
│                                             │
│  [Log Supplement]                           │
└─────────────────────────────────────────────┘
```

**API Call:**
```javascript
POST /api/supplements/log
{
  "supplement_name": "Creatine",
  "dosage": "5g",
  "taken_at": "2025-11-08T06:45:00",
  "notes": "Before morning workout"
}
```

---

#### B. Supplement History List
```
┌─────────────────────────────────────────────┐
│  Supplement History (Last 7 Days)           │
│                                             │
│  Today, 6:45 AM                             │
│  💊 Creatine - 5g                           │
│  Before morning workout                     │
│                                             │
│  Yesterday, 7:00 AM                         │
│  💊 Alpha-GPC - 300mg                       │
│  30 min before HIIT                         │
│                                             │
│  Nov 6, 6:30 AM                             │
│  💊 Creatine - 5g                           │
│                                             │
│  [Load More]                                │
└─────────────────────────────────────────────┘
```

**Data from Backend:**
```json
GET /api/supplements/history?days=7
{
  "supplements": [
    {
      "id": "s123",
      "supplement_name": "Creatine",
      "dosage": "5g",
      "taken_at": "2025-11-08T06:45:00",
      "notes": "Before morning workout"
    },
    {
      "id": "s122",
      "supplement_name": "Alpha-GPC",
      "dosage": "300mg",
      "taken_at": "2025-11-07T07:00:00",
      "notes": "30 min before HIIT"
    }
  ]
}
```

---

#### C. Supplement Info Cards (Educational)
```
┌─────────────────────────────────────────────┐
│  About Supplements                          │
│                                             │
│  🧠 Creatine                                │
│  • Brain energy (ATP production)            │
│  • Reduces brain fog                        │
│  • Timing: Any time (daily consistency)     │
│  • Source: User experience                  │
│                                             │
│  🔬 Alpha-GPC                               │
│  • Acetylcholine precursor                  │
│  • Enhances focus during learning           │
│  • Timing: 15-30 min pre-exercise           │
│  • Source: Huberman Lab                     │
│                                             │
│  [Learn More]                               │
└─────────────────────────────────────────────┘
```

---

## Screen 5: Settings & Notifications

### Purpose
Configure in-app notification preferences.

### Layout Components

#### A. Notification Settings
```
┌─────────────────────────────────────────────┐
│  In-App Notifications                       │
│                                             │
│  Window Opening Alert          [ON]         │
│  Notify 30 min before optimal window opens  │
│                                             │
│  Peak Window Alert             [ON]         │
│  Notify when entering peak window (1h post) │
│                                             │
│  Window Closing Alert          [ON]         │
│  Notify 30 min before window closes         │
│                                             │
│  Missed Window Reminder        [OFF]        │
│  Daily recap if window was missed           │
└─────────────────────────────────────────────┘
```

---

#### B. EEG Session Settings
```
┌─────────────────────────────────────────────┐
│  EEG Analysis Settings                      │
│                                             │
│  Auto-Analyze on Import        [ON]         │
│  Automatically calculate LRI when importing │
│  new EEG data                               │
│                                             │
│  Window Threshold              [70/100]     │
│  Minimum LRI to classify as "optimal"       │
│                                             │
│  Data Source:                               │
│  ◉ Real Muse EEG Data (Participant 0)       │
│  ○ Demo Data (Synthetic)                    │
└─────────────────────────────────────────────┘
```

---

## Component State Diagrams

### Optimal Window Status States

```
┌─────────────────────────────────────────────┐
│ State: NO_WORKOUT                           │
│ - Gray background                           │
│ - Message: "Complete a workout to activate" │
│ - CTA: "Import Apple Health Data"           │
└─────────────────────────────────────────────┘
           ↓ Workout detected
┌─────────────────────────────────────────────┐
│ State: WINDOW_OPENING_SOON (0-1h post)      │
│ - Blue background                           │
│ - Countdown: "30 minutes until peak window" │
│ - CTA: "Prepare Study Materials"            │
└─────────────────────────────────────────────┘
           ↓ 1h elapsed
┌─────────────────────────────────────────────┐
│ State: PEAK_WINDOW (1-2h post)              │
│ - Green background (if LRI >70)             │
│ - Message: "Peak neuroplasticity NOW"       │
│ - CTA: "Start Focus Session"                │
└─────────────────────────────────────────────┘
           ↓ 2h elapsed
┌─────────────────────────────────────────────┐
│ State: EXTENDED_WINDOW (2-4h post)          │
│ - Yellow background                         │
│ - Message: "Good learning state continues"  │
│ - CTA: "Continue Learning"                  │
└─────────────────────────────────────────────┘
           ↓ 4h elapsed
┌─────────────────────────────────────────────┐
│ State: WINDOW_CLOSED                        │
│ - Gray background                           │
│ - Message: "Window closed"                  │
│ - CTA: "Review Today's Session"             │
└─────────────────────────────────────────────┘
```

---

## In-App Notification Banners

### Design Pattern: Top Banner (dismissible)

```
┌─────────────────────────────────────────────┐
│ 🔥 PEAK WINDOW ACTIVE                   [✕] │
│ Your brain is in optimal state. LRI: 78     │
│ [Start Focus Session]                       │
└─────────────────────────────────────────────┘
```

**Trigger Conditions:**

1. **Window Opening (30 min before):**
   ```
   Condition: current_time == workout_time + 30 minutes
   Message: "Optimal window opens in 30 min. Prepare materials."
   ```

2. **Peak Window (1h post-workout):**
   ```
   Condition: current_time == workout_time + 1 hour
   Message: "Peak neuroplasticity window NOW. LRI: {current_lri}"
   ```

3. **Window Closing (3.5h post-workout):**
   ```
   Condition: current_time == workout_time + 3.5 hours
   Message: "30 minutes left in optimal window"
   ```

4. **Window Missed (4h post, no high LRI detected):**
   ```
   Condition: current_time == workout_time + 4 hours AND max_lri < 70
   Message: "Today's window closed. No optimal state detected."
   ```

**Polling Mechanism:**
```javascript
// Frontend polls every 30 seconds
setInterval(async () => {
  const response = await fetch('/api/notifications/pending');
  const notifications = await response.json();

  notifications.forEach(notif => {
    showBanner(notif.message, notif.type);
  });
}, 30000);
```

---

## Data Visualization Specs

### LRI Timeline Chart

**Library:** Recharts (React) or Victory Native (React Native)

**Configuration:**
```javascript
<LineChart width={350} height={200} data={lriTimeline}>
  <XAxis dataKey="timestamp" />
  <YAxis domain={[0, 100]} />
  <Line
    dataKey="lri"
    stroke="#10b981"
    strokeWidth={2}
    dot={{ fill: '#10b981', r: 3 }}
  />
  <ReferenceArea
    y1={70}
    y2={100}
    fill="#10b981"
    fillOpacity={0.1}
    label="Optimal Zone"
  />
  <Tooltip content={<CustomTooltip />} />
</LineChart>
```

**Color Coding:**
- LRI 70-100: Green (`#10b981`)
- LRI 40-69: Yellow (`#f59e0b`)
- LRI 0-39: Red (`#ef4444`)

---

### Alertness/Focus/Arousal Meters

**Component Type:** Horizontal progress bars with gradient

```javascript
<View style={styles.meterContainer}>
  <Text>Alertness</Text>
  <ProgressBar
    value={alertness}
    maxValue={100}
    color="#10b981"
    height={8}
  />
  <Text>{alertness}/100</Text>
</View>
```

**Gradients:**
- Alertness: Blue → Green
- Focus: Purple → Blue
- Arousal: Yellow → Orange

---

## Key Metrics Summary

### All metrics accessible via API endpoints:

| Metric | Endpoint | Update Frequency |
|--------|----------|------------------|
| Current LRI | `/api/session/current-lri` | Real-time (when EEG active) |
| Optimal Window Status | `/api/session/optimal-window-status` | Every 30 sec |
| Session Analysis | `/api/session/analyze` | On-demand |
| Recent Workouts | `/api/workouts/recent` | On import |
| Sleep History | `/api/sleep/recent` | On import |
| Supplement Log | `/api/supplements/history` | On log entry |
| Pending Notifications | `/api/notifications/pending` | Every 30 sec |

---

## Technical Requirements

### Frontend Stack
- React Native (iOS + Android)
- Expo (for faster development)
- Recharts or Victory Native (charts)
- AsyncStorage (local caching)
- Axios (API calls)

### API Base URL
```
Development: http://localhost:8001/api
Production: https://api.axon.app/api
```

### Authentication
- For MVP: No auth required
- Post-hackathon: JWT tokens

---

## Next Steps for UI Development

1. **Setup React Native project**
   - Initialize Expo app
   - Install dependencies (Recharts, navigation)

2. **Build components in order:**
   - Home Dashboard (highest priority)
   - Session Analysis (core feature)
   - Apple Health Import
   - Supplement Tracker
   - Settings

3. **API Integration**
   - Use mock data initially
   - Swap to real API endpoints when backend ready

4. **Testing**
   - Test all notification triggers
   - Verify chart renders correctly with 97 data points
   - Test file upload flow

---

**End of UI Components Specification**
