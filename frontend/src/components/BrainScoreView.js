import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './BrainScoreView.css';

function BrainScoreView() {
  const [brainScore, setBrainScore] = useState(null);
  const [dnosHistory, setDnosHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [score, history] = await Promise.all([
        api.getCurrentBrainScore(),
        api.getDNOSHistory(28)
      ]);
      setBrainScore(score);
      setDnosHistory(history.history);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching brain score:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading Brain Score...</div>;
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#00FF88';
    if (score >= 70) return '#4CAF50';
    if (score >= 50) return '#FFD700';
    return '#FF4444';
  };

  const chartData = dnosHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dnos: item.dnos
  }));

  return (
    <div className="brain-score-view">
      {/* Hero Score Card */}
      <div className="card brain-score-hero" data-testid="brain-score-hero">
        <h1 className="card-title">28-Day Brain Score</h1>
        <div className="brain-score-display">
          <span className="brain-score-value" style={{ color: getScoreColor(brainScore?.brain_score || 0) }}>
            {Math.round(brainScore?.brain_score || 0)}
          </span>
          <span className="brain-score-max">/100</span>
        </div>
        <div className="brain-score-interpretation" style={{ color: getScoreColor(brainScore?.brain_score || 0) }}>
          {brainScore?.interpretation || 'No Data'}
        </div>
        <div className="brain-score-period">
          {brainScore?.period?.start} to {brainScore?.period?.end}
        </div>
      </div>

      {/* Components Breakdown */}
      <div className="card components-card">
        <h2 className="card-title">Component Breakdown</h2>
        <div className="components-grid">
          <div className="component-item">
            <div className="component-icon">🔄</div>
            <div className="component-content">
              <div className="component-name">Cycle Completion</div>
              <div className="component-score" style={{ color: getScoreColor(brainScore?.components?.cycle_completion?.score || 0) }}>
                {Math.round(brainScore?.components?.cycle_completion?.score || 0)}/100
              </div>
              <div className="component-detail">
                {brainScore?.components?.cycle_completion?.complete_cycles || 0} complete cycles
              </div>
            </div>
          </div>

          <div className="component-item">
            <div className="component-icon">🧠</div>
            <div className="component-content">
              <div className="component-name">Baseline Capacity</div>
              <div className="component-score" style={{ color: getScoreColor(brainScore?.components?.baseline_capacity?.score || 0) }}>
                {Math.round(brainScore?.components?.baseline_capacity?.score || 0)}/100
              </div>
              <div className="component-detail">
                Morning LRI avg: {brainScore?.components?.baseline_capacity?.morning_lri_avg?.toFixed(1) || 0}
              </div>
            </div>
          </div>

          <div className="component-item">
            <div className="component-icon">📈</div>
            <div className="component-content">
              <div className="component-name">Efficiency Trend</div>
              <div className="component-score" style={{ color: getScoreColor(brainScore?.components?.efficiency_trend?.score || 0) }}>
                {Math.round(brainScore?.components?.efficiency_trend?.score || 0)}/100
              </div>
              <div className="component-detail">
                {brainScore?.components?.efficiency_trend?.improvement_pct >= 0 ? '↑' : '↓'}
                {Math.abs(brainScore?.components?.efficiency_trend?.improvement_pct || 0).toFixed(1)}% change
              </div>
            </div>
          </div>

          <div className="component-item">
            <div className="component-icon">⚡</div>
            <div className="component-content">
              <div className="component-name">Vagus Health</div>
              <div className="component-score" style={{ color: getScoreColor(brainScore?.components?.vagus_health?.score || 0) }}>
                {Math.round(brainScore?.components?.vagus_health?.score || 0)}/100
              </div>
              <div className="component-detail">
                {brainScore?.components?.vagus_health?.exercise_days || 0} exercise days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 28-Day Trend Chart */}
      <div className="card chart-card">
        <h2 className="card-title">28-Day DNOS Trend</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
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
                strokeWidth={3}
                dot={{ fill: '#00FF88', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card recommendations-card">
        <h2 className="card-title">Recommendations</h2>
        <div className="recommendations-box">
          {brainScore?.recommendations && brainScore.recommendations.length > 0 ? (
            brainScore.recommendations.map((rec, idx) => (
              <div key={idx} className="recommendation-item">• {rec}</div>
            ))
          ) : (
            <div className="recommendation-item">No recommendations available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrainScoreView;
