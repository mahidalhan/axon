# Product Requirements Document: Axon - Neuroplasticity Optimization System

**Version:** 1.0
**Date:** November 6, 2025
**Status:** Pre-MVP (Hackathon)
**Owner:** Mahi Dalhan

---

## Executive Summary

Axon is a real-time neuroplasticity optimization system that helps users identify and maximize their optimal learning windows. Unlike retrospective cognitive tracking tools, Axon provides live feedback on brain states (alertness + focus) to guide when and how to engage in learning activities for maximum neural adaptation.

**Core Innovation:** Measure learning readiness states (not learning outcomes) using behind-ear EEG to detect the neurochemical conditions (norepinephrine + acetylcholine release) that enable adult neuroplasticity.

---

## Problem Statement

### The Challenge
Adult neuroplasticity requires specific brain states: alertness (norepinephrine) + focus (acetylcholine) + sleep consolidation. Most people:
- Don't know when their brain is optimally primed for learning
- Waste cognitive effort during low-readiness states
- Miss post-exercise learning windows (1-4h peak period)
- Can't measure whether learning attempts will consolidate overnight

### Current Solutions (Inadequate)
- **Meditation apps:** Measure relaxation, not learning readiness
- **Focus timers:** Arbitrary schedules, ignore neurobiology
- **Sleep trackers:** Only track rest, not consolidation quality
- **Clinical EEG:** Requires lab setting, weeks of baseline data

---

## Objectives

### Primary Objective
**Enable users to maximize neuroplasticity by providing real-time detection of optimal learning states and actionable feedback on brain readiness.**

### Success Metrics (MVP)
1. **Real-time detection accuracy:** 80%+ classification of high vs. low learning readiness states
2. **User engagement:** Users check their Learning Readiness Index (LRI) 3+ times/day
3. **Behavioral change:** 40%+ increase in study/practice sessions during optimal windows (1-4h post-exercise)
4. **Sleep consolidation correlation:** Demonstrate 0.6+ correlation between evening LRI and next-day sleep quality score

### Long-term Vision
- Wearable behind-ear EEG device (4-6 dry electrodes)
- Continuous passive monitoring + on-demand active assessment
- Personalized learning schedules optimized for individual neurochemistry

---

## Method: Neuroplasticity State Detection via EEG Band Power Analysis

### Scientific Foundation

**Huberman Lab Framework:**
Adult neuroplasticity requires a 3-phase process:
1. **Trigger Phase:** Alertness (norepinephrine from locus coeruleus) + Focus (acetylcholine from nucleus basalis)
2. **Signal Phase:** Incremental learning with struggle/friction
3. **Consolidation Phase:** Deep sleep / REM sleep (actual rewiring)

**Key Mechanism:**
- Vagus nerve activation (via high-intensity exercise) → NTS → LC (norepinephrine) + NB (acetylcholine)
- Creates 1-4 hour window of heightened learning capacity
- Plasticity triggered during learning, executed during sleep

### EEG Measurement Strategy

**Hardware Configuration:**
- **Electrode placement:** TP9, TP10 (temporal-parietal, behind-ear accessible)
- **Optional:** Mastoid references for artifact rejection
- **Sampling rate:** 256 Hz minimum
- **Device type:** Dry electrodes (user-friendly, daily use)

**Measured Parameters:**

| Parameter | EEG Band | Frequency | Neural Correlate | Neuroplasticity Role |
|-----------|----------|-----------|------------------|---------------------|
| **Alertness** | Beta | 13-30 Hz | Norepinephrine state | Prerequisite for learning |
| **Focus** | Theta | 4-8 Hz | Acetylcholine state | Spotlight on relevant info |
| **Relaxation baseline** | Alpha | 8-13 Hz | Default mode suppression | Engagement vs. idle |
| **Arousal balance** | Theta/Beta ratio | Composite | Optimal activation zone | Yerkes-Dodson inverted-U |
| **Sleep consolidation** | Delta | 0.5-4 Hz | Slow-wave sleep density | Memory encoding |
| **Spindle activity** | Sigma | 12-15 Hz | Sleep spindles | Synaptic strengthening |

---

## Core Algorithm: Learning Readiness Index (LRI)

