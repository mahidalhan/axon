import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DailySummary.css';

function DailySummary() {
  const [dnosData, setDnosData] = useState(null);
  const [dnosHistory, setDnosHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [today, history] = await Promise.all([
        api.getTodayDNOS(),
        api.getDNOSHistory(7)
      ]);
      setDnosData(today);
      setDnosHistory(history.history);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching DNOS data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading daily summary...</div>;
  }

  const getScoreColor = (score) => {
    if (score >= 70) return '#00FF88';
    if (score >= 40) return '#FFD700';
    return '#FF4444';
  };

  const chartData = dnosHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    dnos: item.dnos,
    avgLri: item.avg_lri
  }));

  return (
    <div className="daily-summary">
      {/* DNOS Hero Card */}
      <div className="card dnos-hero-card" data-testid="daily-dnos-card">
        <h1 className="card-title">Daily Neuroplasticity Score</h1>
        <div className="date-display">{dnosData?.date || 'Today'}</div>
        <div className="dnos-hero-score">
          <span className="dnos-hero-value" style={{ color: getScoreColor(dnosData?.dnos || 0) }}>
            {Math.round(dnosData?.dnos || 0)}
          </span>
          <span className="dnos-hero-max">/100</span>
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="card components-breakdown-card">
        <h2 className="card-title">Component Breakdown</h2>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-icon">🎯</div>
            <div className="breakdown-content">
              <div className="breakdown-label">Average LRI</div>
              <div className="breakdown-value" style={{ color: getScoreColor(dnosData?.components?.avg_lri || 0) }}>
                {Math.round(dnosData?.components?.avg_lri || 0)}/100
              </div>
              <div className="breakdown-description">Daily learning readiness</div>
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-icon">📊</div>
            <div className="breakdown-content">
              <div className="breakdown-label">Window Utilization</div>
              <div className="breakdown-value" style={{ color: getScoreColor(dnosData?.components?.optimal_window_utilization || 0) }}>
                {Math.round(dnosData?.components?.optimal_window_utilization || 0)}%
              </div>
              <div className="breakdown-description">Post-exercise window capture</div>
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-icon">💤</div>
            <div className="breakdown-content">
              <div className="breakdown-label">Sleep Consolidation</div>
              <div className="breakdown-value" style={{ color: getScoreColor(dnosData?.components?.sleep_consolidation || 0) }}>
                {Math.round(dnosData?.components?.sleep_consolidation || 0)}/100
              </div>
              <div className="breakdown-description">Previous night quality</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Details */}
      {dnosData?.sleep_details && (
        <div className="card sleep-details-card">
          <h2 className="card-title">Sleep Details</h2>
          <div className="sleep-metrics">
            <div className="sleep-metric">
              <div className="sleep-metric-label">Sleep Score</div>
              <div className="sleep-metric-value" style={{ color: getScoreColor(dnosData.sleep_details.sleep_score) }}>
                {Math.round(dnosData.sleep_details.sleep_score)}/100
              </div>
            </div>
            <div className="sleep-metric">
              <div className="sleep-metric-label">Deep Sleep</div>
              <div className="sleep-metric-value">
                {dnosData.sleep_details.deep_sleep_pct?.toFixed(1)}%
              </div>
            </div>
            <div className="sleep-metric">
              <div className="sleep-metric-label">REM Sleep</div>
              <div className="sleep-metric-value">
                {dnosData.sleep_details.rem_pct?.toFixed(1)}%
              </div>
            </div>
            <div className="sleep-metric">
              <div className="sleep-metric-label">Efficiency</div>
              <div className="sleep-metric-value">
                {dnosData.sleep_details.efficiency?.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Trend */}
      <div className="card trend-card">
        <h2 className="card-title">7-Day Trend</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis 
                dataKey="date" 
                stroke="#AAAAAA"
                tick={{ fill: '#AAAAAA', fontSize: 12 }}
              />
              <YAxis 
                stroke="#AAAAAA"
                tick={{ fill: '#AAAAAA', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="dnos" 
                stroke="#00FF88" 
                strokeWidth={2}
                name="DNOS"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      {dnosData?.insights && dnosData.insights.length > 0 && (
        <div className="card insights-card">
          <h2 className="card-title">Insights</h2>
          <div className="insights-box">
            {dnosData.insights.map((insight, idx) => (
              <div key={idx} className="insight-item">• {insight}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DailySummary;
