import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { mockData } from './mockData';

// Backend URL configuration
const getBackendURL = () => {
  const tunnelHost = Constants.expoConfig?.hostUri;
  
  if (tunnelHost) {
    console.log('[API] Using tunnel:', `https://${tunnelHost}`);
    return `https://${tunnelHost}`;
  }
  
  return '';
};

const BACKEND_URL = getBackendURL();
const USE_MOCK_DATA = true; // Set to false when deployed with proper backend access

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to return mock data when backend isn't accessible
const withFallback = async <T,>(apiCall: () => Promise<T>, mockFallback: T): Promise<T> => {
  if (USE_MOCK_DATA) {
    console.log('[API] Using mock data');
    return Promise.resolve(mockFallback);
  }
  
  try {
    return await apiCall();
  } catch (error) {
    console.log('[API] Falling back to mock data due to error:', error);
    return mockFallback;
  }
};

export const api = {
  // Session endpoints
  analyzeSession: async (participantId: number = 0, maxHours: number = 1.0) => {
    return withFallback(
      async () => {
        const response = await apiClient.post('/api/session/analyze', {
          participant_id: participantId,
          max_hours: maxHours,
        });
        return response.data;
      },
      mockData.sessionAnalysis
    );
  },

  getSessionContext: async (participantId: number = 0) => {
    return withFallback(
      async () => {
        const response = await apiClient.get(`/api/session/context?participant_id=${participantId}`);
        return response.data;
      },
      {
        participant_id: participantId,
        session_time: {
          start: "2025-11-09T09:15:00",
          end: "2025-11-09T09:55:00",
          duration_minutes: 40
        },
        context: {
          post_exercise_hours: 2.0,
          workout_type: "Running",
          circadian_phase: "morning_peak",
          optimal_window: true
        },
        performance: {
          peak_moments: 3,
          flow_minutes: 24.0,
          peak_lri: 84.3
        }
      }
    );
  },

  getDailyTimeline: async (participantId: number = 0) => {
    return withFallback(
      async () => {
        const response = await apiClient.get(`/api/session/daily-timeline?participant_id=${participantId}`);
        return response.data;
      },
      mockData.dailyTimeline || {}
    );
  },

  getOptimalWindowStatus: async (participantId: number = 0) => {
    return withFallback(
      async () => {
        const response = await apiClient.get(`/session/optimal-window-status?participant_id=${participantId}`);
        return response.data;
      },
      mockData.optimalWindow
    );
  },

  getTodaySummary: async (participantId: number = 0) => {
    return withFallback(
      async () => {
        const response = await apiClient.get(`/session/today-summary?participant_id=${participantId}`);
        return response.data;
      },
      mockData.todaySummary
    );
  },

  getCurrentMetrics: async (participantId: number = 0) => {
    return withFallback(
      async () => {
        const response = await apiClient.get(`/session/current-metrics?participant_id=${participantId}`);
        return response.data;
      },
      mockData.currentMetrics
    );
  },

  getBrainScoreToday: async (participantId: number = 0) => {
    return withFallback(
      async () => {
        const response = await apiClient.get(`/brain-score/today?participant_id=${participantId}`);
        return response.data;
      },
      mockData.brainScore
    );
  },

  // Sleep endpoints
  getSleepLast20: async () => {
    return withFallback(
      async () => {
        const response = await apiClient.get('/sleep/last20');
        return response.data;
      },
      mockData.sleepData
    );
  },

  getSleepRecent: async (days: number = 7) => {
    return withFallback(
      async () => {
        const response = await apiClient.get(`/sleep/recent?days=${days}`);
        return response.data;
      },
      { sleep_records: mockData.sleepData }
    );
  },

  // Workout endpoints
  getWorkoutsLast20: async () => {
    return withFallback(
      async () => {
        const response = await apiClient.get('/workouts/last20');
        return response.data;
      },
      mockData.workoutData
    );
  },

  getWorkoutsRecent: async (days: number = 7) => {
    return withFallback(
      async () => {
        const response = await apiClient.get(`/workouts/recent?days=${days}`);
        return response.data;
      },
      mockData.workoutData
    );
  },

  // Health check
  healthCheck: async () => {
    return withFallback(
      async () => {
        const response = await apiClient.get('/health');
        return response.data;
      },
      { status: 'healthy (mock)', timestamp: new Date().toISOString() }
    );
  },
};

export default apiClient;