### Real-Time Computation (During Waking Hours)

```
Learning_Readiness_Index (0-100) = weighted_sum(Alertness, Focus, Arousal_Balance)

Where:
  Alertness_Score = 0.4 × beta_power +
                    0.3 × (1 / theta_beta_ratio) +
                    0.3 × alpha_suppression_index

  Focus_Score = 0.5 × frontal_theta_power +
                0.3 × alpha_modulation +
                0.2 × gamma_burst_rate

  Arousal_Balance = inverted_U_function(beta/alpha ratio)
                    # Optimal zone: not too drowsy, not too anxious

  LRI = (0.4 × Alertness + 0.4 × Focus + 0.2 × Arousal) × Post_Exercise_Multiplier
```

**Post-Exercise Window Multiplier:**
- 0-1h post-exercise: 1.5x
- 1-2h post-exercise: 1.3x
- 2-4h post-exercise: 1.1x
- 4+h post-exercise: 1.0x

### Session Analysis: Optimal Window Detection

**Goal:** Identify specific minutes within a session when brain is in peak learning state.

**Method:**
1. Calculate LRI every 30 seconds during 40-min session
2. Find consecutive periods where LRI >= 70 (optimal threshold)
3. Classify window quality based on average LRI
4. Match to post-exercise timing (1-4h window per Huberman)

**Output:**
- Peak LRI score + timestamp
- Total minutes in optimal state
- List of optimal time windows
- Actionable recommendation: "Schedule deep work at 9:15 AM daily"

**Scientific Basis:**
Per Huberman: "organizing your bouts of learning... to come in the two to three hours, maybe even four hours, but certainly in the 1 to two hours after you do some sort of exercise"

### Sleep Score (Research-Validated Formula)

**See `/docs/algorithm/SLEEP-METRICS-SPECIFICATION.md` for complete details.**

**Version A: HRV-Enabled (Preferred)**
```
Sleep_Score = (
    0.30 × Duration_Score +          # 7-9 hours optimal (Walker 2017)
    0.25 × Efficiency_Score +        # >85% optimal (Ohayon 2017)
    0.10 × HRV_Sleep_Score +         # Parasympathetic recovery (Frontiers 2025)
    0.10 × Consistency_Score +       # <30 min bedtime variance (Phillips 2017)
    0.10 × WASO_Score +              # <30 min awake during sleep (Scullin 2019)
    0.05 × SOL_Score +               # 10-20 min optimal (Ohayon 2000)
    0.05 × Respiratory_Rate_Score +  # 12-16 bpm (Kryger 2011)
    0.05 × Deep_Sleep_Percent       # >15% of total sleep (Stickgold 2005)
)
```

**Version B: Base (No HRV Device)**
```
Sleep_Score = (
    0.35 × Duration_Score +          # Increased weight when no HRV
    0.30 × Efficiency_Score +
    0.15 × Consistency_Score +       # Redistributed from HRV weight
    0.10 × WASO_Score +
    0.05 × SOL_Score +
    0.05 × Respiratory_Rate_Score
)
```

**Component Definitions:**

1. **Duration Score (30-35%)** - Scientific Basis: Walker (2017)
   - Optimal: 7-9 hours
   - Why: Sleep duration directly impacts memory consolidation
   - Each 2-hour reduction = 60-80% reduction in REM sleep

2. **Efficiency Score (25-30%)** - Scientific Basis: Ohayon et al. (2017)
   - Formula: (Total Sleep Time / Time in Bed) × 100
   - Optimal: ≥85%
   - Why: Reflects sleep quality, fragmentation disrupts consolidation

3. **HRV During Sleep (10%)** - Scientific Basis: Frontiers (2025)
   - RMSSD during deep sleep stages
   - Explains 70% of variance in overnight memory improvement
   - Why: Parasympathetic dominance supports synaptic plasticity
   - **Requires:** Apple Watch or Oura Ring

4. **Sleep Consistency (10-15%)** - Scientific Basis: Phillips et al. (2017)
   - Bedtime variability (SD over 7 days)
   - Accounts for 25% of academic performance variance
   - Optimal: <30 min SD
   - Why: Circadian rhythm stability enhances consolidation

