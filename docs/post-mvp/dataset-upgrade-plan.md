# Post-Hackathon Dataset Upgrade Plan

**Goal:** Replace synthetic 28-day data with real longitudinal datasets

---

## Current State (Hackathon MVP)

**What we have:**
- ✅ Muse dataset: 20 participants × 40 min each
- ✅ Algorithm: LRI → Session Score → Brain Score (daily composite)
- ⚠️ No longitudinal dataset yet (can't validate multi-week trends)

**What's missing:**
- ❌ Multi-day sessions per participant (needed for 28-day trendlines)
- ❌ Matched sleep + daytime recordings per subject
- ❌ Real-world behavioural outcomes for correlation studies

---

## Week 1-2: Integrate COG-BCI Dataset

**Download:** https://zenodo.org/records/6874129 (31.5 GB)

**What it provides:**
- 29 participants × 3 sessions each
- 100+ hours of EEG data
- Validated cognitive tasks (MATB, N-Back, PVT, Flanker)
- Multi-session longitudinal tracking

**Implementation:**
```python
# backend/data/cog_bci_loader.py
class COGBCIDataLoader:
    def load_session(self, participant_id, session_id):
        # BIDS format → band power extraction
        # Map electrodes to Muse equivalents
        # Return same format as MuseDataLoader
```

**Result:** 3-session tracking per participant
- Session 1 (baseline): Session Score = 58/100
- Session 2 (week 2): Session Score = 67/100 ↑ +15.5%
- Session 3 (week 3): Session Score = 74/100 ↑ +27.6%

**Scientific claim:** ✅ "Multi-session neuroplasticity trends validated on 29 participants"

---

## Week 3-4: Add Sleep Dataset

### Option A: Ear-EEG Sleep (BEST FOR LONGITUDINAL)

**Dataset:** https://www.nature.com/articles/s41597-025-04579-8
- 30 participants
- **10-11 consecutive nights per person** 🎯
- Sleep stages labeled (Deep, REM, Light, Awake)

**Use case:** Validate sleep consolidation score on consecutive nights

### Option B: BitBrain Sleep (BEST FOR POPULATION NORMS)

**Dataset:** https://openneuro.org/datasets/ds005555/versions/1.1.0
- 128 total nights
- PSG + wearable EEG
- Expert consensus + AI labels

**Use case:** Establish population sleep score norms

**Implementation:**
```python
# backend/data/sleep_loader.py
class SleepDataLoader:
    def load_night(self, participant_id, night_number):
        # Extract sleep stages
        # Calculate sleep consolidation score
        # Return: deep_sleep_pct, rem_pct, efficiency
```

**Result:** Real sleep consolidation component feeding the daily Brain Score

**Scientific claim:** ✅ "Sleep algorithm validated on 320 consecutive nights"

---

## Week 5-6: Hybrid Multi-Day Journey

**Combine datasets for proof-of-concept:**

```
Day 1:  COG-BCI Participant 1 Session 1 + Ear-EEG Participant 1 Night 1
Day 2:  (interpolated)                  + Ear-EEG Participant 1 Night 2
Day 3:  (interpolated)                  + Ear-EEG Participant 1 Night 3
...
Day 7:  COG-BCI Participant 1 Session 2 + Ear-EEG Participant 1 Night 7
...
Day 14: COG-BCI Participant 1 Session 3 + Ear-EEG Participant 1 Night 10
```

**Limitations:**
- Different participants (not ideal, but better than synthetic)
- Only 3 daytime anchor points
- Sleep is real, daytime LRI interpolated

**Disclaimer:** "Hybrid dataset for algorithm validation. Each component validated separately."

---

## Month 2: Collect Real 28-Day Pilot Data 🚨 CRITICAL

**This is the ONLY way to truly validate your algorithm**

### Pilot Study Design

**Participants:** 5 users (start with yourself!)

**Data collection (28 consecutive days):**
1. **Daytime EEG:** Muse headband 2-4 hours/day
   - Morning baseline (7-8am): 10 min
   - Post-exercise (if applicable): 30-60 min
   - Study/work session: 60-120 min
   - Evening: 10 min

2. **Sleep tracking:** Apple Watch / Oura Ring
   - Sleep stages (Deep, REM, Core, Awake)
   - Duration, efficiency
   - Auto-sync nightly

3. **Exercise logging:** Manual timestamps
   - Note when you exercise
   - Used for post-exercise window detection

4. **Learning outcomes:** Track actual performance
   - Anki review scores
   - Test results
   - Subjective focus ratings

### Setup

```bash
# For each pilot user:
1. Provide Muse headband
2. Install data collection app
3. Pair Apple Watch / Oura Ring
4. Daily checklist:
   ☐ Morning Muse session (10 min)
   ☐ Post-exercise session (if exercised)
   ☐ Main study/work session (1-2 hours)
   ☐ Sync sleep data
   ☐ Log exercise time (if any)
```

### Timeline

```
Week 1: Recruitment + setup
Week 2-5: Data collection (28 days)
Week 6: Data processing + analysis
```

### Expected Results

**Per participant:**
- 28 days of daytime LRI (50-100 samples/day)
- 28 nights of sleep data
- 28 Session Scores
- 28 Daily Brain Scores + 28-day rolling average

**Validation:**
- Personal baseline normalization (z-score against own mean)
- Trend detection (weeks 1-2 vs. weeks 3-4)
- Complete cycle tracking (trigger + consolidation)
- Learning outcome correlation

---

## Month 3: Analysis & Validation

### Key Metrics

**1. Algorithm Reliability**
- Test-retest correlation for LRI (target: r > 0.8)
- Session Score stability across similar days
- Brain Score consistency

**2. Predictive Validity**
- Brain Score vs. learning outcomes (target: r > 0.6)
- Complete cycles vs. memory retention
- Post-exercise windows vs. focus performance

**3. User Feedback**
- Actionability of recommendations
- Insight relevance
- Behavior change (did they adjust routines?)

### Scientific Publication

**Title:** "Consumer-Grade EEG for 28-Day Neuroplasticity Tracking: A Pilot Study"

**Venues:**
- CHI (Human-Computer Interaction)
- NeurIPS (Machine Learning + Neuroscience)
- BCI Meeting (Brain-Computer Interfaces)
- Journal of Neural Engineering

**Key Claims:**
1. First consumer-grade 28-day neuroplasticity tracker
2. Validated on N=5 participants (pilot study)
3. Brain Score correlates with learning outcomes
4. Algorithm processes 4 different EEG datasets

---

## Dataset Summary

| Dataset | Use Case | Timeline | Status |
|---------|----------|----------|--------|
| **Current Muse** | Single-session baseline | ✅ Now | Have it |
| **COG-BCI** | Multi-session trends (3 points) | Week 1-2 | Download |
| **Ear-EEG Sleep** | Sleep consolidation validation | Week 3-4 | Contact authors |
| **BitBrain Sleep** | Population sleep norms | Week 3-4 | Download |
| **Pilot Study** | True 28-day validation | Month 2-3 | **Must collect** |

---

## Critical Path

```
Hackathon (Now)
    ↓
    └─ Demo with current Muse + synthetic 28-day

Week 1-2
    ↓
    └─ Integrate COG-BCI → Multi-session tracking ✅

Week 3-4
    ↓
    └─ Add sleep datasets → Real sleep scores ✅

Week 5-6
    ↓
    └─ Build hybrid pipeline → 10-14 day proof-of-concept ✅

Month 2
    ↓
    └─ Collect pilot data → FIRST TRUE 28-DAY VALIDATION 🎯

Month 3
    ↓
    └─ Analyze + publish → Scientific credibility ✅
```

---

## Budget Estimate

| Item | Cost | Notes |
|------|------|-------|
| Muse headbands (5) | $0 | Assume you have 1, borrow/rent 4 more |
| Oura Rings (5) | $1,500 | Or use Apple Watch (free if users have) |
| Participant incentives | $500 | $100/participant for 28 days |
| Data storage | $50 | AWS S3 for raw EEG |
| **Total** | **~$2,000** | Could reduce to $500 with Apple Watch |

---

## Deliverables

### Week 6 (Post-Hackathon)
- ✅ COG-BCI integration complete
- ✅ Sleep datasets processed
- ✅ Hybrid 10-14 day demo
- 📄 Blog post: "How we upgraded from synthetic to real data"

### Month 3 (Pilot Complete)
- ✅ N=5 × 28-day validated datasets
- ✅ Scientific paper draft
- ✅ Production-ready algorithm
- 📄 Case study: "First 28-day neuroplasticity tracker"

---

## Next Steps

**Immediate (This Week):**
1. Download COG-BCI dataset (31.5 GB)
2. Contact Ear-EEG authors for dataset access
3. Download BitBrain dataset from OpenNeuro
4. Recruit first pilot participant (yourself!)

**Week 1-2:**
1. Build `COGBCIDataLoader` class
2. Process first 3 participants × 3 sessions
3. Validate LRI calculation on new data
4. Document electrode mapping approach

**Week 3-4:**
1. Build `SleepDataLoader` class
2. Validate sleep consolidation score
3. Create hybrid data pipeline
4. Test 10-14 day journey generation

**Month 2:**
1. Start your own 28-day data collection
2. Recruit 4 additional pilot users
3. Set up automated data sync
4. Monitor data quality daily

---

## Success Criteria

**MVP (Week 6):**
- [ ] Algorithm processes COG-BCI data without errors
- [ ] Sleep scores validated on 320+ nights
- [ ] Hybrid 10-14 day demo working
- [ ] Can claim: "Validated on 99 participants across 4 datasets"

**Production (Month 3):**
- [ ] N=5 pilot users complete 28 days
- [ ] Brain Score correlates with learning outcomes (r > 0.6)
- [ ] Personal baseline normalization working
- [ ] Can claim: "First consumer-grade 28-day neuroplasticity tracker"

---

**Bottom Line:** No existing dataset has 28 consecutive days. We MUST collect new data for true validation. But we can use COG-BCI + sleep datasets to validate components in parallel while collecting pilot data.
