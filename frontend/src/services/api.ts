import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Backend URL configuration
// The tunnel URL points to the frontend, but we need backend on port 8001
// We'll construct the backend URL from the tunnel host
const getBackendURL = () => {
  // Get the tunnel host (e.g., "ixgw1ds-anonymous-3000.exp.direct")
  const tunnelHost = Constants.expoConfig?.hostUri;
  
  if (tunnelHost) {
    // Replace port 3000 with 8001 for backend, and add /api prefix
    // Format: http://ixgw1ds-anonymous-8001.exp.direct/api
    const backendHost = tunnelHost.replace('-3000.exp.direct', '-8001.exp.direct');
    console.log('[API] Using tunnel backend:', `http://${backendHost}/api`);
    return `http://${backendHost}/api`;
  }
  
  // Fallback for web or local dev
  console.log('[API] Using fallback backend:', '/api');
  return '/api';
};

const BACKEND_URL = getBackendURL();

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Session endpoints
  analyzeSession: async (participantId: number = 0, maxHours: number = 1.0) => {
    const response = await apiClient.post('/session/analyze', {
      participant_id: participantId,
      max_hours: maxHours,
    });
    return response.data;
  },

  getOptimalWindowStatus: async (participantId: number = 0) => {
    const response = await apiClient.get(`/session/optimal-window-status?participant_id=${participantId}`);
    return response.data;
  },

  getTodaySummary: async (participantId: number = 0) => {
    const response = await apiClient.get(`/session/today-summary?participant_id=${participantId}`);
    return response.data;
  },

  getCurrentMetrics: async (participantId: number = 0) => {
    const response = await apiClient.get(`/session/current-metrics?participant_id=${participantId}`);
    return response.data;
  },

  getBrainScoreToday: async (participantId: number = 0) => {
    const response = await apiClient.get(`/brain-score/today?participant_id=${participantId}`);
    return response.data;
  },

  // Sleep endpoints
  getSleepLast20: async () => {
    const response = await apiClient.get('/sleep/last20');
    return response.data;
  },

  getSleepRecent: async (days: number = 7) => {
    const response = await apiClient.get(`/sleep/recent?days=${days}`);
    return response.data;
  },

  // Workout endpoints
  getWorkoutsLast20: async () => {
    const response = await apiClient.get('/workouts/last20');
    return response.data;
  },

  getWorkoutsRecent: async (days: number = 7) => {
    const response = await apiClient.get(`/workouts/recent?days=${days}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