5. **WASO - Wake After Sleep Onset (10%)** - Scientific Basis: Scullin (2019)
   - Total wake time during sleep period
   - Optimal: <30 min
   - Why: Fragmentation interrupts memory reactivation

6. **Sleep Onset Latency (5%)** - Scientific Basis: Ohayon et al. (2000)
   - Time to fall asleep
   - Optimal: 10-20 min (SOL <5 min = sleep deprivation)
   - Why: Indicates circadian alignment

7. **Respiratory Rate (5%)** - Scientific Basis: Kryger et al. (2011)
   - Breaths per minute during sleep
   - Optimal: 12-16 bpm
   - Why: Detects sleep apnea risk (disrupts consolidation)

8. **Deep Sleep Percent (5%)** - Scientific Basis: Stickgold (2005)
   - % of total sleep in N3 stage
   - Optimal: >15%
   - Why: Slow-wave activity drives memory replay

### Session Quality Score

```
Session_Quality_Score (0-100) = single_session_analysis

Where:
  Session_Quality = 0.50 × avg_LRI_during_session +
                   0.30 × optimal_window_utilization +
                   0.20 × sleep_context_score

Time Scale: Per Session (40 min snapshot analysis)
```

**Optimal Window Utilization:**
- Binary indicator: Was this session during post-exercise peak window (1-4h)?
- Detected via Apple Health workout data
- Sleep context score: Previous night's sleep quality from Apple Health

---

## Data Requirements

### Datasets for Algorithm Development

**1. Resting State EEG (Baseline Calibration)**
- **Source:** Texas State University Cognitive Electrophysiology Lab
- **Link:** https://dataverse.tdl.org/dataverse/txstatecogelectro
- **Contents:** 22 subjects, 72 channels, 8 min rest (4 min eyes-closed, 4 min eyes-open)
- **Use case:** Train population baseline models for alpha/beta/theta power norms

**2. Working Memory Task EEG (Focus State Classifier)**
- **Source:** EEGLearn (Bashivan et al., 2016)
- **Link:** https://github.com/pbashivan/EEGLearn/tree/master/Sample%20data
- **Contents:** 15 subjects, 64 channels, n-back working memory task, FFT features for theta/alpha/beta
- **Use case:** Train binary classifier for high-focus vs. low-focus states

**3. Sleep EEG (Consolidation Metrics)**
- **Source:** PhysioNet Sleep-EDF Database (pending download)
- **Link:** https://physionet.org/content/sleep-edfx/1.0.0/
- **Contents:** Full-night polysomnography with EEG, sleep stage annotations
- **Use case:** Extract slow-wave density, spindle counts, REM characteristics

**4. Apple Health Export (Contextual Data)**
- **Source:** User's iPhone export.xml file
- **Contents:**
  - Workouts: High-intensity exercise timing (Running, HIIT, Cycling, Strength)
  - Sleep: Duration, sleep stages, efficiency metrics
- **Use case:**
  - Detect post-exercise optimal windows (1-4h)
  - Calculate sleep quality score for session context
  - Enable actionable recommendations based on workout timing

### Apple Health Integration

**Data Sources:**
1. **Workouts:** Extract high-intensity workouts (Running, HIIT, Cycling, Strength)
   - Used to detect post-exercise optimal windows (1-4h)
2. **Sleep:** Calculate enhanced sleep score with 8 metrics
   - Used as context for session quality and consolidation prediction

**Sleep Data Requirements:**

**Required Fields (All Users):**
- Sleep start/end timestamps
- Sleep stage samples (Core, Deep, REM, Awake, In Bed)
- Time in bed duration

**Optional Fields (Enhanced Scoring):**
- **HRV Samples:** RMSSD or SDNN during sleep window (enables HRV-enhanced formula)
- **Respiratory Rate:** Breaths per minute during sleep
- **7-Day History:** Previous 6 nights for consistency calculation

**Derived Metrics:**
- **Duration:** Total sleep time (hours)
- **Efficiency:** (Total Sleep Time / Time in Bed) × 100
- **WASO:** Wake After Sleep Onset (awake minutes during sleep period)
- **SOL:** Sleep Onset Latency (time to fall asleep)
- **Deep Sleep %:** Deep sleep minutes / Total sleep time
- **Consistency:** Standard deviation of bedtimes over 7 days

