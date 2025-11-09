"""Learning Readiness Index calculator for Muse windows."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

import numpy as np


@dataclass
class LRICalculator:
    optimal_beta_alpha_ratio: float = 1.5

    def calculate(self, features: Dict[str, float], post_exercise_multiplier: float = 1.0) -> Dict[str, float]:
        alertness = self._calculate_alertness(features)
        focus = self._calculate_focus(features)
        arousal = self._calculate_arousal(features)

        base_lri = 0.4 * alertness + 0.4 * focus + 0.2 * arousal
        lri = base_lri * post_exercise_multiplier

        return {
            "lri": float(np.clip(lri, 0, 100)),
            "base_lri": float(np.clip(base_lri, 0, 100)),
            "alertness": float(alertness),
            "focus": float(focus),
            "arousal_balance": float(arousal),
        }

    def _calculate_alertness(self, features: Dict[str, float]) -> float:
        beta_values = [features.get(col, 0.0) for col in ["beta_tp9", "beta_af7", "beta_af8", "beta_tp10"]]
        theta_values = [features.get(col, 0.0) for col in ["theta_tp9", "theta_af7", "theta_af8", "theta_tp10"]]
        alpha_values = [features.get(col, 0.0) for col in ["alpha_tp9", "alpha_af7", "alpha_af8", "alpha_tp10"]]

        beta_avg = np.mean(beta_values)
        theta_avg = np.mean(theta_values)
        alpha_avg = np.mean(alpha_values)

        beta_score = self._normalize(beta_avg, 0.1, 2.0)
        theta_beta_ratio = theta_avg / (beta_avg + 1e-6)
        theta_beta_score = 100 - self._normalize(theta_beta_ratio, 0.5, 2.0)
        alpha_suppression_score = 100 - self._normalize(alpha_avg, 0.2, 1.5)

        return np.clip(
            0.4 * beta_score + 0.3 * theta_beta_score + 0.3 * alpha_suppression_score,
            0,
            100,
        )

    def _calculate_focus(self, features: Dict[str, float]) -> float:
        theta_values = [features.get(col, 0.0) for col in ["theta_af7", "theta_af8"]]
        alpha_values = [features.get(col, 0.0) for col in ["alpha_af7", "alpha_af8"]]
        gamma_values = [features.get(col, 0.0) for col in ["gamma_af7", "gamma_af8"]]

        theta_score = self._normalize(np.mean(theta_values), 0.3, 1.5)
        alpha_mod_score = self._normalize(np.mean(alpha_values), 0.2, 1.2)
        gamma_score = self._normalize(np.mean(gamma_values), 0.05, 0.3)

        return np.clip(
            0.5 * theta_score + 0.3 * alpha_mod_score + 0.2 * gamma_score,
            0,
            100,
        )

    def _calculate_arousal(self, features: Dict[str, float]) -> float:
        beta_avg = np.mean([features.get(col, 0.0) for col in ["beta_tp9", "beta_af7", "beta_af8", "beta_tp10"]])
        alpha_avg = np.mean([features.get(col, 0.0) for col in ["alpha_tp9", "alpha_af7", "alpha_af8", "alpha_tp10"]])

        ratio = beta_avg / (alpha_avg + 1e-6)
        deviation = abs(ratio - self.optimal_beta_alpha_ratio)
        return float(100 * np.exp(-0.5 * (deviation / 0.5) ** 2))

    @staticmethod
    def _normalize(value: float, min_val: float, max_val: float) -> float:
        norm = (value - min_val) / (max_val - min_val)
        return float(np.clip(norm * 100, 0, 100))

