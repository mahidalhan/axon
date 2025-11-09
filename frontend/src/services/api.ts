import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// For mobile, we need to use the tunnel URL with /api path
// For web preview, /api works directly
const getBackendURL = () => {
  const expoUrl = Constants.expoConfig?.hostUri;
  
  // If running on mobile via Expo Go, use the tunnel URL
  if (expoUrl && Platform.OS !== 'web') {
    // Use http instead of https for Expo tunnel
    return `http://${expoUrl}/api`;
  }
  
  // For web or fallback
  return process.env.EXPO_PUBLIC_BACKEND_URL || '/api';
};

const BACKEND_URL = getBackendURL();

console.log('Backend URL:', BACKEND_URL);

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
