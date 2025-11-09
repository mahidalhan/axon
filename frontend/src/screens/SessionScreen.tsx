import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { api } from '../services/api';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SessionScreen() {
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    try {
      const data = await api.analyzeSession(0, 1.0);
      setSessionData(data);
    } catch (error) {
      console.error('Error loading session data:', error);
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

  if (!sessionData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pulse-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>No session data available</Text>
      </View>
    );
  }

  // Prepare chart data
  const chartData = sessionData.lri_timeline?.map((item: any) => ({
    value: item.lri,
    label: '',
  })) || [];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return '#10B981';
      case 'very_good': return '#22C55E';
      case 'good': return '#84CC16';
      default: return '#F59E0B';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Session Summary */}
        <Card>
          <Text style={styles.cardTitle}>Session Overview</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sessionData.session_duration_minutes?.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Minutes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sessionData.peak_lri?.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Peak LRI</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sessionData.session_score?.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Score</Text>
            </View>
          </View>
        </Card>

        {/* LRI Timeline Chart */}
        {chartData.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>LRI Timeline</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={width - 80}
                height={200}
                spacing={Math.max(1, (width - 80) / chartData.length)}
                color="#4F46E5"
                thickness={3}
                startFillColor="#4F46E5"
                endFillColor="#C7D2FE"
                startOpacity={0.4}
                endOpacity={0.1}
                initialSpacing={0}
                noOfSections={4}
                yAxisColor="#E5E7EB"
                xAxisColor="#E5E7EB"
                yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                hideRules={true}
                curved={true}
                areaChart={true}
              />
            </View>
            <View style={styles.thresholdLegend}>
              <View style={styles.thresholdItem}>
                <View style={[styles.thresholdDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.thresholdText}>Optimal (≥70)</Text>
              </View>
              <View style={styles.thresholdItem}>
                <View style={[styles.thresholdDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.thresholdText}>Moderate (40-70)</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Time in State */}
        <Card>
          <Text style={styles.cardTitle}>Time Distribution</Text>
          <View style={styles.timeInState}>
            <View style={styles.stateRow}>
              <View style={[styles.stateBar, { flex: sessionData.time_in_state?.optimal_minutes || 0, backgroundColor: '#10B981' }]} />
              <View style={[styles.stateBar, { flex: sessionData.time_in_state?.moderate_minutes || 0, backgroundColor: '#F59E0B' }]} />
              <View style={[styles.stateBar, { flex: sessionData.time_in_state?.low_minutes || 0.1, backgroundColor: '#EF4444' }]} />
            </View>
            <View style={styles.stateLabels}>
              <View style={styles.stateLabel}>
                <View style={[styles.stateDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.stateLabelText}>Optimal: {sessionData.time_in_state?.optimal_minutes?.toFixed(0)}m</Text>
              </View>
              <View style={styles.stateLabel}>
                <View style={[styles.stateDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.stateLabelText}>Moderate: {sessionData.time_in_state?.moderate_minutes?.toFixed(0)}m</Text>
              </View>
              <View style={styles.stateLabel}>
                <View style={[styles.stateDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.stateLabelText}>Low: {sessionData.time_in_state?.low_minutes?.toFixed(0)}m</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Optimal Windows */}
        {sessionData.optimal_windows?.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>Optimal Windows</Text>
            {sessionData.optimal_windows.map((window: any, index: number) => (
              <View key={index} style={styles.windowItem}>
                <View style={styles.windowHeader}>
                  <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(window.quality) + '20' }]}>
                    <Text style={[styles.qualityText, { color: getQualityColor(window.quality) }]}>
                      {window.quality.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.windowDuration}>{window.duration_minutes?.toFixed(0)} min</Text>
                </View>
                <Text style={styles.windowAvgLri}>Avg LRI: {window.avg_lri?.toFixed(0)}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Component Scores */}
        <Card>
          <Text style={styles.cardTitle}>Component Scores</Text>
          <View style={styles.componentScores}>
            <View style={styles.componentScore}>
              <Ionicons name="eye-outline" size={24} color="#6366F1" />
              <Text style={styles.componentLabel}>Alertness</Text>
              <Text style={styles.componentValue}>{sessionData.component_scores?.alertness?.toFixed(0)}</Text>
            </View>
            <View style={styles.componentScore}>
              <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
              <Text style={styles.componentLabel}>Focus</Text>
              <Text style={styles.componentValue}>{sessionData.component_scores?.focus?.toFixed(0)}</Text>
            </View>
            <View style={styles.componentScore}>
              <Ionicons name="pulse-outline" size={24} color="#10B981" />
              <Text style={styles.componentLabel}>Balance</Text>
              <Text style={styles.componentValue}>{sessionData.component_scores?.arousal_balance?.toFixed(0)}</Text>
            </View>
          </View>
        </Card>

        {/* Insights */}
        {sessionData.insights?.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>Insights</Text>
            {sessionData.insights.map((insight: string, index: number) => (
              <View key={index} style={styles.insightItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Recommendations */}
        {sessionData.recommendations?.length > 0 && (
          <Card style={styles.recommendationCard}>
            <Text style={styles.cardTitle}>Recommendations</Text>
            {sessionData.recommendations.map((rec: string, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="bulb" size={20} color="#F59E0B" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  chartContainer: {
    marginVertical: 8,
  },
  thresholdLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  thresholdItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thresholdDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  thresholdText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeInState: {
    gap: 16,
  },
  stateRow: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stateBar: {
    height: '100%',
  },
  stateLabels: {
    gap: 8,
  },
  stateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  stateLabelText: {
    fontSize: 14,
    color: '#6B7280',
  },
  windowItem: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  windowDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  windowAvgLri: {
    fontSize: 14,
    color: '#6B7280',
  },
  componentScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  componentScore: {
    alignItems: 'center',
    gap: 8,
  },
  componentLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  componentValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    fontWeight: '500',
  },
});
