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

### Sleep Consolidation Index (Overnight Analysis)

```
Sleep_Consolidation_Score (0-100) = weighted_sum(SWS, Spindles, REM, Efficiency)

Where:
  SWS_Quality = 0.4 × slow_wave_density (delta power in N3)
  Spindle_Count = 0.3 × sleep_spindle_density (12-15 Hz bursts)
  REM_Percentage = 0.2 × (REM_minutes / total_sleep_time)
  Sleep_Efficiency = 0.1 × (sleep_time / time_in_bed)
```

### Daily Neuroplasticity Opportunity Score (DNOS)

```
DNOS (0-100) = integration_across_day

Where:
  DNOS = 0.50 × avg_LRI_during_active_learning +
         0.30 × optimal_window_utilization_rate +
         0.20 × previous_night_sleep_consolidation
```

**Optimal Window Utilization Rate:**
- Percentage of post-exercise peak hours (1-4h window) spent in focused learning activities
- Tracked via manual logging or app integration

---

## Data Requirements

### Datasets for Algorithm Development

**1. Resting State EEG (Baseline Calibration)**
- **Source:** Texas State University Cognitive Electrophysiology Lab
- **Link:** https://dataverse.tdl.org/dataverse/txstatecogelectro
- **Contents:** 22 subjects, 72 channels, 8 min rest (4 min eyes-closed, 4 min eyes-open)
- **Use case:** Train individual baseline models for alpha/beta/theta power norms

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
- Z-score against personal 28-day rolling baseline
- Per-band normalization (each frequency band scaled independently)

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

**Evening Summary:**
- "Today's Neuroplasticity Score: 78/100"
- "You captured 2.5 hours in optimal state (87th percentile)"
- "Post-exercise window utilization: 65% (improved from 40% last week)"

**Next Morning (Sleep Consolidation Report):**
- "Sleep Consolidation: 81/100"
- "Slow-wave sleep: 22% of night (excellent)"
- "Sleep spindles: 145 detected (above average)"
- "Estimated learning retention: High"

### Mobile App UI Components

**Home Screen (Whoop-inspired):**
- **Large circular gauge:** Current LRI (0-100) with color gradient
  - 0-40: Red (low readiness)
  - 40-70: Yellow (moderate readiness)
  - 70-100: Green (optimal readiness)
- **Post-exercise countdown:** "2h 15m remaining in peak window"
- **Today's DNOS:** 78/100 with 7-day sparkline trend

**Focus Mode (Live Monitoring):**
- **Real-time meters:**
  - Alertness bar (horizontal)
  - Focus bar (horizontal)
  - Arousal zone indicator (inverted-U curve with current position)
- **Session timer:** Duration in optimal state
- **Haptic alerts:** Vibrate when dropping out of zone

**Sleep Tab:**
- **Overnight consolidation score:** 81/100
- **Sleep architecture:** Hypnogram showing N1/N2/N3/REM stages
- **Key metrics:**
  - Slow-wave density (minutes in N3)
  - Spindle count
  - REM percentage
- **Insight:** "Your deep sleep increased 15% compared to 7-day average"

**Journal Tab:**
- **Daily log:** Manual entry for learning activities
- **Top drivers:** "Why your score changed today"
  - "Morning exercise → 1.5x multiplier activated"
  - "Low alpha during study → high engagement detected"
  - "Poor sleep last night → reduced consolidation"

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
- `GET /api/scores/daily` → Get DNOS for specified date
- `GET /api/scores/trend?days=7` → Get 7-day trend data
- `GET /api/sleep/consolidation?date=YYYY-MM-DD` → Get sleep report

**Event Endpoints:**
- `POST /api/events/exercise` → Log exercise completion
- `POST /api/events/learning_session` → Log learning activity
- `POST /api/calibration/baseline` → Store morning baseline

---

## MVP Feature Scope (Hackathon)

### In Scope
✅ Real-time band power extraction from TP9/TP10
✅ Alertness + Focus score calculation
✅ Learning Readiness Index algorithm
✅ Post-exercise window tracker (manual exercise logging)
✅ Sleep consolidation scorer (offline analysis)
✅ Mobile app UI mockup (Figma + basic React Native screens)
✅ 7-day demo data visualization
✅ Algorithm validation using EEGLearn dataset

### Out of Scope (Post-Hackathon)
❌ Actual hardware prototype (use Muse headband for demo)
❌ Real-time Bluetooth streaming (use pre-recorded data)
❌ Cloud backend (local processing only)
❌ User authentication / multi-user support
❌ App store deployment
❌ Clinical validation studies

---

## Validation Plan

### Phase 1: Algorithm Validation (Hackathon)
1. Train alertness/focus classifiers on EEGLearn working memory dataset
2. Test band power extraction on Texas State resting data
3. Demonstrate >80% classification accuracy for high vs. low focus states
4. Generate synthetic 7-day user journey with realistic band power curves

### Phase 2: Pilot Testing (Post-Hackathon)
1. N=10 users, 2 weeks of daily measurements
2. Compare self-reported learning quality vs. LRI scores
3. Measure correlation between post-exercise window usage and DNOS
4. Validate sleep consolidation scores against Oura Ring data

### Phase 3: Clinical Validation (Future)
1. Partner with neuroscience lab (e.g., Huberman Lab)
2. N=100 users, 8 weeks, controlled learning tasks
3. Compare neuroplasticity outcomes (skill acquisition rate) for high-LRI vs. low-LRI study sessions
4. Publish peer-reviewed validation study

---

## Success Criteria

### MVP (Hackathon Demo)
- [ ] Algorithm processes real EEG data from datasets
- [ ] Generates Learning Readiness Index in <2 seconds
- [ ] Mobile app mockup shows real-time LRI updates
- [ ] Sleep consolidation analysis produces interpretable scores
- [ ] 7-day demo data shows realistic variability and trends

### Beta Launch (3 months post-hackathon)
- [ ] Hardware prototype with behind-ear dry electrodes
- [ ] 10 pilot users complete 2-week testing
- [ ] 80%+ accuracy on high/low focus state classification
- [ ] Users report 40%+ increase in optimal window utilization

### Product-Market Fit (12 months)
- [ ] 1,000 active users
- [ ] Average engagement: 5+ sessions/week
- [ ] Demonstrated correlation (r > 0.6) between DNOS and self-reported learning outcomes
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

1. Huberman, A. (2024). "Vagus Nerve Stimulation & Neuroplasticity" - Huberman Lab Podcast
2. Merzenich, M. et al. (2014). "Nucleus basalis stimulation enhances cortical plasticity" - Nature
3. Bashivan, P. et al. (2016). "Learning Representations from EEG with Deep RNNs" - ICLR
4. Walker, M. (2017). "Why We Sleep" - Sleep consolidation mechanisms
5. Yerkes, R.M. & Dodson, J.D. (1908). "The relation of strength of stimulus to rapidity of habit-formation" - Optimal arousal theory

---

**End of PRD**
