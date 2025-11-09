// Mock data for demo when backend isn't accessible
export const mockData = {
  brainScore: {
    brain_score: 78.4,
    components: {
      neural_state: 82.0,
      consolidation: 74.0,
      behavior_alignment: 76.0,
    },
    supporting_metrics: {
      best_session_id: 'sess_2025-11-09_morning',
      sleep_score: { value: 82, version: 'hrv_enabled' },
      workout_hits: 1,
    },
    insight: 'Schedule deep work in the 2h window after your morning run.',
  },

  todaySummary: {
    date: '2025-11-09',
    peak_lri: 84,
    peak_time: '09:15:00',
    optimal_minutes: 32,
    optimal_percentage: 45,
    session_score: 72,
    has_session_data: true,
  },

  optimalWindow: {
    has_window: true,
    window_start: '2025-11-09T09:15:00Z',
    window_end: '2025-11-09T09:45:00Z',
    quality: 'excellent',
    current_lri: 84,
  },

  currentMetrics: {
    alertness: 65,
    focus: 58,
    arousal_balance: 42,
    sparkline_data: {
      alertness: [60, 62, 65, 67, 66, 68, 70, 72, 71, 69, 67, 65, 63, 64, 66, 68, 67, 65, 64, 65],
      focus: [55, 56, 58, 60, 61, 59, 58, 60, 62, 61, 59, 57, 56, 58, 59, 60, 59, 58, 57, 58],
      arousal: [40, 41, 42, 43, 44, 43, 42, 41, 42, 43, 44, 43, 42, 41, 40, 41, 42, 43, 42, 42],
    },
  },

  sessionAnalysis: {
    session_duration_minutes: 40.2,
    peak_lri: 84.3,
    peak_timestamp: '2025-11-09T09:15:30',
    avg_lri: 46.8,
    median_lri: 45.2,
    std_dev: 12.3,
    optimal_windows: [
      {
        start: '09:15:00',
        end: '09:27:30',
        duration_minutes: 12.5,
        avg_lri: 76.2,
        quality: 'excellent',
      },
      {
        start: '09:35:00',
        end: '09:42:00',
        duration_minutes: 7.0,
        avg_lri: 72.5,
        quality: 'very_good',
      },
    ],
    time_in_state: {
      optimal_minutes: 19.5,
      moderate_minutes: 15.7,
      low_minutes: 5.0,
    },
    component_scores: {
      alertness: 65.3,
      focus: 58.2,
      arousal_balance: 42.1,
    },
    session_score: 72.3,
    insights: [
      'Peak occurred 15 min into session',
      'You maintained optimal state for 48% of session',
      'Post-exercise boost detected (1.3x)',
    ],
    recommendations: [
      'Schedule deep work at 9:15 AM daily',
      'Your optimal window appears 1-2h after morning workout',
    ],
    lri_timeline: Array.from({ length: 50 }, (_, i) => ({
      window_start: new Date(Date.now() + i * 60000).toISOString(),
      lri: 30 + Math.sin(i / 5) * 30 + Math.random() * 10,
    })),
  },

  sleepData: [
    {
      date: '2025-11-08',
      duration_hours: 7.5,
      sleep_efficiency: 88.0,
      sleep_score: 82,
      deep_sleep_percent: 17.3,
      hrv_rmssd_sleep: 58.3,
    },
    {
      date: '2025-11-07',
      duration_hours: 7.2,
      sleep_efficiency: 85.0,
      sleep_score: 78,
      deep_sleep_percent: 16.1,
      hrv_rmssd_sleep: 55.2,
    },
    {
      date: '2025-11-06',
      duration_hours: 8.0,
      sleep_efficiency: 90.0,
      sleep_score: 85,
      deep_sleep_percent: 18.5,
      hrv_rmssd_sleep: 62.1,
    },
  ],

  workoutData: [
    {
      workout_type: 'Running',
      start_time: '2025-11-08T07:30:00Z',
      duration_minutes: 32,
      is_high_intensity: true,
      avg_heart_rate: 148,
      max_heart_rate: 168,
    },
    {
      workout_type: 'Cycling',
      start_time: '2025-11-07T08:00:00Z',
      duration_minutes: 45,
      is_high_intensity: true,
      avg_heart_rate: 142,
      max_heart_rate: 162,
    },
    {
      workout_type: 'Walking',
      start_time: '2025-11-06T18:00:00Z',
      duration_minutes: 25,
      is_high_intensity: false,
      avg_heart_rate: 105,
      max_heart_rate: 120,
    },
  ],
};
