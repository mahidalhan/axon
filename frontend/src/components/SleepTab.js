import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './SleepTab.css';

function SleepTab() {
  const [sleepRecords, setSleepRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.getRecentSleep(7);
      setSleepRecords(response.records);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading sleep data...</div>;
  }

  const latestSleep = sleepRecords[sleepRecords.length - 1] || {};

  const getScoreColor = (score) => {
    if (score >= 80) return '#00FF88';
    if (score >= 60) return '#FFD700';
    return '#FF4444';
  };

  const chartData = sleepRecords.map(record => ({
    date: new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }),
    deep: record.deep_sleep_pct,
    rem: record.rem_pct,
    efficiency: record.efficiency
  }));

  return (
    <div className="sleep-tab">
      {/* Latest Sleep Score */}
      <div className="card sleep-score-card" data-testid="sleep-score-card">
        <h1 className="card-title">Sleep Consolidation Score</h1>
        <div className="sleep-score-display">
          <span className="sleep-score-value" style={{ color: getScoreColor(latestSleep.sleep_score || 0) }}>
            {Math.round(latestSleep.sleep_score || 0)}
          </span>
          <span className="sleep-score-max">/100</span>
        </div>
        <div className="sleep-date">
          {latestSleep.date ? new Date(latestSleep.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'No data'}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="card sleep-metrics-card">
        <h2 className="card-title">Key Metrics</h2>
        <div className="sleep-metrics-grid">
          <div className="metric-box">
            <div className="metric-icon">🛌</div>
            <div className="metric-content">
              <div className="metric-label">Total Sleep</div>
              <div className="metric-value">
                {((latestSleep.total_sleep_min || 0) / 60).toFixed(1)}h
              </div>
              <div className="metric-subtext">
                {Math.round(latestSleep.total_sleep_min || 0)} minutes
              </div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon">💤</div>
            <div className="metric-content">
              <div className="metric-label">Deep Sleep</div>
              <div className="metric-value" style={{ 
                color: (latestSleep.deep_sleep_pct >= 20 && latestSleep.deep_sleep_pct <= 25) ? '#00FF88' : '#FFD700' 
              }}>
                {latestSleep.deep_sleep_pct?.toFixed(1)}%
              </div>
              <div className="metric-subtext">
                {Math.round(latestSleep.deep_sleep_min || 0)} min
              </div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon">🧠</div>
            <div className="metric-content">
              <div className="metric-label">REM Sleep</div>
              <div className="metric-value" style={{ 
                color: (latestSleep.rem_pct >= 18 && latestSleep.rem_pct <= 25) ? '#00FF88' : '#FFD700' 
              }}>
                {latestSleep.rem_pct?.toFixed(1)}%
              </div>
              <div className="metric-subtext">
                {Math.round(latestSleep.rem_min || 0)} min
              </div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon">⚡</div>
            <div className="metric-content">
              <div className="metric-label">Efficiency</div>
              <div className="metric-value" style={{ 
                color: latestSleep.efficiency >= 85 ? '#00FF88' : '#FFD700' 
              }}>
                {latestSleep.efficiency?.toFixed(0)}%
              </div>
              <div className="metric-subtext">
                Sleep quality
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="card sleep-trend-card">
        <h2 className="card-title">7-Day Sleep Stages</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis 
                dataKey="date" 
                stroke="#AAAAAA"
                tick={{ fill: '#AAAAAA', fontSize: 12 }}
              />
              <YAxis 
                stroke="#AAAAAA"
                tick={{ fill: '#AAAAAA', fontSize: 12 }}
                label={{ value: 'Percentage', angle: -90, position: 'insideLeft', fill: '#AAAAAA' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
              />
              <Legend wrapperStyle={{ color: '#AAAAAA' }} />
              <Bar dataKey="deep" fill="#4A90E2" name="Deep Sleep %" />
              <Bar dataKey="rem" fill="#9B59B6" name="REM %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep Insights */}
      <div className="card sleep-insights-card">
        <h2 className="card-title">Sleep Quality Insights</h2>
        <div className="insights-box">
          {latestSleep.deep_sleep_pct >= 20 && latestSleep.deep_sleep_pct <= 25 && (
            <div className="insight-item">✅ Deep sleep percentage is in optimal range (20-25%)</div>
          )}
          {latestSleep.deep_sleep_pct < 20 && (
            <div className="insight-item">⚠️ Deep sleep below target - consider earlier bedtime and cooler room temperature</div>
          )}
          {latestSleep.rem_pct >= 18 && latestSleep.rem_pct <= 25 && (
            <div className="insight-item">✅ REM sleep percentage is in optimal range (18-25%)</div>
          )}
          {latestSleep.rem_pct < 18 && (
            <div className="insight-item">⚠️ REM sleep below target - ensure consistent sleep schedule</div>
          )}
          {latestSleep.efficiency >= 85 && (
            <div className="insight-item">✅ Excellent sleep efficiency (>85%)</div>
          )}
          {latestSleep.efficiency < 85 && (
            <div className="insight-item">⚠️ Sleep efficiency could be improved - reduce time awake in bed</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SleepTab;
