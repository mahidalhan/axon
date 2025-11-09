// Mock data for demo when backend isn't accessible
export const mockData = {
  brainScore: {
    brain_score: 78.4,
    components: {
      learning_readiness: 82.0,
      consolidation: 74.0,
      behavior_alignment: 65.0,
    },
    session_details: {
      avg_lri: 46.8,
      optimal_utilization: 48.5,
      sleep_context: 74.0,
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
    session_duration_minutes: 40,
    peak_lri: 84.3,
    peak_timestamp: '2025-11-09T09:42:00Z',
    avg_lri: 72.5,
    median_lri: 74.0,
    std_dev: 6.2,
    optimal_windows: [
      {
        start: '2025-11-09T09:38:00Z',
        end: '2025-11-09T09:50:00Z',
        duration_minutes: 12,
        avg_lri: 82,
        quality: 'excellent',
      },
      {
        start: '2025-11-09T09:58:00Z',
        end: '2025-11-09T10:05:00Z',
        duration_minutes: 7,
        avg_lri: 76,
        quality: 'very_good',
      },
    ],
    time_in_state: {
      optimal_minutes: 24,
      moderate_minutes: 14,
      low_minutes: 2,
    },
    session_score: 78,
    component_scores: {
      alertness: 78,
      focus: 86,
      arousal_balance: 72,
    },
    insights: [
      'Peak occurred 15 min into session',
      'You maintained optimal state for 48% of session',
      'Post-exercise boost detected (1.3x multiplier)',
    ],
    recommendations: [
      'Schedule deep work at 9:15 AM daily',
      'Your optimal window appears 1-2h after morning workout',
    ],
    lri_timeline: [],
  },
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

  dailyTimeline: {
    date: '2025-11-09',
    user_schedule: {
      wake_time: 6.5,
      sleep_time: 22.0,
    },
    circadian_baseline: [
      30, 32, 35, 38, 42, 48, 55, 62, 68, 72, 75, 76,  // 6am-9am (morning rise)
      75, 74, 72, 70, 68, 65, 62, 58, 55, 52, 50, 48,  // 9am-12pm
      45, 43, 42, 40, 38, 37, 36, 35, 35, 36, 38, 40,  // 12pm-3pm (afternoon dip)
      42, 45, 48, 52, 56, 60, 63, 65, 67, 68, 68, 67,  // 3pm-6pm (recovery)
      65, 62, 58, 55, 52, 48, 45, 42, 38, 35, 32, 30,  // 6pm-9pm (wind down)
      28, 26, 24, 22, 20, 20, 20, 20, 20, 20, 20, 20,  // 9pm-12am (sleep prep)
      20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,  // 12am-3am (deep sleep)
      20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,  // 3am-6am (late sleep)
    ],
    measured_session: {
      start_hour: 9.25,  // 9:15 AM
      end_hour: 9.92,    // 9:55 AM
      lri_values: [
        { hour: 9.25, lri: 64 },
        { hour: 9.29, lri: 68 },
        { hour: 9.33, lri: 72 },
        { hour: 9.38, lri: 76 },
        { hour: 9.42, lri: 82 },
        { hour: 9.46, lri: 84 },
        { hour: 9.50, lri: 78 },
        { hour: 9.54, lri: 74 },
        { hour: 9.58, lri: 70 },
        { hour: 9.62, lri: 68 },
        { hour: 9.67, lri: 72 },
        { hour: 9.71, lri: 76 },
        { hour: 9.75, lri: 78 },
        { hour: 9.79, lri: 74 },
        { hour: 9.83, lri: 70 },
        { hour: 9.88, lri: 66 },
      ],
    },
    gamma_peaks: [
      { hour: 9.42, lri: 82, duration_min: 5 },
      { hour: 9.62, lri: 78, duration_min: 7.5 },
      { hour: 9.83, lri: 81, duration_min: 2.5 },
    ],
    events: [
      { hour: 6.5, type: 'wake', icon: '😴', label: 'Wake' },
      { hour: 7.25, type: 'workout', icon: '🏃', label: 'Run' },
    ],
  },
};
