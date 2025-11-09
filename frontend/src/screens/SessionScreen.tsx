import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import Card from '../components/Card';
import SessionContextCard from '../components/SessionContextCard';
import DailyBrainStateChart from '../components/DailyBrainStateChart';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants/designTokens';
import { calculateCircadianBaseline, getCircadianPhase, timeStringToHour, formatHourTo12h } from '../utils/circadianCalculator';

export default function SessionScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [contextData, setContextData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any>(null);

  const loadData = async () => {
    try {
      // Use participant 5 (has higher peak around 65)
      const [session, context, timeline] = await Promise.all([
        api.analyzeSession(5, 1.0),
        api.getSessionContext(5),
        api.getDailyTimeline(5),
      ]);

      console.log('[SessionScreen] Timeline data:', {
        baselineLength: timeline?.circadian_baseline?.length,
        sessionData: timeline?.measured_session,
        gammaPeaks: timeline?.gamma_peaks?.length,
      });

      setSessionData(session);
      setContextData(context);
      setTimelineData(timeline);
    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gradients.neuroplasticity.start} />
      </View>
    );
  }

  if (!sessionData) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="pulse-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>No session data available</Text>
          <Text style={styles.emptySubtext}>Complete a focus session to see your brain state analysis</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format session times safely
  const formatSafeTime = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr.replace('Z', '+00:00'));
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'N/A';
    }
  };

  const sessionStart = contextData?.session_time?.start
    ? new Date(contextData.session_time.start.replace('Z', '+00:00'))
    : new Date();
  const sessionEnd = contextData?.session_time?.end
    ? new Date(contextData.session_time.end.replace('Z', '+00:00'))
    : new Date();

  const startTimeFormatted = formatSafeTime(contextData?.session_time?.start);
  const endTimeFormatted = formatSafeTime(contextData?.session_time?.end);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return colors.status.excellent;
      case 'very_good': return colors.status.good;
      case 'good': return colors.status.good;
      default: return colors.status.moderate;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Session Context Card */}
        {contextData && (
          <SessionContextCard
            startTime={startTimeFormatted}
            endTime={endTimeFormatted}
            duration={contextData.session_time?.duration_minutes || 40}
            postExerciseHours={contextData.context?.post_exercise_hours}
            circadianPhase={contextData.context?.circadian_phase || 'morning_peak'}
            peakMoments={contextData.performance?.peak_moments || 0}
            flowMinutes={contextData.performance?.flow_minutes}
          />
        )}

        {/* Daily Timeline Chart */}
        {timelineData && (
          <Card>
            <DailyBrainStateChart
              circadianBaseline={timelineData.circadian_baseline || []}
              sessionData={{
                startHour: timelineData.measured_session?.start_hour || 9,
                endHour: timelineData.measured_session?.end_hour || 10,
                lriValues: timelineData.measured_session?.lri_values || [],
              }}
              gammaPeaks={timelineData.gamma_peaks || []}
              events={timelineData.events || []}
            />
          </Card>
        )}

        {/* Session Metrics */}
        <Card>
          <Text style={styles.cardTitle}>Performance Breakdown</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{sessionData.peak_lri?.toFixed(0) || 0}</Text>
              <Text style={styles.metricLabel}>Peak Score</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {sessionData.time_in_state?.optimal_minutes?.toFixed(0) || 0}
              </Text>
              <Text style={styles.metricLabel}>Optimal Time</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{sessionData.session_score?.toFixed(0) || 0}</Text>
              <Text style={styles.metricLabel}>Session Score</Text>
            </View>
          </View>
        </Card>

        {/* Component Scores */}
        <Card>
          <Text style={styles.cardTitle}>Neural Components</Text>
          <View style={styles.componentList}>
            <View style={styles.componentRow}>
              <View style={styles.componentInfo}>
                <Ionicons name="eye-outline" size={20} color={colors.gradients.neuroplasticity.start} />
                <Text style={styles.componentLabel}>Alertness</Text>
              </View>
              <Text style={styles.componentValue}>
                {sessionData.component_scores?.alertness?.toFixed(0) || 0}
              </Text>
            </View>
            <View style={styles.componentRow}>
              <View style={styles.componentInfo}>
                <Ionicons name="bulb-outline" size={20} color={colors.gradients.currentNeuroState.start} />
                <Text style={styles.componentLabel}>Focus</Text>
              </View>
              <Text style={styles.componentValue}>
                {sessionData.component_scores?.focus?.toFixed(0) || 0}
              </Text>
            </View>
            <View style={styles.componentRow}>
              <View style={styles.componentInfo}>
                <Ionicons name="pulse-outline" size={20} color={colors.gradients.sleepConsolidation.start} />
                <Text style={styles.componentLabel}>Arousal Balance</Text>
              </View>
              <Text style={styles.componentValue}>
                {sessionData.component_scores?.arousal_balance?.toFixed(0) || 0}
              </Text>
            </View>
          </View>
        </Card>

        {/* Optimal Windows */}
        {sessionData.optimal_windows && sessionData.optimal_windows.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>Peak Moments Detected</Text>
            {sessionData.optimal_windows.map((window: any, idx: number) => {
              const startTime = formatSafeTime(window.start);
              const endTime = formatSafeTime(window.end);
              
              return (
                <View key={idx} style={styles.windowCard}>
                  <View style={styles.windowHeader}>
                    <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(window.quality) + '20' }]}>
                      <Text style={[styles.qualityText, { color: getQualityColor(window.quality) }]}>
                        {window.quality.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.windowDuration}>{window.duration_minutes?.toFixed(0)} min</Text>
                  </View>
                  <Text style={styles.windowTime}>
                    {startTime} - {endTime}
                  </Text>
                  <Text style={styles.windowLRI}>Avg Score: {window.avg_lri?.toFixed(0)}</Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Insights */}
        {sessionData.insights && sessionData.insights.length > 0 && (
          <Card style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Ionicons name="bulb" size={24} color={colors.gradients.currentNeuroState.start} />
              <Text style={styles.insightsTitle}>Insights</Text>
            </View>
            {sessionData.insights.map((insight: string, idx: number) => (
              <Text key={idx} style={styles.insightText}>
                • {insight}
              </Text>
            ))}
          </Card>
        )}

        {/* Recommendations */}
        {sessionData.recommendations && sessionData.recommendations.length > 0 && (
          <Card>
            <View style={styles.recommendationsHeader}>
              <Ionicons name="checkmark-circle" size={24} color={colors.status.excellent} />
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
            </View>
            {sessionData.recommendations.map((rec: string, idx: number) => (
              <Text key={idx} style={styles.recommendationText}>
                • {rec}
              </Text>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  cardTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  componentList: {
    gap: spacing.lg,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  componentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  componentLabel: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  componentValue: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  windowCard: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  qualityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.bold,
  },
  windowDuration: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  windowTime: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  windowLRI: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
  },
  insightsCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: colors.gradients.currentNeuroState.start,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  insightsTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  insightText: {
    fontSize: typography.sizes.bodySmall,
    lineHeight: 20,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recommendationsTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  recommendationText: {
    fontSize: typography.sizes.bodySmall,
    lineHeight: 20,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
});
