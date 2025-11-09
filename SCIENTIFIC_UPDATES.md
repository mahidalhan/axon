# AXON App - Scientific Algorithm Updates

## Changes Implemented (Based on First Principles Research)

### ✅ 1. Scientifically Accurate Naming

| Old Name | New Name | Rationale |
|----------|----------|-----------|
| Neural State | **Learning Readiness** | More honest - indicates potential, not outcome |
| Brain Score | **Neuroplasticity Readiness** | Aspirational but clear about mission |
| Sleep Quality | **Sleep Consolidation** | Mechanism-focused, scientifically accurate |

### ✅ 2. Corrected Backend Algorithm

**Brain Score Formula (from docs/shared/brain-score-proposal.md):**

```python
brain_score = (
    0.55 × learning_readiness +    # Session performance
    0.25 × consolidation +          # Sleep score
    0.20 × behavior_alignment       # Workout timing + habits
)
```

**Learning Readiness (Session Score) - FIXED:**
```python
# OLD (WRONG):
neural_state = (optimal_minutes / total_minutes) × 100

# NEW (CORRECT):
session_score = (
    0.50 × avg_LRI_during_session +
    0.30 × optimal_window_utilization +
    0.20 × sleep_context_score
)
# Apply soft ceiling at 92 (Yerkes-Dodson inverted-U)
```

**Sleep Consolidation - Already Correct:**
```python
# HRV-Enabled Formula (8 metrics):
sleep_score = (
    0.30 × duration +
    0.25 × efficiency +
    0.10 × hrv +
    0.10 × consistency +
    0.10 × waso +
    0.05 × sol +
    0.05 × respiratory_rate +
    0.05 × deep_sleep_percent
)
```

**Behavior Alignment - IMPLEMENTED:**
```python
behavior_score = 50  # baseline
+ 10 if session in post-exercise window (1-4h)
+ 5 per workout whose window was utilized
# Clamped between 20-95
```

### ✅ 3. UI Updates

**Home Screen:**
- Ring 1: "**Learning Readiness**" (amber, 55% weight)
- Ring 2: "**Neuroplasticity**" (green, center, 100%)
- Ring 3: "**Consolidation**" (purple, 25% weight)
- All rings tappable for detailed breakdown

**Modal Details:**
- Learning Readiness modal shows:
  - Peak LRI, Optimal Time, Alertness, Focus, Balance
  - Formula breakdown (50% + 30% + 20%)
  - Scientific explanation
  - **Disclaimer:** "This measures brain states, not actual learning outcomes"

- Neuroplasticity modal shows:
  - 3 components with weights (55%, 25%, 20%)
  - Formula explanation
  - **Disclaimer:** "Based on Huberman Lab protocols. Validation ongoing"

- Consolidation modal shows:
  - Sleep score with 8 metrics
  - Formula version (HRV-enabled or base)
  - **Research citations:** Walker (2017), Stickgold (2005), Frontiers (2025)

**Time Display:**
- "Active Now • 6:43 PM" (real-time clock)

### ✅ 4. Learn Tab - Scientific Education

**New Section: "How Your Scores Work"**

**Card 1: Neuroplasticity Readiness**
- Formula: 55% + 25% + 20%
- What it measures vs. what it doesn't
- Clear disclaimers

**Card 2: Learning Readiness Score**
- LRI components (50% + 30% + 20%)
- EEG correlation explanation
- Honesty: "Not a direct measurement of neuroplasticity"

**Existing Section: 8 Sleep Metrics**
- All 8 metrics now shown with weights:
  1. Duration (30%)
  2. Efficiency (25%)
  3. HRV (10%)
  4. Consistency (10%)
  5. WASO (10%)
  6. SOL (5%)
  7. Respiratory Rate (5%)
  8. Deep Sleep % (5%)

### ✅ 5. Apple Health Import Screen

**Features:**
- Data sources list (Apple Watch, iPhone)
- Hide/show data sources toggle
- "Connect Apple Health" button (red heart icon)
- List of imported data types
- Privacy assurance card

