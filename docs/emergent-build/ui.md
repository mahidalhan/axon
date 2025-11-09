# UI Specification for Emergent

Reference: `docs/app/UI-COMPONENTS.md` (session-focused MVP).

## Screens

### 1. Home Dashboard
- **Sections:**
  - Optimal Window Status Card (`/api/session/optimal-window-status`)
  - Today's Session Summary (`/api/session/today-summary`)
  - Quick Stats (Alertness, Focus, Arousal) (`/api/session/current-metrics`)
  - Daily Brain Score Tile (`/api/brain-score/today`)
  - Recent Workouts list (`/api/workouts/recent`)
- **States:** Active window, moderate readiness, no window, missed window.

### 2. Session Analysis
- LRI timeline chart with optimal windows overlay.
- Optimal windows list with quality labels.
- Component breakdown (Alertness, Focus, Arousal).
- Insights & recommendations.
- Post-exercise context card.
- *Data source:* `session_analysis` payload.

### 3. Apple Health Import
- File upload for `export.xml`.
- Import progress indicator (workouts, sleep records counts).
- Summary card showing totals.

### 4. Supplement Tracker (UI only)
- Log form for supplement intake.
- History list.
- Educational cards.

### 5. Settings
- Notification settings (in-app).
- EEG session preferences (window threshold, session duration).

## Components
- Tiles with status iconography (green/yellow/gray/orange backgrounds).
- Charts: area/line chart for LRI timeline, sparklines for quick stats.
- Lists for workouts/sleep history.

## Copy & Messaging
- Use motivational tone, highlight scientific basis.
- For sleep sections, reference neuroplasticity benefits (see `docs/app/SLEEP-EDUCATION.md`).

## Design Notes
- Keep layout minimal; emphasize actionable insights.
- Provide CTA buttons (`Start Focus Session`, `View Full Session Analysis`).
- Ensure all API errors surface with friendly messaging.