**Fallback Behavior:**
- No HRV device → Use base formula (6 components)
- Missing sleep stages → Estimate from movement data
- <7 days history → Use available nights, flag as "insufficient data"
- Missing WASO/SOL → Estimate from stage transitions or use neutral score

**Why It Matters:**
- Workout timing determines when LRI boost occurs
- Sleep quality affects baseline cognitive state
- Enhanced sleep metrics enable accurate consolidation prediction
- Enables actionable recommendations: "Your peak is 2h after morning run"

### Data Preprocessing Pipeline

**Step 1: Band Power Extraction**
```python
# Temporal electrodes: TP9, TP10
sampling_rate = 256  # Hz
window_size = 2      # seconds (512 samples)
overlap = 0.5        # 50% overlap

# FFT → Power Spectral Density
delta_power = psd_integral(0.5, 4)
theta_power = psd_integral(4, 8)
alpha_power = psd_integral(8, 13)
beta_power = psd_integral(13, 30)
gamma_power = psd_integral(30, 50)
```

**Step 2: Artifact Rejection**
- Remove eye blinks (>100 µV amplitude spikes)
- Remove muscle tension (high-frequency noise >50 Hz)
- Baseline drift correction (high-pass filter >0.5 Hz)

**Step 3: Normalization**
- Normalize against population norms from baseline datasets
- Per-band normalization (each frequency band scaled independently)
- **Note:** Personal z-score baselines require 28 days of longitudinal data (not available in MVP)

**Step 4: Feature Engineering**
- Theta/Beta ratio
- Alpha asymmetry (TP10 - TP9) / (TP10 + TP9)
- Alpha suppression index (task_alpha / rest_alpha)
- Temporal stability (coefficient of variation over 30s window)

---

## User Experience

### Daily Workflow

**Morning (30 seconds):**
1. User wears device, initiates calibration
2. App measures resting state (eyes open for 30s)
3. Baseline alpha/beta/theta stored for the day
4. Output: "Morning Brain State: 72/100 - Good baseline!"

**Post-Exercise Window Detection (Automatic):**
1. Phone accelerometer or manual log detects workout completion
2. App notifies: "🔥 OPTIMAL LEARNING WINDOW OPEN - Next 3 hours"
3. Timer countdown shown in app

**During Study/Practice Session (Real-time):**
1. User enables "Focus Mode"
2. Device streams EEG → app computes LRI every 30 seconds
3. Live dashboard shows:
   - Learning Readiness: 84/100
   - Alertness: 78/100 (high beta, low theta/beta ratio)
   - Focus: 88/100 (sustained theta, alpha suppression)
   - Arousal Zone: Optimal (green indicator)
4. Haptic feedback if LRI drops below 60 → "Take a 5-min break"

**Session Summary (Post 40-min snapshot):**
- "Session Quality Score: 78/100"
- "Peak LRI: 86 at 9:47 AM"
- "Total minutes in optimal state: 24/40 (60%)"
- "Optimal windows detected: 9:15-9:30 AM, 9:42-10:00 AM"
- "Actionable insight: Schedule deep work at 9:15 AM daily"

**Context from Apple Health:**
- "This session was 2h after your morning run (optimal window)"
- "Last night's sleep: 7.2 hours, 85% efficiency"

### Mobile App UI Components

**Home Screen (Whoop-inspired):**
- **Large circular gauge:** Current LRI (0-100) with color gradient
  - 0-40: Red (low readiness)
  - 40-70: Yellow (moderate readiness)
  - 70-100: Green (optimal readiness)
- **Post-exercise countdown:** "2h 15m remaining in peak window" (from Apple Health workout)
- **Session Quality Score:** 78/100 with session history list

**Focus Mode (Live Monitoring):**
- **Real-time meters:**
  - Alertness bar (horizontal)
  - Focus bar (horizontal)
  - Arousal zone indicator (inverted-U curve with current position)
- **Session timer:** Duration in optimal state
- **Haptic alerts:** Vibrate when dropping out of zone

