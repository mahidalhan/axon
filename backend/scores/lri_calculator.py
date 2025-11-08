"""
Learning Readiness Index (LRI) Calculator.
Combines Alertness + Focus + Arousal Balance → 0-100 score.
"""

import numpy as np
from typing import Dict
from datetime import datetime


class LRICalculator:
    def __init__(self):
        self.optimal_beta_alpha_ratio = 1.5

    def calculate_alertness(self, band_power: Dict[str, float]) -> float:
        """
        Alertness Score (0-100) based on beta power and theta/beta ratio.
        High beta + low theta/beta ratio = high alertness.
        """
        beta_avg = np.mean([
            band_power.get('beta_tp9', 0),
            band_power.get('beta_af7', 0),
            band_power.get('beta_af8', 0),
            band_power.get('beta_tp10', 0)
        ])
        
        theta_avg = np.mean([
            band_power.get('theta_tp9', 0),
            band_power.get('theta_af7', 0),
            band_power.get('theta_af8', 0),
            band_power.get('theta_tp10', 0)
        ])
        
        alpha_avg = np.mean([
            band_power.get('alpha_tp9', 0),
            band_power.get('alpha_af7', 0),
            band_power.get('alpha_af8', 0),
            band_power.get('alpha_tp10', 0)
        ])

        # Component 1: Beta power
        beta_score = self._normalize(beta_avg, min_val=0.1, max_val=2.0)

        # Component 2: Inverse theta/beta ratio
        theta_beta_ratio = theta_avg / (beta_avg + 1e-6)
        theta_beta_score = 100 - self._normalize(theta_beta_ratio, min_val=0.5, max_val=2.0)

        # Component 3: Alpha suppression
        alpha_suppression_score = 100 - self._normalize(alpha_avg, min_val=0.2, max_val=1.5)

        # Weighted combination
        alertness = (0.4 * beta_score +
                    0.3 * theta_beta_score +
                    0.3 * alpha_suppression_score)

        return np.clip(alertness, 0, 100)

    def calculate_focus(self, band_power: Dict[str, float]) -> float:
        """
        Focus Score (0-100) based on frontal theta and alpha modulation.
        """
        frontal_theta = np.mean([
            band_power.get('theta_af7', 0),
            band_power.get('theta_af8', 0)
        ])
        
        frontal_alpha = np.mean([
            band_power.get('alpha_af7', 0),
            band_power.get('alpha_af8', 0)
        ])
        
        frontal_gamma = np.mean([
            band_power.get('gamma_af7', 0),
            band_power.get('gamma_af8', 0)
        ])

        # Component scores
        theta_score = self._normalize(frontal_theta, min_val=0.3, max_val=1.5)
        alpha_mod_score = self._normalize(frontal_alpha, min_val=0.2, max_val=1.2)
        gamma_score = self._normalize(frontal_gamma, min_val=0.05, max_val=0.3)

        # Weighted combination
        focus = (0.5 * theta_score +
                0.3 * alpha_mod_score +
                0.2 * gamma_score)

        return np.clip(focus, 0, 100)

    def calculate_arousal_balance(self, band_power: Dict[str, float]) -> float:
        """
        Arousal Balance (0-100) using Yerkes-Dodson inverted-U function.
        """
        beta_avg = np.mean([
            band_power.get('beta_tp9', 0),
            band_power.get('beta_af7', 0),
            band_power.get('beta_af8', 0),
            band_power.get('beta_tp10', 0)
        ])
        
        alpha_avg = np.mean([
            band_power.get('alpha_tp9', 0),
            band_power.get('alpha_af7', 0),
            band_power.get('alpha_af8', 0),
            band_power.get('alpha_tp10', 0)
        ])

        beta_alpha_ratio = beta_avg / (alpha_avg + 1e-6)

        # Gaussian curve centered at optimal ratio
        deviation = abs(beta_alpha_ratio - self.optimal_beta_alpha_ratio)
        score = 100 * np.exp(-0.5 * (deviation / 0.5)**2)

        return np.clip(score, 0, 100)

    def calculate_lri(self, band_power: Dict[str, float],
                     post_exercise_multiplier: float = 1.0) -> Dict:
        """
        Calculate Learning Readiness Index (LRI).
        """
        alertness = self.calculate_alertness(band_power)
        focus = self.calculate_focus(band_power)
        arousal = self.calculate_arousal_balance(band_power)

        # Weighted LRI
        base_lri = (0.4 * alertness +
                   0.4 * focus +
                   0.2 * arousal)

        # Apply post-exercise multiplier
        lri = base_lri * post_exercise_multiplier

        return {
            'lri': float(np.clip(lri, 0, 100)),
            'alertness': float(alertness),
            'focus': float(focus),
            'arousal_balance': float(arousal),
            'status': self._get_status(lri)
        }

    def _get_status(self, lri: float) -> str:
        """Classify LRI into status categories."""
        if lri >= 70:
            return 'optimal'
        elif lri >= 40:
            return 'moderate'
        else:
            return 'low'

    def _normalize(self, value: float, min_val: float, max_val: float) -> float:
        """Normalize value to 0-100 scale."""
        normalized = ((value - min_val) / (max_val - min_val)) * 100
        return np.clip(normalized, 0, 100)
