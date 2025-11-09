import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '/api';

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
    const response = await apiClient.post('/api/session/analyze', {
      participant_id: participantId,
      max_hours: maxHours,
    });
    return response.data;
  },

  getOptimalWindowStatus: async (participantId: number = 0) => {
    const response = await apiClient.get(`/api/session/optimal-window-status?participant_id=${participantId}`);
    return response.data;
  },

  getTodaySummary: async (participantId: number = 0) => {
    const response = await apiClient.get(`/api/session/today-summary?participant_id=${participantId}`);
    return response.data;
  },

  getCurrentMetrics: async (participantId: number = 0) => {
    const response = await apiClient.get(`/api/session/current-metrics?participant_id=${participantId}`);
    return response.data;
  },

  getBrainScoreToday: async (participantId: number = 0) => {
    const response = await apiClient.get(`/api/brain-score/today?participant_id=${participantId}`);
    return response.data;
  },

  // Sleep endpoints
  getSleepLast20: async () => {
    const response = await apiClient.get('/api/sleep/last20');
    return response.data;
  },

  getSleepRecent: async (days: number = 7) => {
    const response = await apiClient.get(`/api/sleep/recent?days=${days}`);
    return response.data;
  },

  // Workout endpoints
  getWorkoutsLast20: async () => {
    const response = await apiClient.get('/api/workouts/last20');
    return response.data;
  },

  getWorkoutsRecent: async (days: number = 7) => {
    const response = await apiClient.get(`/api/workouts/recent?days=${days}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};

export default apiClient;
