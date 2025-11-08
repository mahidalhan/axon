import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './HomeDashboard.css';

function HomeDashboard() {
  const [lriData, setLriData] = useState(null);
  const [dnosData, setDnosData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [lri, dnos] = await Promise.all([
        api.getCurrentLRI(),
        api.getTodayDNOS()
      ]);
      setLriData(lri);
      setDnosData(dnos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return '#00FF88';
      case 'moderate': return '#FFD700';
      case 'low': return '#FF4444';
      default: return '#AAAAAA';
    }
  };

  const getLRIColor = (lri) => {
    if (lri >= 70) return '#00FF88';
    if (lri >= 40) return '#FFD700';
    return '#FF4444';
  };

  return (
    <div className="home-dashboard">
      {/* LRI Gauge Card */}
      <div className="card lri-card" data-testid="lri-card">
        <div className="lri-gauge-container">
          <svg viewBox="0 0 200 120" className="lri-gauge">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Colored arc based on LRI */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={getLRIColor(lriData?.lri || 0)}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${(lriData?.lri || 0) * 2.51} 251`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            {/* LRI Value */}
            <text x="100" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="36" fontWeight="bold" fontFamily="monospace">
              {Math.round(lriData?.lri || 0)}
            </text>
            <text x="100" y="100" textAnchor="middle" fill="#AAAAAA" fontSize="14">
              LRI Score
            </text>
          </svg>
          
          <div className="lri-status" style={{ color: getStatusColor(lriData?.status) }} data-testid="lri-status">
            {lriData?.status?.toUpperCase() || 'UNKNOWN'}
          </div>

          {lriData?.post_exercise_window && (
            <div className="post-exercise-banner" data-testid="post-exercise-banner">
              🔥 PEAK WINDOW: {Math.floor(lriData.window_remaining_minutes / 60)}h {lriData.window_remaining_minutes % 60}m remaining
            </div>
          )}
        </div>

        {/* Component Breakdown */}
        <div className="lri-components">
          <div className="component-bar">
            <div className="component-label">
              <span>Alertness</span>
              <span className="component-value">{Math.round(lriData?.components?.alertness || 0)}</span>
            </div>
            <div className="component-bar-fill" style={{ background: '#4A90E2' }}>
              <div 
                className="component-bar-value" 
                style={{ width: `${lriData?.components?.alertness || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="component-bar">
            <div className="component-label">
              <span>Focus</span>
              <span className="component-value">{Math.round(lriData?.components?.focus || 0)}</span>
            </div>
            <div className="component-bar-fill" style={{ background: '#9B59B6' }}>
              <div 
                className="component-bar-value" 
                style={{ width: `${lriData?.components?.focus || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="component-bar">
            <div className="component-label">
              <span>Arousal Balance</span>
              <span className="component-value">{Math.round(lriData?.components?.arousal_balance || 0)}</span>
            </div>
            <div className="component-bar-fill" style={{ background: '#E67E22' }}>
              <div 
                className="component-bar-value" 
                style={{ width: `${lriData?.components?.arousal_balance || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's DNOS Card */}
      <div className="card dnos-card" data-testid="dnos-card">
        <h2 className="card-title">Today's DNOS</h2>
        <div className="dnos-score-display">
          <span className="metric-value" style={{ color: getLRIColor(dnosData?.dnos || 0) }}>
            {Math.round(dnosData?.dnos || 0)}
          </span>
          <span className="metric-label">/100</span>
        </div>
        
        <div className="dnos-components">
          <div className="dnos-component-item">
            <span className="dnos-component-label">Avg LRI</span>
            <span className="dnos-component-value">{Math.round(dnosData?.components?.avg_lri || 0)}</span>
          </div>
          <div className="dnos-component-item">
            <span className="dnos-component-label">Window Utilization</span>
            <span className="dnos-component-value">{Math.round(dnosData?.components?.optimal_window_utilization || 0)}%</span>
          </div>
          <div className="dnos-component-item">
            <span className="dnos-component-label">Sleep Score</span>
            <span className="dnos-component-value">{Math.round(dnosData?.components?.sleep_consolidation || 0)}</span>
          </div>
        </div>

        {dnosData?.insights && dnosData.insights.length > 0 && (
          <div className="insights-box">
            {dnosData.insights.map((insight, idx) => (
              <div key={idx} className="insight-item">• {insight}</div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">💤</div>
          <div className="stat-content">
            <div className="stat-value">{dnosData?.sleep_details?.deep_sleep_pct?.toFixed(1) || 0}%</div>
            <div className="stat-label">Deep Sleep</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧠</div>
          <div className="stat-content">
            <div className="stat-value">{dnosData?.sleep_details?.rem_pct?.toFixed(1) || 0}%</div>
            <div className="stat-label">REM Sleep</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{dnosData?.sleep_details?.efficiency?.toFixed(0) || 0}%</div>
            <div className="stat-label">Sleep Efficiency</div>
          </div>
        </div>
      </div>

      <div className="refresh-note">
        <small>Auto-refreshing every 30 seconds</small>
      </div>
    </div>
  );
}

export default HomeDashboard;
