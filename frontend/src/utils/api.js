const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const api = {
  // Demo data generation
  generateDemo: async () => {
    const response = await fetch(`${API_BASE}/api/demo/generate`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to generate demo data');
    return response.json();
  },

  // LRI endpoints
  getCurrentLRI: async () => {
    const response = await fetch(`${API_BASE}/api/lri/current`);
    if (!response.ok) throw new Error('Failed to fetch LRI');
    return response.json();
  },

  getRecentLRI: async (hours = 12) => {
    const response = await fetch(`${API_BASE}/api/lri/recent?hours=${hours}`);
    if (!response.ok) throw new Error('Failed to fetch recent LRI');
    return response.json();
  },

  // DNOS endpoints
  getTodayDNOS: async () => {
    const response = await fetch(`${API_BASE}/api/dnos/today`);
    if (!response.ok) throw new Error('Failed to fetch DNOS');
    return response.json();
  },

  getDNOSHistory: async (days = 7) => {
    const response = await fetch(`${API_BASE}/api/dnos/history?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch DNOS history');
    return response.json();
  },

  // Brain Score
  getCurrentBrainScore: async () => {
    const response = await fetch(`${API_BASE}/api/brain-score/current`);
    if (!response.ok) throw new Error('Failed to fetch Brain Score');
    return response.json();
  },

  // Sleep endpoints
  getRecentSleep: async (days = 7) => {
    const response = await fetch(`${API_BASE}/api/sleep/recent?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch sleep data');
    return response.json();
  },
};