**For Production:**
- Requires `react-native-health` or `@kingstinct/react-native-healthkit`
- Needs Custom Dev Client (Expo)
- Currently shows prototype UI with demo data

---

## Scientific Honesty Framework

### What We Actually Measure:

**EEG (Learning Readiness):**
- ✓ Brain wave patterns (beta, theta, alpha)
- ✓ Correlates with alertness/focus states
- ✗ NOT neurotransmitters
- ✗ NOT plasticity directly
- ✗ NOT learning outcomes

**Sleep (Consolidation):**
- ✓ Duration, efficiency, HRV, consistency
- ✓ Conditions favorable for memory consolidation
- ✓ Research-validated metrics
- ✗ NOT proof consolidation occurred
- ✗ NOT measurement of synaptic changes

**Composite Score:**
- ✓ Research-based formula
- ✓ Informed by neuroscience literature
- ✗ NOT clinically validated
- ✗ NOT predictive of learning success (yet)

### Disclaimers Added:

1. **In Modals:** "This measures brain states, not actual learning outcomes"
2. **In Learn Tab:** "Research-based but individually variable"
3. **In Formula Cards:** "Validation ongoing"
4. **Emphasis:** Tool for optimization, not diagnosis

---

## Key Improvements from Research

### 1. Session Score Now Includes Sleep Context
- Previous formula ignored last night's sleep
- New formula: 20% weight on sleep quality
- Matches docs specification

### 2. Soft Ceiling at 92
- Implements Yerkes-Dodson inverted-U relationship
- Prevents overstimulation scores
- Scientifically grounded

### 3. Behavior Alignment Calculated
- No longer hardcoded
- Based on workout timing
- Follows research protocols

### 4. Transparent Weighting
- All weights shown to users
- Formula explained in Learn tab
- Research citations provided

---

## User-Facing Changes

**What Users See:**
1. "Learning Readiness" ring (clearer than "Neural State")
2. "Neuroplasticity" as main score (aspirational, mission-aligned)
3. "Consolidation" instead of "Sleep Quality" (mechanism-focused)
4. Current time display on Optimal Window
5. Tappable rings with detailed breakdowns
6. Scientific explanations with disclaimers
7. All 8 sleep metrics with weights
8. Apple Health import screen

**What Users Learn:**
- How scores are calculated
- What research supports them
- What they measure vs. don't measure
- How to improve each component
- Actionable insights

---

## Algorithm Validation Status

**Per Documentation:**
- ✅ All metrics have peer-reviewed citations
- ✅ Weight justifications documented
- ✅ Optimal ranges from research
- ⚠️ Correlation testing in progress (N=50 target)
- ⚠️ Clinical validation future (polysomnography comparison)
- ⚠️ Learning outcome correlation not yet established

**Honest Positioning:**
- "Research-based tool for optimizing learning habits"
- "Not a medical device or clinical diagnostic"
- "Individual results vary"
- "Validation ongoing"

---

## Next Steps for Production

**Algorithm:**
1. Collect pilot data (N=10-50 users)
2. Correlate scores with self-reported learning quality
3. Validate sleep scores against Oura/Whoop data
4. Test learning outcome predictions
5. Tune weights based on empirical data

**Integration:**
1. Implement real Apple HealthKit connection
2. Add Custom Dev Client for native modules
3. Request HealthKit permissions properly
4. Sync data securely

**Education:**
1. Add more visual diagrams
2. Interactive formula explorer
3. Personalized tips based on scores
4. Research paper links

---

## Summary

✅ **Algorithm now matches docs specification**
✅ **Scientifically honest naming**
✅ **Clear disclaimers about validation status**
✅ **Transparent formula presentation**
✅ **All 8 sleep metrics explained**
✅ **Research citations provided**
✅ **Actionable insights maintained**

The app now presents neuroplasticity optimization as a **research-informed tool** rather than a validated diagnostic, which is scientifically appropriate for the current development stage.

---

**Status:** Ready for user testing with corrected algorithms and honest scientific framing.
**New Tunnel:** exp://j7yibza-anonymous-3000.exp.direct
