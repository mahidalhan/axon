# Dataset Requirements & Hardware Alignment

**Version:** 2.0
**Date:** November 8, 2025
**Status:** Updated with Zenodo Primary Dataset
**Purpose:** Identify datasets that match our Muse hardware configuration

---

## Critical Constraint: Hardware-Data Alignment

**Problem:** Training algorithms on datasets with different electrode configurations will introduce systematic errors when deployed on our actual hardware.

**Solution:** Use datasets collected with **identical electrode positions** (TP9, AF7, AF8, TP10).

---

## Our Target Hardware Specification

### Muse 2/Muse S - Development Platform

**Electrode Positions:**
- **TP9** (left temporal-parietal, behind left ear)
- **AF7** (left frontal)
- **AF8** (right frontal)
- **TP10** (right temporal-parietal, behind right ear)

**Technical Specs:**
- Sampling Rate: 256 Hz
- Resolution: 12-bit
- Reference: FPz (CMS/DRL)
- Dry electrodes (consumer-friendly)

**Available Outputs:**
- Raw EEG (μV)
- Band Power (Delta, Theta, Alpha, Beta, Gamma) - pre-computed
- Accelerometer (3-axis, 52 Hz) - exercise detection
- Gyroscope - motion artifacts
- PPG sensor - HRV for vagus nerve health

**Alignment with PRD:**
✅ TP9, TP10 - Alertness detection (norepinephrine pathway)
✅ AF7, AF8 - Focus detection (acetylcholine pathway)
✅ 256 Hz - Real-time LRI computation
✅ Accelerometer - Post-exercise window detection
✅ PPG - Vagus activation health (HRV)

---

## Primary Dataset: Zenodo Muse EEG (SELECTED FOR MVP)

### Muse EEG Subconscious Decisions Dataset

**Direct Download:**
https://zenodo.org/records/8429740/files/Muse%20EEG%20Subconscious%20Decisions%20Dataset.zip?download=1

**Specifications:**
- **Electrodes:** TP9, AF7, AF8, TP10 (exact match)
- **Subjects:** 20 participants
- **Trials:** Multiple sessions per subject (up to 10 trials each)
- **Size:** 315.2 MB
- **License:** CC BY 4.0 (fully open access)
- **Published:** March 19, 2021
- **DOI:** 10.5281/zenodo.8429740

**Data Format:**
```
Timestamp,
Delta_TP9, Delta_AF7, Delta_AF8, Delta_TP10,
Theta_TP9, Theta_AF7, Theta_AF8, Theta_TP10,
Alpha_TP9, Alpha_AF7, Alpha_AF8, Alpha_TP10,
Beta_TP9, Beta_AF7, Beta_AF8, Beta_TP10,
Gamma_TP9, Gamma_AF7, Gamma_AF8, Gamma_TP10,
RAW_TP9, RAW_AF7, RAW_AF8, RAW_TP10,
Accelerometer_X, Accelerometer_Y, Accelerometer_Z,
Gyro_X, Gyro_Y, Gyro_Z,
HeadBandOn, HSI_TP9, HSI_AF7, HSI_AF8, HSI_TP10,
Battery
```

**Use Cases for Brain Score:**

1. **Focus Score Algorithm** (PRD line 101-103)
   - Decision-making task requires sustained focus
   - Train high-focus vs. baseline classifier
   - Validates frontal theta power (AF7, AF8)

2. **Alertness Score** (PRD line 97-99)
   - Task engagement requires alertness
   - Validates beta power (TP9, TP10)
   - Theta/beta ratio computation

3. **Baseline Capacity** (Brain Score Spec line 86-127)
   - Resting state data between trials
   - Morning calibration simulation
   - Z-score normalization baseline

4. **Exercise Detection Testing**
   - Accelerometer data for movement detection
   - Post-exercise window simulation
   - Validates Exercise Frequency Score algorithm

**Why This Dataset is Perfect:**
- ✅ Exact hardware match (TP9, AF7, AF8, TP10)
- ✅ Pre-computed band power (ready to use)
- ✅ Raw EEG available (custom processing if needed)
- ✅ Multiple trials per subject (robust training)
- ✅ Quality metrics included (HSI per electrode)
- ✅ Accelerometer for exercise detection prototyping
- ✅ Open access (no subscription required)

---

## Secondary Datasets (Optional for Validation)

### 1. GitHub Muse Dataset - Eyes Open/Closed

**Access:** https://github.com/6661647a77616e/Muse-Dataset

- **Subjects:** 7 participants
- **Tasks:** Eyes Closed (EC), Eyes Open (EO)
- **Use:** Alpha suppression index validation
- **Format:** CSV files
- **Direct access:** Raw GitHub links available

**Use Case:** Baseline capacity algorithm (eyes-closed resting state)

---

### 2. Kaggle Mental State Dataset

**Access:** https://www.kaggle.com/datasets/birdy654/eeg-brainwave-dataset-mental-state

- **Subjects:** 4 participants
- **States:** Relaxed, Concentrating, Neutral
- **Duration:** 60-second intervals
- **Size:** 25.3 MB
- **Use:** Focus Score classifier (concentrating vs. relaxed)

**Use Case:** Quick prototyping, small dataset for testing

---

### 3. PhysioNet Sleep-EDF Database

**Source:** https://physionet.org/content/sleep-edfx/1.0.0/

- **Data:** Full-night polysomnography
- **Annotations:** Sleep stage labels (N1, N2, N3, REM, Wake)
- **Use:** Sleep Consolidation Score algorithm

**Use Case:** Validate overnight neuroplasticity consolidation metrics

---