**Sleep Tab (Apple Health Data):**
- **Last night's sleep score:** 81/100
- **Key metrics from Apple Health:**
  - Sleep duration: 7.2 hours
  - Sleep efficiency: 85%
  - Time in bed: 8.5 hours
- **Insight:** "Good sleep detected - baseline cognitive state should be strong"

**Journal Tab:**
- **Session history:** List of past 40-min sessions with timestamps
- **Supplement logging:** Manual entry (UI only, not factored into algorithm)
- **Top insights:** "Why this session scored high/low"
  - "Session 2h after morning run → 1.3x multiplier"
  - "Low alpha during session → high engagement detected"
  - "Good sleep last night (7.2h) → strong baseline"

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────┐
│  1. DATA LAYER                               │
│     ├─ EEG signal acquisition (256 Hz)      │
│     ├─ Accelerometer (exercise detection)   │
│     ├─ Manual logs (learning sessions)      │
│     └─ Cloud sync (historical data)         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. SIGNAL PROCESSING ENGINE                 │
│     ├─ Band power extraction (FFT)          │
│     ├─ Artifact rejection                   │
│     ├─ Feature engineering                  │
│     └─ Real-time streaming pipeline         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. SCORING ENGINE                           │
│     ├─ Alertness calculator                 │
│     ├─ Focus calculator                     │
│     ├─ Arousal balance detector             │
│     ├─ Post-exercise multiplier             │
│     └─ Sleep consolidation analyzer         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. MOBILE APP (React Native)                │
│     ├─ Real-time LRI dashboard              │
│     ├─ Focus mode (live monitoring)         │
│     ├─ Sleep report                         │
│     └─ Historical trends                    │
└─────────────────────────────────────────────┘
```

### Backend API Endpoints

**Real-time Endpoints:**
- `POST /api/eeg/stream` → Stream raw EEG samples
- `GET /api/lri/current` → Get current Learning Readiness Index
- `GET /api/state/alertness` → Get current alertness score
- `GET /api/state/focus` → Get current focus score

**Historical Endpoints:**
- `GET /api/scores/session/:id` → Get Session Quality Score for specific session
- `GET /api/scores/history?limit=10` → Get recent session history
- `GET /api/sleep/apple-health` → Get sleep data from Apple Health export

**Event Endpoints:**
- `POST /api/events/session` → Log 40-min session completion
- `POST /api/events/supplement` → Log supplement intake (UI only)
- `POST /api/apple-health/import` → Import Apple Health export.xml
- `POST /api/calibration/baseline` → Store session baseline

---

## MVP Feature Scope (Hackathon)

### In Scope
✅ Real-time band power extraction from TP9/TP10
✅ Alertness + Focus score calculation
✅ Learning Readiness Index algorithm
✅ Session-level optimal window detection (40-min snapshots)
✅ Post-exercise window tracking via Apple Health workouts
✅ Sleep score calculation from Apple Health export.xml
✅ Supplement logging (UI only, not factored into algorithm)
✅ Mobile app UI mockup (Figma + basic React Native screens)
✅ Session history visualization
✅ Algorithm validation using EEGLearn dataset

### Out of Scope (Post-Hackathon)
❌ 28-day Brain Score (requires longitudinal data from same individual, only have 40-min snapshots)
❌ Personalized z-score baselines (requires 28-day rolling baseline, using population norms instead)
❌ Real-time Bluetooth streaming (using 40-min snapshot data)
❌ Actual hardware prototype (use Muse headband for demo)
❌ Cloud backend (local processing only)
❌ User authentication / multi-user support
❌ App store deployment
❌ Clinical validation studies

### Note on Brain Score
**Brain Score requires 28 days of longitudinal data from the same individual. Not available in MVP due to data constraints (only have 40-min snapshots).** Future versions will incorporate rolling baseline calculations once continuous user data becomes available.

---

## Validation Plan

### Phase 1: Algorithm Validation (Hackathon)
1. Train alertness/focus classifiers on EEGLearn working memory dataset
2. Test band power extraction on Texas State resting data
3. Demonstrate >80% classification accuracy for high vs. low focus states
4. Generate synthetic 7-day user journey with realistic band power curves

### Phase 2: Pilot Testing (Post-Hackathon)
1. N=10 users, 2 weeks of session measurements
2. Compare self-reported learning quality vs. Session Quality Scores
3. Measure correlation between post-exercise window usage and peak LRI
4. Validate sleep scores against Apple Health + Oura Ring data

### Phase 3: Clinical Validation (Future)
1. Partner with neuroscience lab (e.g., Huberman Lab)
2. N=100 users, 8 weeks, controlled learning tasks
3. Compare neuroplasticity outcomes (skill acquisition rate) for high-LRI vs. low-LRI study sessions
4. Collect longitudinal data to enable 28-day Brain Score calculation
5. Publish peer-reviewed validation study

---

## Success Criteria

### MVP (Hackathon Demo)
- [ ] Algorithm processes real EEG data from 40-min sessions
- [ ] Generates Learning Readiness Index in <2 seconds
- [ ] Detects optimal windows within session (LRI >= 70)
- [ ] Mobile app mockup shows real-time LRI updates
- [ ] Enhanced sleep score calculated from Apple Health export (8 metrics)
- [ ] HRV-enabled and base formula support
- [ ] Post-exercise window detection from Apple Health workouts
- [ ] Session history visualization shows multiple snapshots

### Sleep Algorithm Validation
- [ ] Sleep score correlates with self-reported sleep quality (r > 0.7 target)
- [ ] Consistency component detects irregular sleep patterns correctly
- [ ] HRV-enabled formula outperforms base formula (validated on N=50 users)
- [ ] WASO detection matches subjective awakenings within 20% error
- [ ] All 8 metrics successfully extracted from Apple Health export

### Beta Launch (3 months post-hackathon)
- [ ] Hardware prototype with behind-ear dry electrodes
- [ ] 10 pilot users complete 2-week testing (multiple sessions)
- [ ] 80%+ accuracy on high/low focus state classification
- [ ] Users report 40%+ increase in optimal window utilization
- [ ] Begin collecting 28-day longitudinal data for Brain Score baseline

### Product-Market Fit (12 months)
- [ ] 1,000 active users
- [ ] Average engagement: 5+ sessions/week
- [ ] Demonstrated correlation (r > 0.6) between Session Quality Score and self-reported learning outcomes
- [ ] 28-day Brain Score enabled with longitudinal user data
- [ ] Revenue: $50k MRR from device sales + subscription

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Poor EEG signal quality with dry electrodes | High | High | Use gel electrodes for MVP, iterate on dry electrode design |
| Low correlation between LRI and actual learning outcomes | Medium | High | Extensive validation, adjust algorithm weights based on pilot data |
| User finds real-time monitoring distracting | Medium | Medium | Offer "passive mode" with post-session summaries only |
| Sleep consolidation metrics unreliable | Medium | Medium | Partner with validated sleep tracker (Oura/Whoop) for hybrid approach |
| Behind-ear placement insufficient for theta detection | Low | High | Add optional forehead bridge for frontal theta if needed |

---

## Competitive Landscape

**Direct Competitors:**
- **Muse (InteraXon):** Meditation focus, not learning optimization
- **Neurosity Crown:** Developer-focused, expensive ($999), not consumer-ready
- **Emotiv MN8:** Ear-EEG but no neuroplasticity focus

**Indirect Competitors:**
- **Oura Ring / Whoop:** Sleep tracking, no real-time brain state detection
- **Focus apps (Forest, Pomodoro):** Arbitrary timers, no neurofeedback
- **Notion / Roam:** Learning systems, no biological optimization

**Axon's Differentiation:**
1. First product optimized specifically for neuroplasticity (not meditation or sleep alone)
2. Real-time learning readiness detection (not retrospective analysis)
3. Behind-ear form factor (more discreet than headbands)
4. Science-backed mechanism (vagus nerve → acetylcholine pathway)

---

## Roadmap

**Phase 1: MVP (Hackathon - 48 hours)**
- Algorithm development
- Dataset preprocessing
- Mobile app mockup
- Demo video

**Phase 2: Alpha (Months 1-3)**
- Hardware prototype with Muse headband
- Bluetooth streaming
- Backend API
- N=10 pilot users

**Phase 3: Beta (Months 4-6)**
- Custom behind-ear device (first production run: 50 units)
- Cloud backend with user accounts
- App store submission
- N=100 beta testers

**Phase 4: Launch (Months 7-12)**
- Production hardware (1,000 units)
- Public launch
- Marketing campaign (biohackers, students, professionals)
- Partnerships (Huberman Lab, learning platforms)

---

## Appendix: Key Formulas

### Inverted-U Arousal Function (Yerkes-Dodson)
```python
def optimal_arousal_score(beta_alpha_ratio):
    optimal_ratio = 1.5  # Empirically determined
    deviation = abs(beta_alpha_ratio - optimal_ratio)
    score = 100 * exp(-0.5 * (deviation / 0.5)**2)  # Gaussian
    return score
