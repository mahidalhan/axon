# Brain Score App - Testing Guide

## ✅ Bug Fixed!

**Issue**: Syntax error in EducationScreen.tsx - `<3` was being parsed as JSX
**Fix**: Changed to `&lt;3` (HTML entity)
**Status**: App now compiling successfully ✓

## Current Status

✅ **Backend**: Running on port 8001, all endpoints working
✅ **Frontend**: Bundle compiled (7.5 MB), ready to load
✅ **Expo**: Tunnel connected, QR code available
✅ **Platform**: iOS & Android supported

## How to Test the App

### Option 1: Mobile Testing (Recommended)

1. **Install Expo Go** on your phone:
   - iOS: Download from App Store
   - Android: Download from Google Play

2. **Open the preview URL** in your browser to see the QR code

3. **Scan the QR code** with:
   - iOS: Camera app (will prompt to open in Expo Go)
   - Android: Expo Go app (use built-in scanner)

4. **The app should load** and show the Brain Score home screen

### Option 2: Check Expo Logs

```bash
# View Metro bundler logs
tail -f /var/log/supervisor/expo.out.log

# Check for errors
tail -f /var/log/supervisor/expo.err.log
```

## Testing Checklist

### 🏠 Home Screen
- [ ] Brain Score circular progress rings display (Neural State, Brain Score, Sleep)
- [ ] Optimal Window status card shows data
- [ ] Today's session metrics display (Peak LRI, Optimal Minutes)
- [ ] Current state bars show Alertness, Focus, Balance
- [ ] Insight card appears at bottom
- [ ] Pull-to-refresh works

### 📊 Session Analysis Screen
- [ ] Session overview shows duration, peak LRI, score
- [ ] LRI Timeline chart renders (gradient line chart)
- [ ] Time distribution bar shows optimal/moderate/low states
- [ ] Optimal windows list displays with quality badges
- [ ] Component scores show Alertness, Focus, Balance
- [ ] Insights list displays
- [ ] Recommendations card appears

### ❤️ Health Data Screen
- [ ] Sleep records show for last 7 days
- [ ] Each sleep card shows score, duration, efficiency
- [ ] HRV data displays when available
- [ ] Workout list shows exercises
- [ ] Workout cards show duration, heart rate
- [ ] High intensity badge appears for intense workouts

### 📚 Learn Screen
- [ ] Hero card displays with app description
- [ ] Three-phase neuroplasticity cards show (Trigger, Signal, Consolidation)
- [ ] 8 sleep metrics cards display with explanations
- [ ] Actionable tips list appears
- [ ] Research references card at bottom

### ⚙️ Settings Screen
- [ ] App info card shows Brain Score branding
- [ ] Participant selection chips (0-19) are scrollable
- [ ] Selecting a participant changes active participant
- [ ] Notification toggle works
- [ ] All settings rows are tappable

## Backend API Testing

```bash
# Health check
curl http://localhost:8001/api/health

# Get brain score
curl http://localhost:8001/api/brain-score/today

# Get session analysis
curl -X POST http://localhost:8001/api/session/analyze \
  -H "Content-Type: application/json" \
  -d '{"participant_id": 0, "max_hours": 1.0}'

# Get optimal window status
curl http://localhost:8001/api/session/optimal-window-status?participant_id=0

# Get today's summary
curl http://localhost:8001/api/session/today-summary?participant_id=0

# Get current metrics
curl http://localhost:8001/api/session/current-metrics?participant_id=0

# Get sleep data
curl http://localhost:8001/api/sleep/last20

# Get workout data
curl http://localhost:8001/api/workouts/last20
```

## Navigation Testing

### Tab Navigation
- [ ] Tap Home tab - loads home screen
- [ ] Tap Session tab - loads session analysis
- [ ] Tap Health tab - loads health data
- [ ] Tap Learn tab - loads education content
- [ ] Tap Settings tab - loads settings
- [ ] Active tab shows highlighted icon
- [ ] Tab labels display correctly

## Expected Data

### Participant 0 Data:
- Peak LRI: ~40
- Session Score: ~0% (low optimal time)
- Alertness: ~33
- Focus: ~9
- Arousal Balance: ~8
- Brain Score: ~50

### Sleep Data (Last 20 Days):
- Multiple nights with scores ranging 60-85
- HRV, efficiency, deep sleep % available
- Bedtime consistency tracked

### Workout Data (Last 20 Days):
- Various workout types (Running, Cycling, etc.)
- Duration, heart rate, intensity level
- Post-exercise window indicators

## Common Issues & Fixes

### App Won't Load
1. Check if Expo is running: `sudo supervisorctl status expo`
2. Restart Expo: `sudo supervisorctl restart expo`
3. Check bundle compiles: `curl http://localhost:3000/index.ts.bundle?platform=ios`

### Backend Not Responding
1. Check backend status: `sudo supervisorctl status backend`
2. Restart backend: `sudo supervisorctl restart backend`
3. Test health endpoint: `curl http://localhost:8001/api/health`

### Bundle Error
1. Clear Metro cache: Restart Expo
2. Check for syntax errors in logs
3. Verify all TypeScript files compile

### Data Not Loading
1. Check browser console for API errors
2. Verify backend endpoints return data
3. Check network tab in dev tools
4. Ensure `/api` prefix is used in API calls

## Performance Expectations

- **Initial Load**: 3-5 seconds on mobile
- **Tab Switch**: < 500ms
- **API Response**: < 500ms
- **Chart Render**: < 1 second
- **Pull-to-Refresh**: 1-2 seconds

## UI/UX Quality Checks

- [ ] All text is readable (sufficient contrast)
- [ ] Touch targets are at least 44x44 pts
- [ ] Scrolling is smooth (60fps)
- [ ] Safe areas respected (notches, home indicators)
- [ ] Colors match design (Indigo, Green, Amber, Red)
- [ ] Cards have proper shadows and spacing
- [ ] Loading states display when fetching data
- [ ] No crashes or white screens

## Data Accuracy

- [ ] Brain score calculation matches formula
- [ ] LRI values display correctly from parquet files
- [ ] Sleep scores from Apple Health are accurate
- [ ] Workout timestamps and durations are correct
- [ ] Optimal windows detected at LRI >= 70
- [ ] Component scores (alertness, focus, balance) display

## Success Criteria

✅ App loads without errors
✅ All 5 screens accessible via tabs
✅ Backend APIs return data
✅ Charts render beautifully
✅ Navigation is smooth
✅ Data displays correctly
✅ No crashes or freezes
✅ Responsive on different screen sizes

---

## Next Steps After Testing

1. **Collect Feedback**: Note any UX issues or bugs
2. **Performance**: Check for slow loading or lag
3. **Data Issues**: Verify all metrics calculate correctly
4. **UI Polish**: Adjust colors, spacing, fonts
5. **Feature Requests**: Document desired enhancements

## Support

If you encounter issues:
1. Check logs: `/var/log/supervisor/expo.err.log`
2. Backend logs: `/var/log/supervisor/backend.err.log`
3. Test backend APIs directly with curl
4. Verify bundle compiles without errors

---

**Status**: ✅ Ready for User Testing!
**Last Updated**: November 9, 2025
