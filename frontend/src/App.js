import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './utils/api';
import HomeDashboard from './components/HomeDashboard';
import BrainScoreView from './components/BrainScoreView';
import DailySummary from './components/DailySummary';
import SleepTab from './components/SleepTab';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkDataAvailability();
  }, []);

  const checkDataAvailability = async () => {
    try {
      await api.getCurrentLRI();
      setHasData(true);
      setIsLoading(false);
    } catch (err) {
      setHasData(false);
      setIsLoading(false);
    }
  };

  const handleGenerateDemo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.generateDemo();
      setHasData(true);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to generate demo data. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <h2>Loading Brain Score...</h2>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="app welcome-screen">
        <div className="welcome-content">
          <h1>🧠 Brain Score</h1>
          <p className="welcome-subtitle">Neuroplasticity Optimization System</p>
          <div className="welcome-description">
            <p>Track your learning readiness, sleep consolidation, and neuroplasticity health with real-time EEG-based metrics.</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button onClick={handleGenerateDemo} className="generate-demo-btn" data-testid="generate-demo-btn">
            Generate 28-Day Demo Data
          </button>
          <p className="demo-note">This will create synthetic data to explore all features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🧠 Brain Score</h1>
        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
            data-testid="home-tab"
          >
            Home
          </button>
          <button
            className={`nav-btn ${activeTab === 'brain-score' ? 'active' : ''}`}
            onClick={() => setActiveTab('brain-score')}
            data-testid="brain-score-tab"
          >
            Brain Score
          </button>
          <button
            className={`nav-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
            data-testid="daily-tab"
          >
            Daily Summary
          </button>
          <button
            className={`nav-btn ${activeTab === 'sleep' ? 'active' : ''}`}
            onClick={() => setActiveTab('sleep')}
            data-testid="sleep-tab"
          >
            Sleep
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'brain-score' && <BrainScoreView />}
        {activeTab === 'daily' && <DailySummary />}
        {activeTab === 'sleep' && <SleepTab />}
      </main>
    </div>
  );
}

export default App;
