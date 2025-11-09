# Terminology & Shared Metrics

This glossary aligns engineering documentation with the cognitive-science model used throughout the Brain Score stack.

## Data Structures
- **Window** – 30-second slice of continuous EEG (7,680 samples at 256 Hz). Used by `EEGPreprocessor` for band-power aggregation.
- **HSI (Headband Signal Index)** – Composite quality metric per Muse sample incorporating impedance, stability, and artifact flags. Threshold ≤2.5 indicates acceptable data.
- **Artifact** – Non-neural event (blink, motion, jaw clench) automatically filtered during preprocessing to protect band-power integrity.

## Core Indices
- **Alertness Score** – Beta-band dominated metric reflecting locus coeruleus activation. Defined in `algorithm/neuro-PRD.md` and implemented via `LRICalculator.calculate_alertness`.
- **Focus Score** – Frontal theta measure linked to nucleus basalis engagement. Defined alongside the alertness score.
- **Arousal Balance** – Theta/beta and beta/alpha ratio composite enforcing an inverted-U activation window.
- **Learning Readiness Index (LRI)** – Weighted combination of Alertness (0.4), Focus (0.4), Arousal Balance (0.2) with optional post-exercise multiplier (Huberman window). See `app/IMPLEMENTATION-PLAN.md` §2.3.
- **Optimal Window** – Consecutive windows with LRI ≥70, classified as `excellent`, `very_good`, `good`, or `moderate` depending on mean LRI (see Session Analyzer spec).
- **Session Score** – Single-session quality score: 40% average LRI, 30% optimal window utilization, 20% post-exercise bonus, 10% sleep bonus (Implementation Plan §2.4).
- **Brain Score (MVP)** – Daily composite: 55% neural state (best session score + optimal utilization), 25% consolidation (Neuroplasticity Sleep Score), 20% behavior alignment (post-exercise window usage and habits). Detailed in `shared/brain-score-proposal.md`.

## Sleep Metrics
- **Duration Score** – Targets 7–9 hours for full consolidation cycles.
- **Efficiency Score** – Percent of time in bed spent asleep; ≥85% is optimal.
- **WASO / SOL** – Wake After Sleep Onset and Sleep Onset Latency penalties measuring fragmentation.
- **Consistency Score** – Standard deviation of bedtimes over 7 days (<30 min preferred).
- **HRV Sleep Score** – Average RMSSD/SDNN during sleep indicating parasympathetic recovery.
- **Respiratory Rate & Deep Sleep Percent** – Supplemental metrics for evaluating restorative physiology.

Use this glossary when creating new documentation to avoid diverging terminology. When additional concepts are introduced, add them here and link from layer-specific docs instead of duplicating definitions.

