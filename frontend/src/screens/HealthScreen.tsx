import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

export default function HealthScreen() {
  const [loading, setLoading] = useState(true);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      const [sleepResponse, workouts] = await Promise.all([
        api.getSleepLast20(),
        api.getWorkoutsLast20(),
      ]);

      // Handle sleep data - API returns array directly or {sleep_records: [...]}
      const sleepArray = Array.isArray(sleepResponse) 
        ? sleepResponse 
        : sleepResponse?.sleep_records || [];
      
      const workoutsArray = Array.isArray(workouts) ? workouts : [];

      setSleepData(sleepArray.slice(0, 7)); // Show last 7 days
      setWorkoutData(workoutsArray.slice(0, 7));
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#84CC16';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Sleep Data */}
        <View style={styles.sectionHeader}>
          <Ionicons name="moon" size={24} color="#6366F1" />
          <Text style={styles.sectionTitle}>Sleep Records</Text>
        </View>

        {sleepData.length > 0 ? (
          sleepData.map((sleep, index) => (
            <Card key={index} style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <Text style={styles.healthDate}>
                  {new Date(sleep.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: getScoreColor(sleep.sleep_score) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.scoreText,
                      { color: getScoreColor(sleep.sleep_score) },
                    ]}
                  >
                    {sleep.sleep_score?.toFixed(0) || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.healthMetrics}>
                <View style={styles.healthMetric}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.metricText}>
                    {sleep.duration_hours?.toFixed(1) || 'N/A'}h
                  </Text>
                </View>
                <View style={styles.healthMetric}>
                  <Ionicons name="pulse-outline" size={16} color="#6B7280" />
                  <Text style={styles.metricText}>
                    {sleep.sleep_efficiency?.toFixed(0) || 'N/A'}% efficiency
                  </Text>
                </View>
                {sleep.deep_sleep_percent && (
                  <View style={styles.healthMetric}>
                    <Ionicons name="bed-outline" size={16} color="#6B7280" />
                    <Text style={styles.metricText}>
                      {sleep.deep_sleep_percent.toFixed(0)}% deep
                    </Text>
                  </View>
                )}
              </View>

              {sleep.hrv_rmssd_sleep && (
                <View style={styles.hrvContainer}>
                  <Text style={styles.hrvLabel}>HRV:</Text>
                  <Text style={styles.hrvValue}>{sleep.hrv_rmssd_sleep.toFixed(1)} ms</Text>
                </View>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>No sleep data available</Text>
          </Card>
        )}

        {/* Workout Data */}
        <View style={styles.sectionHeader}>
          <Ionicons name="fitness" size={24} color="#EF4444" />
          <Text style={styles.sectionTitle}>Workouts</Text>
        </View>

        {workoutData.length > 0 ? (
          workoutData.map((workout, index) => (
            <Card key={index} style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <View style={styles.workoutTypeContainer}>
                  <Ionicons
                    name={workout.is_high_intensity ? 'flame' : 'walk'}
                    size={20}
                    color={workout.is_high_intensity ? '#EF4444' : '#F59E0B'}
                  />
                  <Text style={styles.workoutType}>
                    {workout.workout_type?.replace('HKWorkoutActivityType', '') || 'Workout'}
                  </Text>
                </View>
                {workout.is_high_intensity && (
                  <View style={styles.intensityBadge}>
                    <Text style={styles.intensityText}>HIGH</Text>
                  </View>
                )}
              </View>

              <Text style={styles.workoutDate}>
                {new Date(workout.start_time).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>

              <View style={styles.healthMetrics}>
                <View style={styles.healthMetric}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.metricText}>
                    {workout.duration_minutes?.toFixed(0) || 'N/A'} min
                  </Text>
                </View>
                {workout.avg_heart_rate && (
                  <View style={styles.healthMetric}>
                    <Ionicons name="heart-outline" size={16} color="#6B7280" />
                    <Text style={styles.metricText}>
                      {workout.avg_heart_rate.toFixed(0)} bpm avg
                    </Text>
                  </View>
                )}
                {workout.max_heart_rate && (
                  <View style={styles.healthMetric}>
                    <Ionicons name="heart" size={16} color="#EF4444" />
                    <Text style={styles.metricText}>
                      {workout.max_heart_rate.toFixed(0)} bpm max
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.optimalWindowInfo}>
                <Ionicons name="information-circle-outline" size={16} color="#6366F1" />
                <Text style={styles.optimalWindowText}>
                  Optimal window: 1-4 hours post-workout
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>No workout data available</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  healthCard: {
    marginBottom: 12,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  healthMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  healthMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 14,
    color: '#6B7280',
  },
  hrvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  hrvLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  hrvValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  workoutTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  intensityBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  workoutDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  optimalWindowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  optimalWindowText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
