import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Backend URL configuration
const getBackendURL = () => {
  // Get the tunnel host (e.g., "ixgw1ds-anonymous-3000.exp.direct")
  const tunnelHost = Constants.expoConfig?.hostUri;
  
  if (tunnelHost) {
    // Use HTTPS with the same tunnel host - Kubernetes ingress will proxy /api/* to port 8001
    console.log('[API] Using tunnel backend:', `https://${tunnelHost}`);
    return `https://${tunnelHost}`;
  }
  
  // Fallback
  return '';
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
