# Quick Start: Using Real EEG Data

## Run Validation Test

```bash
cd /Users/mahidalhan/code/brain_score
python backend/test_real_data.py
```

Expected output:
```
============================================================
VALIDATION SUMMARY
============================================================
✓ Data loading: PASS
✓ Windowing: PASS
✓ LRI calculation: PASS
✓ Full pipeline: PASS
============================================================
```

## Start Backend with Real Data

```bash
# Terminal 1: Start backend
cd /Users/mahidalhan/code/brain_score/backend
uvicorn server:app --reload --port 8001
```

## Use Real Data in Frontend

### Method 1: UI Button (Recommended)
1. Open frontend: `http://localhost:3000`
2. Click "Generate 28-Day Demo Data" button
3. **Backend currently uses synthetic by default**

### Method 2: Call Real Data API Directly
```bash
# Process real participant 0 (24 hours of data)
curl -X POST "http://localhost:8001/api/demo/generate-real?participant_id=0&max_hours=24"
```

### Method 3: Update Frontend to Use Real Data
Edit `frontend/src/utils/api.js`:

```javascript
// Add new method
generateRealDemo: async (participant_id = 0, max_hours = 24) => {
  const response = await fetch(
    `${API_BASE}/api/demo/generate-real?participant_id=${participant_id}&max_hours=${max_hours}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to generate real demo data');
  return response.json();
},
```

Edit `frontend/src/App.js`:

```javascript
const handleGenerateDemo = async () => {
  setIsLoading(true);
  setError(null);
  try {
    // Option 1: Use synthetic data
    // await api.generateDemo();

    // Option 2: Use real EEG data from participant 0
    await api.generateRealDemo(0, 24);

    setHasData(true);
    setIsLoading(false);
  } catch (err) {
    setError('Failed to generate demo data. Please try again.');
    setIsLoading(false);
  }
};
```

## Choose Different Participants

Each participant has different EEG characteristics:

```bash
# Participant 0 (default) - 602K samples
curl -X POST "http://localhost:8001/api/demo/generate-real?participant_id=0&max_hours=24"

# Participant 5 - different brain patterns
curl -X POST "http://localhost:8001/api/demo/generate-real?participant_id=5&max_hours=24"

# Participant 18 - highest sample count (726K samples)
curl -X POST "http://localhost:8001/api/demo/generate-real?participant_id=18&max_hours=24"
```

## Test Different Duration

```bash
# Quick test (2 hours)
curl -X POST "http://localhost:8001/api/demo/generate-real?participant_id=0&max_hours=2"

# Half day
curl -X POST "http://localhost:8001/api/demo/generate-real?participant_id=0&max_hours=12"

# Full day
curl -X POST "http://localhost:8001/api/demo/generate-real?participant_id=0&max_hours=24"
```

## Compare Synthetic vs Real Data

### Synthetic Data Characteristics:
- Smooth transitions
- Predictable patterns
- Consistent improvement trend
- Perfect 15-minute intervals
- Average LRI: ~75

### Real EEG Data Characteristics:
- Natural variability
- Authentic noise and artifacts
- Realistic band power distributions
- Irregular timing (filtered for quality)
- Average LRI: ~40-50 (more realistic)

## Troubleshooting

### "No data found" error
```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/data

# Or check connection string
echo $MONGO_URL
```

### NumPy version error
```bash
pip install "numpy<2"
```

### Dataset not found
```bash
# Verify dataset location
ls "Muse EEG Subconscious Decisions Dataset/Muse"

# Should see: museData0.csv, museData1.csv, ..., museData19.csv
```

### API timeout
```bash
# Reduce max_hours for faster processing
curl -X POST "http://localhost:8001/api/demo/generate-real?participant_id=0&max_hours=1"
```

## Performance Tips

1. **Start small**: Use `max_hours=2` for initial testing
2. **Cache results**: Process once, store in MongoDB, reuse
3. **Pre-process offline**: Run batch job to process all 20 participants
4. **Use quality threshold**: Lower HSI threshold for more data (trade quality for quantity)

## Expected Response Times

| Duration | Samples | Windows | LRI Calcs | Total Time |
|----------|---------|---------|-----------|------------|
| 1 hour   | ~180K   | ~50     | ~0.02s    | ~1s        |
| 2 hours  | ~360K   | ~100    | ~0.04s    | ~2s        |
| 12 hours | ~2M     | ~600    | ~0.3s     | ~10s       |
| 24 hours | ~4M     | ~1200   | ~0.6s     | ~20s       |

## Next Steps

1. ✅ Validate pipeline works
2. ✅ Test API endpoint
3. → Choose participant for your demo
4. → Update frontend to use real data
5. → Show off authentic neuroplasticity metrics!

## Questions?

Check the full documentation: `REAL_DATA_INTEGRATION.md`