```

### Alpha Suppression Index
```python
def alpha_suppression_index(task_alpha, rest_alpha):
    suppression = (rest_alpha - task_alpha) / rest_alpha
    score = 100 * min(1.0, max(0.0, suppression))
    return score
```

### Sleep Spindle Detection
```python
def detect_spindles(eeg_signal, fs=256):
    # Band-pass filter 12-15 Hz
    filtered = bandpass_filter(eeg_signal, 12, 15, fs)
    # RMS envelope
    envelope = np.sqrt(np.convolve(filtered**2, np.ones(fs)//fs))
    # Threshold: 2x median amplitude
    threshold = 2 * np.median(envelope)
    spindles = find_peaks(envelope, height=threshold, distance=fs*0.5)
    return len(spindles)
```

---

## References

### Neuroplasticity & EEG
1. Huberman, A. (2024). "Vagus Nerve Stimulation & Neuroplasticity" - Huberman Lab Podcast
2. Merzenich, M. et al. (2014). "Nucleus basalis stimulation enhances cortical plasticity" - Nature
3. Bashivan, P. et al. (2016). "Learning Representations from EEG with Deep RNNs" - ICLR
4. Yerkes, R.M. & Dodson, J.D. (1908). "The relation of strength of stimulus to rapidity of habit-formation" - Optimal arousal theory

### Sleep & Memory Consolidation
5. Walker, M. (2017). "Why We Sleep: Unlocking the Power of Sleep and Dreams" - Scribner
6. Stickgold, R. (2005). "Sleep-dependent memory consolidation" - Nature, 437(7063), 1272-1278
7. Walker, M. & Stickgold, R. (2006). "Sleep, memory, and plasticity" - Annual Review of Psychology, 57, 139-166
8. Tononi, G. & Cirelli, C. (2014). "Sleep and the price of plasticity" - Neuron, 81(1), 12-34

### Sleep Quality Metrics
9. Ohayon, M. et al. (2017). "National Sleep Foundation's sleep quality recommendations" - Sleep Health, 3(1), 6-19
10. Ohayon, M. et al. (2000). "Meta-analysis of quantitative sleep parameters" - Sleep, 27(7), 1255-1273
11. Scullin, M. (2019). "Sleep, memory, and aging" - Psychology and Aging, 34(1), 126-139
12. Krystal, A. & Edinger, J. (2008). "Measuring sleep quality" - Sleep Medicine, 9(Suppl 1), S10-S17

### Sleep Consistency & HRV
13. Phillips, A. et al. (2017). "Irregular sleep/wake patterns and poorer academic performance" - Scientific Reports, 7(1), 3216
14. Bei, B. et al. (2016). "Beyond the mean: Quantifying sleep heterogeneity" - Sleep Medicine Reviews, 28, 108-124
15. Buchheit, M. & Gindre, C. (2006). "Cardiac parasympathetic regulation" - American Journal of Physiology, 291(1), H451-H458
16. Stein, P. & Pu, Y. (2012). "Heart rate variability, sleep and sleep disorders" - Sleep Medicine Reviews, 16(1), 47-66
17. Frontiers (2025). "Vagal HRV during REM reduces negative memory bias" - Frontiers in Neuroscience

### Respiratory & Sleep Architecture
18. Kryger, M. et al. (2011). "Principles and Practice of Sleep Medicine" (5th ed.) - Elsevier Saunders
19. Nature Communications (2023). "Respiration modulates oscillatory neural network activity" - Nature Communications, 14(1), 4404

---

**End of PRD**