## Datasets to Avoid

### ❌ SSED (SJTU Emotion EEG Dataset)
- **Reason:** 62-channel research array, emotion recognition ≠ neuroplasticity
- **Electrodes:** Frontal focus, not TP9/TP10 optimized
- **Verdict:** Skip entirely for MVP

### ❌ EPOC+ Datasets
- **Reason:** Uses T7/T8 (NOT TP9/TP10) - 3-4 cm spatial difference
- **Verdict:** Incompatible electrode positions

### ❌ High-Density Arrays (64+ channels)
- **Reason:** Models trained on 64+ channels expect spatial info we won't have
- **Verdict:** Risk of electrode dependency, skip for MVP

---

## Data Processing Pipeline (Hardware-Agnostic)

### Input Requirements
```python
# Electrode configuration
required_channels = ['TP9', 'TP10']
optional_channels = ['AF7', 'AF8']  # Enhances focus detection

# Sampling
sampling_rate = 256  # Hz
resolution = 12  # bits (minimum)

# Reference
reference = 'FPz'  # Or mastoid (A1/A2)
```

### Band Power Extraction
```python
# FFT → Power Spectral Density
bands = {
    'delta': (0.5, 4),    # Hz
    'theta': (4, 8),
    'alpha': (8, 13),
    'beta': (13, 30),
    'gamma': (30, 50)
}

# Extract power for each channel
for channel in ['TP9', 'TP10', 'AF7', 'AF8']:
    for band_name, (low, high) in bands.items():
        power[channel][band_name] = psd_integral(channel, low, high)
```

**This pipeline works identically on:**
- Zenodo Muse dataset (primary)
- Future custom hardware (same electrodes)
- Any Muse-compatible device

---

## Neural Mechanisms & Electrode Mapping

### Temporal-Parietal (TP9, TP10)
- **Detects:** Alpha rhythms (8-13 Hz) from posterior cortex
- **Reflects:** Alertness/arousal (norepinephrine-mediated)
- **Brain Score Component:** Alertness Score, Arousal Balance
- **Pathway:** Vagus → NTS → Locus Coeruleus → TP9/TP10 alpha suppression

### Frontal (AF7, AF8)
- **Detects:** Frontal theta (4-8 Hz)
- **Reflects:** Working memory load, sustained attention (acetylcholine-mediated)
- **Brain Score Component:** Focus Score
- **Pathway:** Vagus → NTS → Nucleus Basalis → AF7/AF8 theta increase

**Why Electrode Position Matters:**
- TP9/TP10 ≠ T7/T8 (3-4 cm difference, different cortical projections)
- Training on wrong electrodes = models expect different neural signals
- Muse data → directly transfers to our custom hardware

---

## MVP Implementation Plan

### Week 1: Download & Explore
```bash
# Download Zenodo dataset
wget https://zenodo.org/records/8429740/files/Muse%20EEG%20Subconscious%20Decisions%20Dataset.zip

# Extract
unzip "Muse EEG Subconscious Decisions Dataset.zip"
```

### Week 2: Build Algorithms
1. Load Zenodo dataset (20 subjects, multiple trials)
2. Extract band power features (already pre-computed)
3. Train Focus Score classifier (decision task = high focus)
4. Train Alertness Score detector (beta power baseline)
5. Validate with resting-state segments

### Week 3: Validate & Iterate
1. Cross-validation across subjects
2. Test on secondary datasets (Kaggle, GitHub)
3. Refine algorithm weights
4. Document accuracy metrics

### Week 4: Sleep Integration (Optional)
1. Download PhysioNet Sleep-EDF
2. Build Sleep Consolidation Score algorithm
3. Integrate into Brain Score formula

---

## Validation Checklist

Before using any dataset, confirm:
- [x] Includes TP9, AF7, AF8, TP10 electrodes (Zenodo: YES)
- [x] Sampling rate ≥ 256 Hz (Zenodo: 256 Hz)
- [x] Band power extractable (Zenodo: pre-computed)
- [x] Task relevant to neuroplasticity (Zenodo: decision-making/focus)
- [x] Sufficient participants (Zenodo: 20 subjects)
- [x] Open access (Zenodo: CC BY 4.0)

---

## Hardware Purchase Recommendation

**For MVP/Hackathon:**

**Muse S ($449)** - Recommended
- ✅ Exact electrode match (TP9, AF7, AF8, TP10)
- ✅ Enhanced sleep tracking (PPG, thermistor)
- ✅ Overnight sleep consolidation measurement
- ✅ Most comfortable for extended sessions

**Muse 2 ($249)** - Budget Option
- ✅ Same electrodes (TP9, AF7, AF8, TP10)
- ✅ Same 256 Hz sampling
- ⚠️ No sleep tracking enhancements

**Recommendation:** Muse S for full Brain Score validation (includes sleep component).

---

## Summary

**Primary Dataset:** Zenodo Muse EEG (20 subjects, 315 MB, open access)
**Hardware:** Muse S headband ($449)
**Timeline:** 4 weeks to MVP algorithms
**Next Step:** Download Zenodo dataset and start Focus Score algorithm

**Key Insight:** Algorithms trained on Zenodo Muse data will transfer directly to our custom hardware (same TP9, AF7, AF8, TP10 positions).

---

**See Also:**
- `/docs/data-pipeline/` - Cleaning pipelines for Muse EEG & Apple Health
- `/docs/emergent-build/` - Backend/UI build specifications
- `/docs/algorithm/neuro-PRD.md` - Full product requirements
- `/docs/shared/TERMINOLOGY.md` - Glossary of shared metrics

---

**End of Dataset Requirements Document**
