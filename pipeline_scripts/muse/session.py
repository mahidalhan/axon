"""Session analysis for Muse EEG windows."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from pipeline_scripts.muse.lri import LRICalculator


@dataclass
class SessionAnalyzer:
    lri_calculator: LRICalculator
    optimal_threshold: int = 70

    def analyse(self, windows_df: pd.DataFrame) -> Dict:
        if windows_df.empty:
            raise ValueError("Cannot analyse empty windows dataframe.")

        summary = self._compute_summary(windows_df)
        summary["optimal_windows"] = self._find_optimal_windows(windows_df)
        summary["time_in_state"] = self._compute_time_in_state(windows_df)
        summary["component_scores"] = self._component_scores(windows_df)
        summary["insights"] = self._generate_insights(summary)
        summary["recommendations"] = self._generate_recommendations(summary)
        return summary

    def _compute_summary(self, windows_df: pd.DataFrame) -> Dict:
        session_start = windows_df["window_start"].iloc[0]
        session_end = windows_df["window_end"].iloc[-1]
        duration_minutes = (session_end - session_start).total_seconds() / 60.0

        peak_idx = windows_df["lri"].idxmax()
        peak_row = windows_df.loc[peak_idx]

        return {
            "session_start": session_start.isoformat(),
            "session_end": session_end.isoformat(),
            "session_duration_minutes": round(duration_minutes, 2),
            "peak_lri": float(peak_row["lri"]),
            "peak_timestamp": peak_row["window_start"].isoformat(),
            "avg_lri": float(windows_df["lri"].mean()),
            "median_lri": float(windows_df["lri"].median()),
            "std_dev": float(windows_df["lri"].std(ddof=0)),
            "session_score": float(self._session_score(windows_df)),
        }

    def _find_optimal_windows(self, windows_df: pd.DataFrame) -> List[Dict]:
        optimal_windows: List[Dict] = []
        current_window: Optional[Dict] = None

        for _, row in windows_df.iterrows():
            if row["lri"] >= self.optimal_threshold:
                if current_window is None:
                    current_window = {
                        "start": row["window_start"],
                        "samples": [row],
                    }
                else:
                    current_window["samples"].append(row)
            else:
                if current_window:
                    optimal_windows.append(self._close_window(current_window))
                    current_window = None

        if current_window:
            optimal_windows.append(self._close_window(current_window))

        return optimal_windows

    def _close_window(self, window: Dict) -> Dict:
        samples = window["samples"]
        start_time = samples[0]["window_start"]
        end_time = samples[-1]["window_end"]
        # Use actual timestamps to compute duration to avoid double-counting overlap
        duration_minutes = (end_time - start_time).total_seconds() / 60.0
        avg_lri = np.mean([row["lri"] for row in samples])
        quality = self._classify_quality(avg_lri)

        return {
            "start": start_time.isoformat(),
            "end": end_time.isoformat(),
            "duration_minutes": round(duration_minutes, 2),
            "avg_lri": round(avg_lri, 2),
            "quality": quality,
        }

    @staticmethod
    def _classify_quality(avg_lri: float) -> str:
        if avg_lri >= 85:
            return "excellent"
        if avg_lri >= 75:
            return "very_good"
        if avg_lri >= 70:
            return "good"
        return "moderate"

    def _compute_time_in_state(self, windows_df: pd.DataFrame) -> Dict:
        """
        Compute time in state using union of window intervals per state.
        This avoids double-counting due to window overlap.
        """
        def _intervals_for_mask(mask: pd.Series) -> List:
            rows = windows_df.loc[mask, ["window_start", "window_end"]].itertuples(index=False)
            return [(r.window_start, r.window_end) for r in rows]

        def _sum_union_minutes(intervals: List) -> float:
            if not intervals:
                return 0.0
            # Sort by start time
            intervals = sorted(intervals, key=lambda iv: iv[0])
            merged = []
            cur_start, cur_end = intervals[0]
            for start, end in intervals[1:]:
                if start <= cur_end:
                    # Overlapping; extend
                    if end > cur_end:
                        cur_end = end
                else:
                    merged.append((cur_start, cur_end))
                    cur_start, cur_end = start, end
            merged.append((cur_start, cur_end))
            total_seconds = sum((end - start).total_seconds() for start, end in merged)
            return total_seconds / 60.0

        lri = windows_df["lri"]
        optimal_intervals = _intervals_for_mask(lri >= 70)
        moderate_intervals = _intervals_for_mask((lri >= 40) & (lri < 70))
        low_intervals = _intervals_for_mask(lri < 40)

        optimal_minutes = _sum_union_minutes(optimal_intervals)
        moderate_minutes = _sum_union_minutes(moderate_intervals)
        low_minutes = _sum_union_minutes(low_intervals)

        return {
            "optimal_minutes": round(optimal_minutes, 2),
            "moderate_minutes": round(moderate_minutes, 2),
            "low_minutes": round(low_minutes, 2),
        }

    def _component_scores(self, windows_df: pd.DataFrame) -> Dict:
        return {
            "alertness": float(windows_df["alertness"].mean()),
            "focus": float(windows_df["focus"].mean()),
            "arousal_balance": float(windows_df["arousal_balance"].mean()),
        }

    def _session_score(self, windows_df: pd.DataFrame) -> float:
        avg_lri = float(windows_df["lri"].mean())
        optimal_percentage = float(
            100 * (windows_df["lri"] >= self.optimal_threshold).mean()
        )

        # Sleep/post-exercise bonuses not applied in standalone pipeline.
        return round(
            0.40 * avg_lri + 0.30 * optimal_percentage,
            2,
        )

    def _generate_insights(self, summary: Dict) -> List[str]:
        insights = []
        peak_lri = summary["peak_lri"]
        optimal_windows = summary.get("optimal_windows", [])

        if peak_lri >= 80:
            insights.append("Peak learning readiness exceeded 80 (strong plasticity trigger).")
        else:
            insights.append("Consider exercise or focus drills to raise peak readiness.")

        if optimal_windows:
            total_optimal_minutes = sum(w["duration_minutes"] for w in optimal_windows)
            insights.append(f"Time in optimal state: {total_optimal_minutes:.1f} minutes.")
        else:
            insights.append("No sustained optimal windows detected in this session.")

        return insights

    def _generate_recommendations(self, summary: Dict) -> List[str]:
        recs = []
        optimal_windows = summary.get("optimal_windows", [])

        if optimal_windows:
            first_window = optimal_windows[0]
            recs.append(
                f"Schedule deep work around {first_window['start']} to align with your optimal window."
            )

        if summary["peak_lri"] < 70:
            recs.append("Experiment with high-intensity exercise 60–90 minutes before sessions.")

        return recs

